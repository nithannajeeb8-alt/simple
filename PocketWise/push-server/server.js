/* Optional PocketWise background reminder sender. Deploy separately over HTTPS. */
'use strict';
const express = require('express');
const webpush = require('web-push');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT || 8787);
const APP_ORIGIN = process.env.APP_ORIGIN;
const APP_URL = process.env.APP_URL;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');
const PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const SUBJECT = process.env.VAPID_SUBJECT;
if (!APP_ORIGIN || !APP_URL || !PUBLIC_KEY || !PRIVATE_KEY || !SUBJECT) {
  throw new Error('Set APP_ORIGIN, APP_URL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_SUBJECT before starting the push server.');
}
webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY);

const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && origin === APP_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', APP_ORIGIN);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(origin === APP_ORIGIN ? 204 : 403);
  if (origin && origin !== APP_ORIGIN) return res.sendStatus(403);
  next();
});
app.use(express.json({ limit: '256kb' }));

function readStore() {
  try {
    const value = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    return value && value.installations ? value : { installations: {} };
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Could not read push data file:', error.message);
    return { installations: {} };
  }
}
let store = readStore();
function saveStore() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  const temporary = `${DATA_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(store), { mode: 0o600 });
  fs.renameSync(temporary, DATA_FILE);
}
function isToken(value) { return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value); }
function getInstallation(token) { return isToken(token) ? store.installations[token] : null; }
function checkToken(req, res) {
  const token = req.body && req.body.installationToken;
  if (!isToken(token)) { res.status(400).json({ error: 'Invalid installation token.' }); return null; }
  return token;
}
app.get('/health', (_req, res) => res.json({ ok: true, service: 'pocketwise-push' }));
app.get('/api/push/public-key', (_req, res) => res.set('Cache-Control', 'no-store').json({ publicKey: PUBLIC_KEY }));
app.post('/api/push/subscribe', (req, res) => {
  const token = checkToken(req, res); if (!token) return;
  const sub = req.body.subscription;
  if (!sub || typeof sub.endpoint !== 'string' || !sub.endpoint.startsWith('https://') || !sub.keys || typeof sub.keys.p256dh !== 'string' || typeof sub.keys.auth !== 'string') {
    return res.status(400).json({ error: 'Invalid Web Push subscription.' });
  }
  const installation = store.installations[token] || { subscriptions: {}, reminders: [], sent: {} };
  installation.subscriptions[sub.endpoint] = sub;
  store.installations[token] = installation;
  saveStore();
  return res.status(201).json({ ok: true });
});
app.post('/api/push/reminders', (req, res) => {
  const token = checkToken(req, res); if (!token) return;
  const installation = getInstallation(token);
  if (!installation || !Object.keys(installation.subscriptions || {}).length) return res.status(409).json({ error: 'Subscribe this device before syncing reminders.' });
  if (!Array.isArray(req.body.reminders) || req.body.reminders.length > 5000) return res.status(400).json({ error: 'Reminder schedule must be an array of at most 5000 entries.' });
  const now = Date.now();
  const seen = new Set();
  const reminders = [];
  for (const item of req.body.reminders) {
    if (!item || typeof item.id !== 'string' || item.id.length > 180 || typeof item.title !== 'string' || !item.title.trim() || item.title.length > 100) continue;
    const scheduled = Date.parse(item.scheduledAt);
    if (!Number.isFinite(scheduled) || scheduled > now + 367 * 86400000) continue;
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    if (installation.sent && installation.sent[item.id]) continue;
    reminders.push({ id: item.id, title: item.title.trim(), scheduledAt: new Date(Math.max(now, scheduled)).toISOString() });
  }
  installation.reminders = reminders;
  installation.sent = installation.sent || {};
  saveStore();
  return res.json({ ok: true, scheduled: reminders.length });
});

async function deliverDueReminders() {
  const now = Date.now();
  let changed = false;
  for (const [token, installation] of Object.entries(store.installations)) {
    installation.sent = installation.sent || {};
    // Forget old dedupe keys after 30 days to keep the data file compact.
    for (const [id, sentAt] of Object.entries(installation.sent)) if (now - Number(sentAt) > 30 * 86400000) delete installation.sent[id];
    const due = (installation.reminders || []).filter(item => Date.parse(item.scheduledAt) <= now);
    if (!due.length) continue;
    if (!Object.keys(installation.subscriptions || {}).length) {
      installation.reminders = [];
      changed = true;
      continue;
    }
    const pending = (installation.reminders || []).filter(item => Date.parse(item.scheduledAt) > now);
    for (const reminder of due) {
      if (installation.sent[reminder.id]) continue;
      const payload = JSON.stringify({
        title: reminder.title,
        body: 'A PocketWise payment reminder is due today.',
        tag: `pocketwise-${crypto.createHash('sha256').update(reminder.id).digest('hex').slice(0, 24)}`,
        url: APP_URL
      });
      let delivered = false;
      let retryableFailure = false;
      for (const [endpoint, subscription] of Object.entries(installation.subscriptions || {})) {
        try {
          await webpush.sendNotification(subscription, payload, { TTL: 3600 });
          delivered = true;
        } catch (error) {
          const code = Number(error.statusCode || error.status);
          if (code === 404 || code === 410) delete installation.subscriptions[endpoint];
          else { retryableFailure = true; console.error('Web Push delivery failed:', code || error.message); }
        }
      }
      if (delivered) {
        installation.sent[reminder.id] = now;
        changed = true;
      } else if (retryableFailure && Object.keys(installation.subscriptions || {}).length) {
        // Retry a transient delivery failure in five minutes instead of silently dropping it.
        pending.push({ ...reminder, scheduledAt: new Date(now + 5 * 60000).toISOString() });
        changed = true;
      }
    }
    installation.reminders = pending.filter(item => !installation.sent[item.id]);
    if (!Object.keys(installation.subscriptions || {}).length) installation.reminders = [];
  }
  if (changed) saveStore();
}
setInterval(() => { deliverDueReminders().catch(error => console.error('Reminder delivery loop failed:', error)); }, 15000).unref();
app.listen(PORT, () => console.log(`PocketWise push server listening on ${PORT}`));
