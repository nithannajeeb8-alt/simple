import { db } from './db';
import { toDateString, getMonthStart, getMonthEnd, getCurrentMonth } from './utils';

// Calculate account balance
export async function calculateAccountBalance(accountId) {
  const account = await db.accounts.get(accountId);
  if (!account) return 0;

  let balance = account.openingBalance || 0;
  const transactions = await db.transactions.toArray();

  for (const t of transactions) {
    if (t.accountId === accountId) {
      switch (t.type) {
        case 'income':
        case 'refund':
        case 'debt_repayment_received':
          balance += t.amount;
          break;
        case 'expense':
        case 'debt_repayment_made':
        case 'transfer':
          balance -= t.amount;
          break;
      }
    }
    if (t.toAccountId === accountId && t.type === 'transfer') {
      balance += t.amount;
    }
  }

  return balance;
}

// Calculate all account balances
export async function calculateAllBalances() {
  const accounts = await db.accounts.where('archived').notEqual(1).toArray();
  const transactions = await db.transactions.toArray();
  const result = {};

  for (const account of accounts) {
    let balance = account.openingBalance || 0;
    for (const t of transactions) {
      if (t.accountId === account.id) {
        switch (t.type) {
          case 'income':
          case 'refund':
          case 'debt_repayment_received':
            balance += t.amount;
            break;
          case 'expense':
          case 'debt_repayment_made':
          case 'transfer':
            balance -= t.amount;
            break;
        }
      }
      if (t.toAccountId === account.id && t.type === 'transfer') {
        balance += t.amount;
      }
    }
    result[account.id] = balance;
  }

  return result;
}

// Monthly summaries
export async function getMonthlyStats(monthStr) {
  const month = monthStr || getCurrentMonth();
  const [year, mon] = month.split('-').map(Number);
  const start = toDateString(new Date(year, mon - 1, 1));
  const end = toDateString(new Date(year, mon, 0));

  const transactions = await db.transactions.toArray();
  const monthTxns = transactions.filter(t => t.date >= start && t.date <= end);

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const t of monthTxns) {
    switch (t.type) {
      case 'income':
        totalIncome += t.amount;
        break;
      case 'expense':
        totalExpenses += t.amount;
        break;
      case 'refund':
        totalExpenses -= t.amount; // Refund reduces expenses
        break;
    }
  }

  return {
    totalIncome,
    totalExpenses: Math.max(0, totalExpenses),
    netCashFlow: totalIncome - totalExpenses,
    transactionCount: monthTxns.length
  };
}

// Budget calculations
export async function getBudgetStatus(monthStr) {
  const month = monthStr || getCurrentMonth();
  const [year, mon] = month.split('-').map(Number);
  const start = toDateString(new Date(year, mon - 1, 1));
  const end = toDateString(new Date(year, mon, 0));

  const budgetSetting = await db.settings.get('monthlyBudget');
  const monthlyBudget = budgetSetting?.value || 0;

  const transactions = await db.transactions.toArray();
  const monthExpenses = transactions.filter(t =>
    t.date >= start && t.date <= end && (t.type === 'expense')
  );
  const monthRefunds = transactions.filter(t =>
    t.date >= start && t.date <= end && t.type === 'refund'
  );

  const totalSpent = monthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const totalRefunds = monthRefunds.reduce((sum, t) => sum + t.amount, 0);
  const netSpent = Math.max(0, totalSpent - totalRefunds);

  const remaining = monthlyBudget - netSpent;
  const percentage = monthlyBudget > 0 ? Math.min(100, (netSpent / monthlyBudget) * 100) : 0;

  return {
    budget: monthlyBudget,
    spent: netSpent,
    remaining,
    percentage,
    isOverBudget: remaining < 0,
    isWarning: percentage >= 80
  };
}

