import Dexie from 'dexie';

export const db = new Dexie('PocketwiseDB');

db.version(1).stores({
  profile: '++id',
  accounts: '++id, name, type, archived',
  activities: '++id, name, type, archived',
  transactions: '++id, type, date, activityId, accountId, toAccountId, debtId',
  budgets: '++id, type, activityId, month',
  debts: '++id, personName, direction, settled',
  reminders: '++id, date, recurrence',
  goals: '++id, name, completed',
  goalContributions: '++id, goalId, date',
  settings: 'key',
  notifications: '++id, type, read, createdAt',
  sampleFlag: 'key'
});

// Default activities
const DEFAULT_ACTIVITIES = [
  { name: 'Food & Dining', icon: 'utensils', type: 'expense', archived: 0, order: 1 },
  { name: 'Transportation', icon: 'car', type: 'expense', archived: 0, order: 2 },
  { name: 'Shopping', icon: 'shopping-bag', type: 'expense', archived: 0, order: 3 },
  { name: 'Entertainment', icon: 'film', type: 'expense', archived: 0, order: 4 },
  { name: 'Bills & Utilities', icon: 'zap', type: 'expense', archived: 0, order: 5 },
  { name: 'Health', icon: 'heart', type: 'expense', archived: 0, order: 6 },
  { name: 'Education', icon: 'book-open', type: 'expense', archived: 0, order: 7 },
  { name: 'Groceries', icon: 'shopping-cart', type: 'expense', archived: 0, order: 8 },
  { name: 'Rent', icon: 'home', type: 'expense', archived: 0, order: 9 },
  { name: 'Insurance', icon: 'shield', type: 'expense', archived: 0, order: 10 },
  { name: 'Personal Care', icon: 'smile', type: 'expense', archived: 0, order: 11 },
  { name: 'Gifts', icon: 'gift', type: 'expense', archived: 0, order: 12 },
  { name: 'Travel', icon: 'plane', type: 'expense', archived: 0, order: 13 },
  { name: 'Subscriptions', icon: 'repeat', type: 'expense', archived: 0, order: 14 },
  { name: 'Other Expense', icon: 'more-horizontal', type: 'expense', archived: 0, order: 15 },
  { name: 'Salary', icon: 'briefcase', type: 'income', archived: 0, order: 16 },
  { name: 'Freelance', icon: 'laptop', type: 'income', archived: 0, order: 17 },
  { name: 'Investment', icon: 'trending-up', type: 'income', archived: 0, order: 18 },
  { name: 'Refund', icon: 'rotate-ccw', type: 'income', archived: 0, order: 19 },
  { name: 'Other Income', icon: 'plus-circle', type: 'income', archived: 0, order: 20 },
];

const DEFAULT_ACCOUNTS = [
  { name: 'Cash', type: 'cash', openingBalance: 0, archived: 0, createdAt: new Date().toISOString() },
  { name: 'Bank Account', type: 'bank', openingBalance: 0, archived: 0, createdAt: new Date().toISOString() },
];

export async function initializeDatabase() {
  const profileCount = await db.profile.count();
  if (profileCount === 0) {
    await db.profile.add({
      name: 'User',
      avatarBg: '#7c3aed',
      createdAt: new Date().toISOString(),
      tourCompleted: false
    });
  }

  const actCount = await db.activities.count();
  if (actCount === 0) {
    await db.activities.bulkAdd(DEFAULT_ACTIVITIES.map(a => ({
      ...a,
      createdAt: new Date().toISOString()
    })));
  }

  const accCount = await db.accounts.count();
  if (accCount === 0) {
    await db.accounts.bulkAdd(DEFAULT_ACCOUNTS);
  }

  // Default settings
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.bulkAdd([
      { key: 'theme', value: 'dark' },
      { key: 'hideBalances', value: false },
      { key: 'budgetWarningThreshold', value: 80 },
      { key: 'budgetWarningsEnabled', value: true },
      { key: 'billAlertsEnabled', value: true },
      { key: 'debtRemindersEnabled', value: true },
      { key: 'weeklySummaryEnabled', value: true },
      { key: 'goalAlertsEnabled', value: true },
      { key: 'quietHoursStart', value: '22:00' },
      { key: 'quietHoursEnd', value: '07:00' },
      { key: 'notificationsPermission', value: 'default' },
      { key: 'monthlyBudget', value: 0 },
    ]);
  }
}

