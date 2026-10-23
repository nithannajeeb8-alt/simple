// Currency formatting for INR
export function formatCurrency(amount, hideBalance = false) {
  if (hideBalance) return '₹ •••••';
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  const absAmount = Math.abs(amount);
  // Indian number formatting
  const formatted = absAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${amount < 0 ? '-' : ''}₹${formatted}`;
}

export function formatCurrencyShort(amount, hideBalance = false) {
  if (hideBalance) return '₹•••';
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  const absAmount = Math.abs(amount);
  let formatted;
  if (absAmount >= 10000000) formatted = (absAmount / 10000000).toFixed(1) + 'Cr';
  else if (absAmount >= 100000) formatted = (absAmount / 100000).toFixed(1) + 'L';
  else if (absAmount >= 1000) formatted = (absAmount / 1000).toFixed(1) + 'K';
  else formatted = absAmount.toFixed(0);
  return `${amount < 0 ? '-' : ''}₹${formatted}`;
}

// Date helpers
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  // Parse YYYY-MM-DD as local date
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
  return new Date(dateStr);
}

export function toDateString(date) {
  if (!date) date = new Date();
  if (typeof date === 'string') return date.split('T')[0];
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthStart(dateStr) {
  const d = dateStr ? parseLocalDate(dateStr) : new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function getMonthEnd(dateStr) {
  const d = dateStr ? parseLocalDate(dateStr) : new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function getWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

export function getYearStart() {
  return new Date(new Date().getFullYear(), 0, 1);
}

export function getDaysInMonth(date) {
  const d = date || new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

export function getDaysElapsed() {
  return new Date().getDate();
}

export function getDaysRemaining() {
  const now = new Date();
  return getDaysInMonth(now) - now.getDate();
}

// Recurrence calculation
export function getNextRecurrenceDate(dateStr, recurrence) {
  const date = parseLocalDate(dateStr);
  const now = new Date();
  let next = new Date(date);

  while (next <= now) {
    switch (recurrence) {
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        // Handle month overflow (e.g., Jan 31 -> Feb 28)
        const targetDay = date.getDate();
        const maxDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
        next.setDate(Math.min(targetDay, maxDay));
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
      default:
        return null;
    }
  }
  return toDateString(next);
}

// Validation
export function validateAmount(value) {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) return 'Please enter a valid positive amount';
  if (!/^\d+(\.\d{1,2})?$/.test(String(value).trim())) return 'Amount can have at most 2 decimal places';
  return null;
}

export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
}

// CSV export
export function generateCSV(transactions, accounts, activities, debts) {
  const headers = ['ID', 'Date', 'Type', 'Amount (INR)', 'Activity', 'Source Account', 'Destination Account', 'Debt Person', 'Note'];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    // Prevent formula injection
    if (/^[=+\-@\t\r]/.test(str)) return `'${str}`;
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = transactions.map(t => {
    const activity = activities.find(a => a.id === t.activityId);
    const srcAccount = accounts.find(a => a.id === t.accountId);
    const destAccount = accounts.find(a => a.id === t.toAccountId);
    const debt = debts.find(d => d.id === t.debtId);

    return [
      escapeCSV(t.id),
      escapeCSV(t.date),
      escapeCSV(t.type),
      escapeCSV(t.amount),
      escapeCSV(activity?.name || ''),
      escapeCSV(srcAccount?.name || ''),
      escapeCSV(destAccount?.name || ''),
      escapeCSV(debt?.personName || ''),
      escapeCSV(t.note || '')
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function downloadFile(content, filename, type = 'text/csv') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Generate unique ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Debounce
export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// Classify transaction for reports
export function isExpenseType(type) {
  return type === 'expense';
}

export function isIncomeType(type) {
  return type === 'income' || type === 'refund';
}

export function isTransferType(type) {
  return type === 'transfer';
}

export function isDebtType(type) {
  return type === 'debt_repayment_received' || type === 'debt_repayment_made';
}