// Category budget calculations
export async function getCategoryBudgets(monthStr) {
  const month = monthStr || getCurrentMonth();
  const [year, mon] = month.split('-').map(Number);
  const start = toDateString(new Date(year, mon - 1, 1));
  const end = toDateString(new Date(year, mon, 0));

  const budgets = await db.budgets.where('month').equals(month).toArray();
  const transactions = await db.transactions.toArray();
  const activities = await db.activities.toArray();

  return budgets.filter(b => b.type === 'category').map(budget => {
    const spent = transactions
      .filter(t => t.date >= start && t.date <= end && t.activityId === budget.activityId && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const refunds = transactions
      .filter(t => t.date >= start && t.date <= end && t.activityId === budget.activityId && t.type === 'refund')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSpent = Math.max(0, spent - refunds);
    const remaining = budget.amount - netSpent;
    const percentage = budget.amount > 0 ? Math.min(100, (netSpent / budget.amount) * 100) : 0;
    const activity = activities.find(a => a.id === budget.activityId);

    return {
      ...budget,
      activityName: activity?.name || 'Unknown',
      activityIcon: activity?.icon || 'circle',
      spent: netSpent,
      remaining,
      percentage,
      isOverBudget: remaining < 0,
      isWarning: percentage >= 80
    };
  });
}

// Spending by category
export async function getSpendingByCategory(startDate, endDate) {
  const start = toDateString(startDate || getMonthStart());
  const end = toDateString(endDate || new Date());

  const transactions = await db.transactions.toArray();
  const activities = await db.activities.toArray();

  const expenses = transactions.filter(t =>
    t.date >= start && t.date <= end && t.type === 'expense'
  );

  const byCategory = {};
  for (const t of expenses) {
    const activity = activities.find(a => a.id === t.activityId);
    const name = activity?.name || 'Other';
    if (!byCategory[name]) {
      byCategory[name] = { name, icon: activity?.icon || 'circle', total: 0, count: 0 };
    }
    byCategory[name].total += t.amount;
    byCategory[name].count++;
  }

  return Object.values(byCategory).sort((a, b) => b.total - a.total);
}

// Spending over time (for charts)
export async function getSpendingOverTime(period = 'month') {
  const transactions = await db.transactions.toArray();
  const now = new Date();
  let start, groupFn;

  switch (period) {
    case 'week': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(now.getFullYear(), now.getMonth(), diff);
      groupFn = (d) => d;
      break;
    }
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      groupFn = (d) => d;
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      groupFn = (d) => d.substring(0, 7); // Group by month
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      groupFn = (d) => d;
  }

  const startStr = toDateString(start);
  const expenses = transactions.filter(t =>
    t.date >= startStr && t.type === 'expense'
  );

  const grouped = {};
  for (const t of expenses) {
    const key = groupFn(t.date);
    grouped[key] = (grouped[key] || 0) + t.amount;
  }

  return Object.entries(grouped)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Debt summaries
export async function getDebtSummary() {
  const debts = await db.debts.toArray();

  let totalLent = 0;
  let totalBorrowed = 0;
  let totalLentOutstanding = 0;
  let totalBorrowedOutstanding = 0;

  for (const d of debts) {
    const outstanding = d.amount - (d.amountRepaid || 0);
    if (d.direction === 'lent') {
      totalLent += d.amount;
      if (!d.settled) totalLentOutstanding += outstanding;
    } else {
      totalBorrowed += d.amount;
      if (!d.settled) totalBorrowedOutstanding += outstanding;
    }
  }

  return {
    totalLent,
    totalBorrowed,
    totalLentOutstanding,
    totalBorrowedOutstanding,
    activeDebts: debts.filter(d => !d.settled),
    settledDebts: debts.filter(d => d.settled),
  };
}

// Generate alerts
export async function generateAlerts() {
  const alerts = [];
  const settings = {};
  (await db.settings.toArray()).forEach(s => { settings[s.key] = s.value; });

  // Budget alerts
  if (settings.budgetWarningsEnabled !== false) {
    const budgetStatus = await getBudgetStatus();
    const threshold = settings.budgetWarningThreshold || 80;

    if (budgetStatus.isOverBudget) {
      alerts.push({
        type: 'budget',
        severity: 'danger',
        title: 'Budget Exceeded!',
        message: `You've exceeded your monthly budget by ₹${Math.abs(budgetStatus.remaining).toLocaleString('en-IN')}.`,
        icon: 'alert-triangle'
      });
    } else if (budgetStatus.percentage >= threshold && budgetStatus.budget > 0) {
      alerts.push({
        type: 'budget',
        severity: 'warning',
        title: 'Budget Alert',
        message: `You've used ${budgetStatus.percentage.toFixed(0)}% of your monthly budget.`,
        icon: 'alert-circle'
      });
    }
  }

  // Bill reminders
  if (settings.billAlertsEnabled !== false) {
    const reminders = await db.reminders.where('completed').equals(0).toArray();
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    for (const r of reminders) {
      const rDate = new Date(r.date);
      if (rDate <= nextWeek && rDate >= now) {
        alerts.push({
          type: 'bill',
          severity: 'info',
          title: 'Upcoming Bill',
          message: `${r.description} — ₹${r.amount.toLocaleString('en-IN')} due on ${rDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.`,
          icon: 'calendar'
        });
      } else if (rDate < now) {
        alerts.push({
          type: 'bill',
          severity: 'warning',
          title: 'Overdue Bill',
          message: `${r.description} — ₹${r.amount.toLocaleString('en-IN')} was due on ${rDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.`,
          icon: 'alert-circle'
        });
      }
    }
  }

  // Debt reminders
  if (settings.debtRemindersEnabled !== false) {
    const debts = await db.debts.where('settled').equals(0).toArray();
    const now = new Date();

    for (const d of debts) {
      if (d.expectedDate) {
        const expDate = new Date(d.expectedDate);
        const daysUntil = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
        const outstanding = d.amount - (d.amountRepaid || 0);

        if (daysUntil < 0) {
          alerts.push({
            type: 'debt',
            severity: 'warning',
            title: `Overdue: ${d.personName}`,
            message: `${d.direction === 'lent' ? 'Collection' : 'Repayment'} of ₹${outstanding.toLocaleString('en-IN')} is overdue.`,
            icon: 'clock'
          });
        } else if (daysUntil <= 7) {
          alerts.push({
            type: 'debt',
            severity: 'info',
            title: `Upcoming: ${d.personName}`,
            message: `${d.direction === 'lent' ? 'Collection' : 'Repayment'} of ₹${outstanding.toLocaleString('en-IN')} due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}.`,
            icon: 'clock'
          });
        }
      }
    }
  }

  // Goal progress
  if (settings.goalAlertsEnabled !== false) {
    const goals = await db.goals.where('completed').equals(0).toArray();
    for (const g of goals) {
      const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
      if (progress >= 90 && progress < 100) {
        alerts.push({
          type: 'goal',
          severity: 'success',
          title: 'Almost There!',
          message: `Your "${g.name}" goal is ${progress.toFixed(0)}% complete!`,
          icon: 'target'
        });
      }
    }
  }

  return alerts;
}