// Sample data generation
export async function loadSampleData() {
  const flag = await db.sampleFlag.get('loaded');
  if (flag) return;

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  // Add sample accounts with balances
  const accounts = await db.accounts.toArray();
  const cashAcc = accounts.find(a => a.type === 'cash');
  const bankAcc = accounts.find(a => a.type === 'bank');

  if (cashAcc) await db.accounts.update(cashAcc.id, { openingBalance: 5000 });
  if (bankAcc) await db.accounts.update(bankAcc.id, { openingBalance: 50000 });

  // Add a savings account
  const savingsId = await db.accounts.add({
    name: 'Savings', type: 'savings', openingBalance: 100000,
    archived: 0, createdAt: new Date().toISOString()
  });

  const activities = await db.activities.toArray();
  const getAct = (name) => activities.find(a => a.name === name)?.id || activities[0].id;

  const sampleTransactions = [
    { type: 'income', amount: 75000, date: new Date(thisYear, thisMonth, 1).toISOString().split('T')[0], activityId: getAct('Salary'), accountId: bankAcc?.id, note: 'Monthly salary', isSample: true },
    { type: 'expense', amount: 15000, date: new Date(thisYear, thisMonth, 2).toISOString().split('T')[0], activityId: getAct('Rent'), accountId: bankAcc?.id, note: 'Monthly rent', isSample: true },
    { type: 'expense', amount: 3500, date: new Date(thisYear, thisMonth, 3).toISOString().split('T')[0], activityId: getAct('Groceries'), accountId: cashAcc?.id, note: 'Weekly groceries', isSample: true },
    { type: 'expense', amount: 1200, date: new Date(thisYear, thisMonth, 5).toISOString().split('T')[0], activityId: getAct('Transportation'), accountId: bankAcc?.id, note: 'Fuel', isSample: true },
    { type: 'expense', amount: 800, date: new Date(thisYear, thisMonth, 7).toISOString().split('T')[0], activityId: getAct('Entertainment'), accountId: cashAcc?.id, note: 'Movie night', isSample: true },
    { type: 'expense', amount: 2500, date: new Date(thisYear, thisMonth, 8).toISOString().split('T')[0], activityId: getAct('Food & Dining'), accountId: bankAcc?.id, note: 'Restaurant dinner', isSample: true },
    { type: 'expense', amount: 999, date: new Date(thisYear, thisMonth, 10).toISOString().split('T')[0], activityId: getAct('Subscriptions'), accountId: bankAcc?.id, note: 'Streaming subscription', isSample: true },
    { type: 'expense', amount: 4500, date: new Date(thisYear, thisMonth, 12).toISOString().split('T')[0], activityId: getAct('Shopping'), accountId: bankAcc?.id, note: 'New clothes', isSample: true },
    { type: 'expense', amount: 1500, date: new Date(thisYear, thisMonth, 14).toISOString().split('T')[0], activityId: getAct('Health'), accountId: bankAcc?.id, note: 'Doctor visit', isSample: true },
    { type: 'income', amount: 12000, date: new Date(thisYear, thisMonth, 15).toISOString().split('T')[0], activityId: getAct('Freelance'), accountId: bankAcc?.id, note: 'Project payment', isSample: true },
    { type: 'transfer', amount: 20000, date: new Date(thisYear, thisMonth, 16).toISOString().split('T')[0], activityId: null, accountId: bankAcc?.id, toAccountId: savingsId, note: 'Monthly savings transfer', isSample: true },
    { type: 'expense', amount: 650, date: new Date(thisYear, thisMonth, 18).toISOString().split('T')[0], activityId: getAct('Personal Care'), accountId: cashAcc?.id, note: 'Haircut', isSample: true },
    { type: 'expense', amount: 2000, date: new Date(thisYear, thisMonth, 19).toISOString().split('T')[0], activityId: getAct('Bills & Utilities'), accountId: bankAcc?.id, note: 'Electricity bill', isSample: true },
    { type: 'expense', amount: 3200, date: new Date(thisYear, thisMonth, 20).toISOString().split('T')[0], activityId: getAct('Groceries'), accountId: cashAcc?.id, note: 'Weekly groceries', isSample: true },
  ];

  for (const t of sampleTransactions) {
    await db.transactions.add({
      ...t,
      createdAt: new Date().toISOString()
    });
  }

  // Sample budget
  await db.settings.put({ key: 'monthlyBudget', value: 40000 });

  // Sample category budgets
  await db.budgets.bulkAdd([
    { type: 'category', activityId: getAct('Food & Dining'), amount: 5000, month: `${thisYear}-${String(thisMonth + 1).padStart(2, '0')}`, createdAt: new Date().toISOString() },
    { type: 'category', activityId: getAct('Transportation'), amount: 3000, month: `${thisYear}-${String(thisMonth + 1).padStart(2, '0')}`, createdAt: new Date().toISOString() },
    { type: 'category', activityId: getAct('Shopping'), amount: 5000, month: `${thisYear}-${String(thisMonth + 1).padStart(2, '0')}`, createdAt: new Date().toISOString() },
    { type: 'category', activityId: getAct('Entertainment'), amount: 2000, month: `${thisYear}-${String(thisMonth + 1).padStart(2, '0')}`, createdAt: new Date().toISOString() },
  ]);

  // Sample debt
  await db.debts.add({
    personName: 'Rahul',
    direction: 'lent',
    amount: 5000,
    amountRepaid: 2000,
    date: new Date(thisYear, thisMonth, 5).toISOString().split('T')[0],
    expectedDate: new Date(thisYear, thisMonth + 1, 5).toISOString().split('T')[0],
    note: 'Lent for emergency',
    accountId: cashAcc?.id,
    settled: 0,
    createdAt: new Date().toISOString(),
    isSample: true
  });

  await db.debts.add({
    personName: 'Priya',
    direction: 'borrowed',
    amount: 3000,
    amountRepaid: 0,
    date: new Date(thisYear, thisMonth, 10).toISOString().split('T')[0],
    expectedDate: new Date(thisYear, thisMonth + 1, 10).toISOString().split('T')[0],
    note: 'Borrowed for shopping',
    accountId: bankAcc?.id,
    settled: 0,
    createdAt: new Date().toISOString(),
    isSample: true
  });

  // Sample reminders
  await db.reminders.bulkAdd([
    { description: 'Electricity Bill', amount: 2000, date: new Date(thisYear, thisMonth + 1, 5).toISOString().split('T')[0], recurrence: 'monthly', activityId: getAct('Bills & Utilities'), accountId: bankAcc?.id, completed: 0, createdAt: new Date().toISOString(), isSample: true },
    { description: 'Netflix Subscription', amount: 649, date: new Date(thisYear, thisMonth + 1, 15).toISOString().split('T')[0], recurrence: 'monthly', activityId: getAct('Subscriptions'), accountId: bankAcc?.id, completed: 0, createdAt: new Date().toISOString(), isSample: true },
    { description: 'Insurance Premium', amount: 12000, date: new Date(thisYear, thisMonth + 2, 1).toISOString().split('T')[0], recurrence: 'yearly', activityId: getAct('Insurance'), accountId: bankAcc?.id, completed: 0, createdAt: new Date().toISOString(), isSample: true },
  ]);

  // Sample goal
  await db.goals.add({
    name: 'Emergency Fund',
    targetAmount: 200000,
    currentAmount: 85000,
    completed: 0,
    createdAt: new Date().toISOString(),
    isSample: true
  });

  await db.goals.add({
    name: 'New Laptop',
    targetAmount: 80000,
    currentAmount: 32000,
    completed: 0,
    createdAt: new Date().toISOString(),
    isSample: true
  });

  await db.sampleFlag.put({ key: 'loaded', value: true });
}

