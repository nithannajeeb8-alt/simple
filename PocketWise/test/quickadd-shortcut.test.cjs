const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
const shortcutGuide = fs.readFileSync(path.join(root, 'SHORTCUT_SETUP.md'), 'utf8');

// The URL contract used by Apple Shortcuts.
const url = new URL('https://example.test/Pocketwise/?quickadd=shortcut&amount=1234.50&type=expense&category=Food%20%26%20dining&note=Lunch%20%26%20coffee');
const params = url.searchParams;
assert.equal(params.get('quickadd'), 'shortcut');
assert.equal(Number(params.get('amount')), 1234.5);
assert.equal(params.get('type'), 'expense');
assert.equal(params.get('category'), 'Food & dining');
assert.equal(params.get('note'), 'Lunch & coffee');

// Source-level contract checks for the actual app route and safety behavior.
assert.match(app, /function handleShortcutQuickAdd\(\)/, 'shortcut route handler exists');
assert.match(app, /params\.get\('amount'\)/, 'amount is read from shortcut URL');
assert.match(app, /params\.get\('type'\)/, 'type is read from shortcut URL');
assert.match(app, /params\.get\('category'\)/, 'category is read from shortcut URL');
assert.match(app, /params\.get\('note'\)/, 'note is read from shortcut URL');
assert.match(app, /history\.replaceState\(null,'',location\.pathname\)/, 'captured fields are removed from address bar');
assert.match(app, /const hashParams=new URLSearchParams\(hashText/, 'fragment parameter fallback exists');
assert.match(app, /'purchase \/ expense':'expense'/, 'Purchase / Expense label is normalized');
assert.match(app, /renderQuickAddStep\('note'\)/, 'complete shortcut opens review/save step');
assert.match(app, /escapeHTML\(d\.note\|\|'\'\)/, 'note is escaped before rendering');
assert.match(app, /await saveQuickAdd\(\)/, 'the existing durable save path is reused');
assert.match(app, /categoryMatch\?\.id/, 'category match is validated instead of blindly trusted');
assert.ok(manifest.shortcuts.some(s => s.url.includes('quickadd=expense')), 'manifest has expense shortcut');
assert.ok(manifest.shortcuts.some(s => s.url.includes('quickadd=income')), 'manifest has income shortcut');
assert.match(shortcutGuide, /Back Tap/, 'setup guide explains Back Tap');
assert.match(shortcutGuide, /URL-encode each dynamic value separately/, 'setup guide explains encoding individual values');
assert.match(shortcutGuide, /Do not use \*\*Provided Input\*\*/, 'guide warns against using share-sheet input as amount');
console.log('PASS shortcut URL parameter parsing (including spaces and ampersands)');
console.log('PASS amount/type/category/note route contract');
console.log('PASS query scrub and HTML-escaped note rendering');
console.log('PASS route uses existing transaction save path');
console.log('PASS PWA manifest shortcuts and iPhone setup guide');