export async function clearSampleData() {
  const txns = await db.transactions.filter(t => t.isSample).toArray();
  await db.transactions.bulkDelete(txns.map(t => t.id));

  const debts = await db.debts.filter(d => d.isSample).toArray();
  await db.debts.bulkDelete(debts.map(d => d.id));

  const reminders = await db.reminders.filter(r => r.isSample).toArray();
  await db.reminders.bulkDelete(reminders.map(r => r.id));

  const goals = await db.goals.filter(g => g.isSample).toArray();
  await db.goals.bulkDelete(goals.map(g => g.id));

  // Reset account balances
  const accounts = await db.accounts.toArray();
  for (const acc of accounts) {
    if (acc.type === 'cash') await db.accounts.update(acc.id, { openingBalance: 0 });
    if (acc.type === 'bank') await db.accounts.update(acc.id, { openingBalance: 0 });
    if (acc.type === 'savings') await db.accounts.delete(acc.id);
  }

  await db.budgets.clear();
  await db.settings.put({ key: 'monthlyBudget', value: 0 });
  await db.sampleFlag.delete('loaded');
}

// Full backup
export async function createBackup() {
  const data = {
    format: 'pocketwise-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: await db.profile.toArray(),
    accounts: await db.accounts.toArray(),
    activities: await db.activities.toArray(),
    transactions: await db.transactions.toArray(),
    budgets: await db.budgets.toArray(),
    debts: await db.debts.toArray(),
    reminders: await db.reminders.toArray(),
    goals: await db.goals.toArray(),
    goalContributions: await db.goalContributions.toArray(),
    settings: await db.settings.toArray(),
    sampleFlag: await db.sampleFlag.toArray(),
  };
  return JSON.stringify(data, null, 2);
}

export async function restoreBackup(jsonString, merge = false) {
  let data;
  try {
    data = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON file');
  }

  if (data.format !== 'pocketwise-backup' || !data.version) {
    throw new Error('Invalid backup format');
  }

  if (!data.transactions || !data.accounts || !data.activities) {
    throw new Error('Backup is missing required data');
  }

  if (!merge) {
    // Clear all existing data
    await db.transactions.clear();
    await db.accounts.clear();
    await db.activities.clear();
    await db.budgets.clear();
    await db.debts.clear();
    await db.reminders.clear();
    await db.goals.clear();
    await db.goalContributions.clear();
    await db.settings.clear();
    await db.profile.clear();
    await db.sampleFlag.clear();
  }

  // Restore data
  const tables = ['profile', 'accounts', 'activities', 'transactions', 'budgets', 'debts', 'reminders', 'goals', 'goalContributions', 'settings', 'sampleFlag'];

  for (const table of tables) {
    if (data[table] && Array.isArray(data[table])) {
      if (merge) {
        for (const item of data[table]) {
          try {
            await db[table].put(item);
          } catch { /* skip duplicates */ }
        }
      } else {
        // Strip IDs for auto-increment tables to avoid conflicts
        const autoIncrementTables = ['profile', 'accounts', 'activities', 'transactions', 'budgets', 'debts', 'reminders', 'goals', 'goalContributions', 'notifications'];
        if (autoIncrementTables.includes(table)) {
          // Keep original IDs for referential integrity
          await db[table].bulkPut(data[table]);
        } else {
          await db[table].bulkPut(data[table]);
        }
      }
    }
  }
}

export async function resetWorkspace() {
  await db.transactions.clear();
  await db.accounts.clear();
  await db.activities.clear();
  await db.budgets.clear();
  await db.debts.clear();
  await db.reminders.clear();
  await db.goals.clear();
  await db.goalContributions.clear();
  await db.notifications.clear();
  await db.sampleFlag.clear();
  // Re-initialize defaults
  await db.accounts.bulkAdd(DEFAULT_ACCOUNTS);
  await db.activities.bulkAdd(DEFAULT_ACTIVITIES.map(a => ({
    ...a, createdAt: new Date().toISOString()
  })));
  await db.settings.put({ key: 'monthlyBudget', value: 0 });
}
