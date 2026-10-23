import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context';
import { db } from '../db';
import { formatCurrency, formatDate, formatDateShort, toDateString, parseLocalDate, generateCSV, downloadFile, validateAmount, validateRequired } from '../utils';
import { Icon, Modal, ConfirmDialog, TransactionIcon, AmountInput, SelectField, DateField, TextField, EmptyState, VoiceInput } from '../components/Shared';
import { Search, Filter, Download, Plus, ChevronDown, X, Edit3, Trash2, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Calendar, RotateCcw } from 'lucide-react';

const TYPE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'expense', label: 'Expenses' },
  { key: 'income', label: 'Income' },
  { key: 'transfer', label: 'Transfers' },
  { key: 'debt', label: 'Debts' },
  { key: 'refund', label: 'Refunds' },
];

const TIME_FILTERS = [
  { key: 'month', label: 'This Month' },
  { key: 'year', label: 'This Year' },
  { key: 'all', label: 'All Time' },
];

const TYPE_LABELS = {
  expense: 'Expense',
  income: 'Income',
  transfer: 'Transfer',
  refund: 'Refund',
  debt_repayment_received: 'Debt Received',
  debt_repayment_made: 'Debt Paid',
};

const PAGE_SIZE = 50;

function getAmountClass(type) {
  if (type === 'income' || type === 'refund' || type === 'debt_repayment_received') return 'amount-income';
  if (type === 'expense' || type === 'debt_repayment_made') return 'amount-expense';
  return 'amount-transfer';
}

function getAmountPrefix(type) {
  if (type === 'income' || type === 'refund' || type === 'debt_repayment_received') return '+';
  if (type === 'expense' || type === 'debt_repayment_made') return '-';
  return '';
}

export default function Activity() {
  const { accounts, activities, hideBalances, refreshData, showToast } = useApp();

  // Data state
  const [allTransactions, setAllTransactions] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('month');

  // Pagination
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Modal state
  const [detailTransaction, setDetailTransaction] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form state
  const [formType, setFormType] = useState('expense');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(toDateString(new Date()));
  const [formActivityId, setFormActivityId] = useState('');
  const [formAccountId, setFormAccountId] = useState('');
  const [formToAccountId, setFormToAccountId] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [formSaving, setFormSaving] = useState(false);

  // ----- Data loading -----
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const [txns, debtRecords] = await Promise.all([
        db.transactions.orderBy('date').reverse().toArray(),
        db.debts.toArray(),
      ]);
      setAllTransactions(txns);
      setDebts(debtRecords);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // ----- Debounced search -----
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim().toLowerCase()), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [typeFilter, timeFilter, debouncedSearch]);

  // ----- Build lookup maps -----
  const accountMap = useMemo(() => {
    const map = {};
    accounts.forEach(a => { map[a.id] = a; });
    return map;
  }, [accounts]);

  const activityMap = useMemo(() => {
    const map = {};
    activities.forEach(a => { map[a.id] = a; });
    return map;
  }, [activities]);

  // ----- Filtering -----
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return allTransactions.filter(t => {
      // Type filter
      if (typeFilter !== 'all') {
        if (typeFilter === 'debt') {
          if (t.type !== 'debt_repayment_received' && t.type !== 'debt_repayment_made') return false;
        } else {
          if (t.type !== typeFilter) return false;
        }
      }

      // Time filter
      if (timeFilter !== 'all' && t.date) {
        const txDate = parseLocalDate(t.date);
        if (timeFilter === 'month') {
          if (txDate.getMonth() !== currentMonth || txDate.getFullYear() !== currentYear) return false;
        } else if (timeFilter === 'year') {
          if (txDate.getFullYear() !== currentYear) return false;
        }
      }

      // Search filter
      if (debouncedSearch) {
        const q = debouncedSearch;
        const activity = t.activityId ? activityMap[t.activityId] : null;
        const account = t.accountId ? accountMap[t.accountId] : null;
        const toAccount = t.toAccountId ? accountMap[t.toAccountId] : null;

        const activityName = activity ? activity.name.toLowerCase() : '';
        const accountName = account ? account.name.toLowerCase() : '';
        const toAccountName = toAccount ? toAccount.name.toLowerCase() : '';
        const note = (t.note || '').toLowerCase();
        const typeLabel = (TYPE_LABELS[t.type] || t.type).toLowerCase();
        const dateStr = t.date || '';
        const dateFormatted = t.date ? formatDate(t.date).toLowerCase() : '';
        const amountStr = String(t.amount);

        const matches =
          activityName.includes(q) ||
          accountName.includes(q) ||
          toAccountName.includes(q) ||
          note.includes(q) ||
          typeLabel.includes(q) ||
          dateStr.includes(q) ||
          dateFormatted.includes(q) ||
          amountStr.includes(q);

        if (!matches) return false;
      }

      return true;
    });
  }, [allTransactions, typeFilter, timeFilter, debouncedSearch, activityMap, accountMap]);

  const visibleTransactions = useMemo(
    () => filteredTransactions.slice(0, visibleCount),
    [filteredTransactions, visibleCount]
  );

  const hasMore = visibleCount < filteredTransactions.length;

  // ----- Transaction label helpers -----
  const getTransactionName = useCallback((t) => {
    if (t.activityId && activityMap[t.activityId]) {
      return activityMap[t.activityId].name;
    }
    return TYPE_LABELS[t.type] || t.type;
  }, [activityMap]);

  const getTransactionMeta = useCallback((t) => {
    const parts = [];
    if (t.date) parts.push(formatDateShort(t.date));
    const acc = t.accountId ? accountMap[t.accountId] : null;
    if (acc) parts.push(acc.name);
    if (t.type === 'transfer' && t.toAccountId) {
      const toAcc = accountMap[t.toAccountId];
      if (toAcc) parts.push(`→ ${toAcc.name}`);
    }
    return parts.join(' · ');
  }, [accountMap]);

  const getActivityIcon = useCallback((t) => {
    if (t.activityId && activityMap[t.activityId]) {
      return activityMap[t.activityId].icon;
    }
    return null;
  }, [activityMap]);

  // ----- CSV export -----
  const handleExport = useCallback(async () => {
    if (filteredTransactions.length === 0) {
      showToast('No transactions to export', 'error');
      return;
    }
    try {
      const allDebts = await db.debts.toArray();
      const csv = generateCSV(filteredTransactions, accounts, activities, allDebts);
      const filename = `pocketwise-transactions-${toDateString(new Date())}.csv`;
      downloadFile(csv, filename);
      showToast(`Exported ${filteredTransactions.length} transactions`);
    } catch (err) {
      showToast('Export failed', 'error');
      console.error(err);
    }
  }, [filteredTransactions, accounts, activities, showToast]);

  // ----- Form helpers -----
  const filteredActivities = useMemo(() => {
    if (formType === 'transfer') return [];
    const actType = formType === 'refund' ? 'expense' : formType;
    return activities.filter(a => a.type === actType && !a.archived);
  }, [activities, formType]);

  const accountOptions = useMemo(
    () => accounts.map(a => ({ value: String(a.id), label: a.name })),
    [accounts]
  );

  const activityOptions = useMemo(
    () => filteredActivities.map(a => ({ value: String(a.id), label: a.name })),
    [filteredActivities]
  );

  const toAccountOptions = useMemo(
    () => accounts
      .filter(a => String(a.id) !== formAccountId)
      .map(a => ({ value: String(a.id), label: a.name })),
    [accounts, formAccountId]
  );

  const resetForm = useCallback(() => {
    setFormType('expense');
    setFormAmount('');
    setFormDate(toDateString(new Date()));
    setFormActivityId('');
    setFormAccountId(accounts.length > 0 ? String(accounts[0].id) : '');
    setFormToAccountId('');
    setFormNote('');
    setFormErrors({});
    setFormSaving(false);
  }, [accounts]);

  const openAddForm = useCallback(() => {
    setEditingTransaction(null);
    resetForm();
    setFormOpen(true);
  }, [resetForm]);

  const openEditForm = useCallback((t) => {
    setEditingTransaction(t);
    setFormType(t.type);
    setFormAmount(String(t.amount));
    setFormDate(t.date || toDateString(new Date()));
    setFormActivityId(t.activityId ? String(t.activityId) : '');
    setFormAccountId(t.accountId ? String(t.accountId) : '');
    setFormToAccountId(t.toAccountId ? String(t.toAccountId) : '');
    setFormNote(t.note || '');
    setFormErrors({});
    setFormSaving(false);
    setDetailTransaction(null);
    setFormOpen(true);
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};
    const amountErr = validateAmount(formAmount);
    if (amountErr) errors.amount = amountErr;

    const dateErr = validateRequired(formDate, 'Date');
    if (dateErr) errors.date = dateErr;

    const accountErr = validateRequired(formAccountId, 'Account');
    if (accountErr) errors.account = accountErr;

    if (formType !== 'transfer' && formType !== 'debt_repayment_received' && formType !== 'debt_repayment_made') {
      const actErr = validateRequired(formActivityId, 'Category');
      if (actErr) errors.activity = actErr;
    }

    if (formType === 'transfer') {
      const toErr = validateRequired(formToAccountId, 'Destination account');
      if (toErr) errors.toAccount = toErr;
      if (formToAccountId && formToAccountId === formAccountId) {
        errors.toAccount = 'Destination must differ from source';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formAmount, formDate, formAccountId, formActivityId, formToAccountId, formType]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;
    setFormSaving(true);

    try {
      const data = {
        type: formType,
        amount: parseFloat(formAmount),
        date: formDate,
        activityId: formActivityId ? parseInt(formActivityId, 10) : null,
        accountId: formAccountId ? parseInt(formAccountId, 10) : null,
        toAccountId: formType === 'transfer' && formToAccountId ? parseInt(formToAccountId, 10) : null,
        note: formNote.trim() || null,
      };

      if (editingTransaction) {
        await db.transactions.update(editingTransaction.id, data);
        showToast('Transaction updated');
      } else {
        await db.transactions.add({
          ...data,
          createdAt: new Date().toISOString(),
        });
        showToast('Transaction added');
      }

      await refreshData();
      await loadTransactions();
      setFormOpen(false);
      resetForm();
    } catch (err) {
      showToast('Failed to save transaction', 'error');
      console.error(err);
    } finally {
      setFormSaving(false);
    }
  }, [validateForm, formType, formAmount, formDate, formActivityId, formAccountId, formToAccountId, formNote, editingTransaction, refreshData, loadTransactions, showToast, resetForm]);

  // ----- Delete -----
  const handleDelete = useCallback(async (id) => {
    try {
      await db.transactions.delete(id);
      await refreshData();
      await loadTransactions();
      setDetailTransaction(null);
      setDeleteConfirmId(null);
      showToast('Transaction deleted');
    } catch (err) {
      showToast('Failed to delete transaction', 'error');
      console.error(err);
    }
  }, [refreshData, loadTransactions, showToast]);

  // ----- Voice input -----
  const handleVoiceResult = useCallback((text) => {
    setFormNote(prev => prev ? `${prev} ${text}` : text);
    // Try to extract a number from the speech
    const numberMatch = text.match(/(\d+(?:[.,]\d+)?)/);
    if (numberMatch && !formAmount) {
      setFormAmount(numberMatch[1].replace(',', '.'));
    }
  }, [formAmount]);

  // ----- Render helpers -----
  const renderTransactionRow = useCallback((t) => {
    const name = getTransactionName(t);
    const meta = getTransactionMeta(t);
    const icon = getActivityIcon(t);
    const prefix = getAmountPrefix(t.type);
    const amountCls = getAmountClass(t.type);

    return (
      <div
        key={t.id}
        className="transaction-row"
        onClick={() => setDetailTransaction(t)}
        role="button"
        tabIndex={0}
        aria-label={`${name}, ${prefix}${formatCurrency(t.amount, hideBalances)}`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDetailTransaction(t); } }}
      >
        <TransactionIcon type={t.type} activityIcon={icon} size={40} />
        <div className="transaction-info">
          <div className="transaction-name">{name}</div>
          <div className="transaction-meta">{meta}</div>
        </div>
        <div className={`transaction-amount ${amountCls}`}>
          {prefix}{formatCurrency(t.amount, hideBalances)}
        </div>
      </div>
    );
  }, [getTransactionName, getTransactionMeta, getActivityIcon, hideBalances]);

  // ----- Loading -----
  if (loading) {
    return (
      <div className="page" style={{ paddingTop: 24 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton" style={{ width: 140, height: 28 }} />
          <div className="flex gap-2">
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
          </div>
        </div>
        <div className="skeleton mb-3" style={{ height: 44 }} />
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ width: 80, height: 32, borderRadius: 50 }} />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-3 mb-3">
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton mb-2" style={{ width: '60%', height: 14 }} />
              <div className="skeleton" style={{ width: '40%', height: 12 }} />
            </div>
            <div className="skeleton" style={{ width: 70, height: 16 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="page" style={{ paddingTop: 24 }}>
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Activity</h1>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-icon btn-secondary"
            onClick={handleExport}
            aria-label="Export transactions as CSV"
            title="Export CSV"
          >
            <Download size={18} />
          </button>
          <button
            className="btn btn-icon btn-primary"
            onClick={openAddForm}
            aria-label="Add transaction"
            title="Add transaction"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* ===== Search Bar ===== */}
      <div className="mb-3" style={{ position: 'relative' }}>
        <Search
          size={18}
          style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Search by amount, category, note, date…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: 40, paddingRight: searchTerm ? 40 : 16 }}
          aria-label="Search transactions"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            aria-label="Clear search"
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)',
              padding: 4, display: 'flex', alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ===== Type Filter Chips ===== */}
      <div className="h-scroll mb-3" role="tablist" aria-label="Transaction type filter">
        {TYPE_FILTERS.map(f => (
          <button
            key={f.key}
            className={`chip ${typeFilter === f.key ? 'active' : ''}`}
            onClick={() => setTypeFilter(f.key)}
            role="tab"
            aria-selected={typeFilter === f.key}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ===== Time Filter Chips ===== */}
      <div className="h-scroll mb-4" role="tablist" aria-label="Time range filter">
        {TIME_FILTERS.map(f => (
          <button
            key={f.key}
            className={`chip ${timeFilter === f.key ? 'active' : ''}`}
            onClick={() => setTimeFilter(f.key)}
            role="tab"
            aria-selected={timeFilter === f.key}
          >
            <Calendar size={12} />
            {f.label}
          </button>
        ))}
      </div>

      {/* ===== Transaction List ===== */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon="receipt"
          title="No transactions found"
          message={debouncedSearch || typeFilter !== 'all' || timeFilter !== 'all'
            ? 'Try adjusting your search or filters.'
            : 'Tap the + button to add your first transaction.'}
          action={!debouncedSearch && typeFilter === 'all' ? 'Add Transaction' : undefined}
          onAction={!debouncedSearch && typeFilter === 'all' ? openAddForm : undefined}
        />
      ) : (
        <div className="card" style={{ padding: '8px 16px' }}>
          {visibleTransactions.map(renderTransactionRow)}

          {hasMore && (
            <div className="text-center mt-3 mb-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
              >
                <ChevronDown size={16} />
                Load More ({filteredTransactions.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== Transaction Detail Modal ===== */}
      <Modal
        isOpen={!!detailTransaction}
        onClose={() => setDetailTransaction(null)}
        title="Transaction Details"
      >
        {detailTransaction && (
          <TransactionDetail
            transaction={detailTransaction}
            activityMap={activityMap}
            accountMap={accountMap}
            debts={debts}
            hideBalances={hideBalances}
            onEdit={() => openEditForm(detailTransaction)}
            onDelete={() => setDeleteConfirmId(detailTransaction.id)}
          />
        )}
      </Modal>

      {/* ===== Transaction Form Modal ===== */}
      <Modal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); resetForm(); }}
        title={editingTransaction ? 'Edit Transaction' : 'New Transaction'}
      >
        <TransactionForm
          formType={formType}
          setFormType={setFormType}
          formAmount={formAmount}
          setFormAmount={setFormAmount}
          formDate={formDate}
          setFormDate={setFormDate}
          formActivityId={formActivityId}
          setFormActivityId={setFormActivityId}
          formAccountId={formAccountId}
          setFormAccountId={setFormAccountId}
          formToAccountId={formToAccountId}
          setFormToAccountId={setFormToAccountId}
          formNote={formNote}
          setFormNote={setFormNote}
          formErrors={formErrors}
          formSaving={formSaving}
          activityOptions={activityOptions}
          accountOptions={accountOptions}
          toAccountOptions={toAccountOptions}
          isEditing={!!editingTransaction}
          onSave={handleSave}
          onCancel={() => { setFormOpen(false); resetForm(); }}
          onVoiceResult={handleVoiceResult}
          showToast={showToast}
        />
      </Modal>

      {/* ===== Delete Confirmation ===== */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => handleDelete(deleteConfirmId)}
        title="Delete Transaction"
        message="This action cannot be undone. Are you sure you want to delete this transaction?"
        confirmText="Delete"
        danger
      />
    </div>
  );
}

/* ============================
   Transaction Detail Component
   ============================ */
function TransactionDetail({ transaction: t, activityMap, accountMap, debts, hideBalances, onEdit, onDelete }) {
  const activity = t.activityId ? activityMap[t.activityId] : null;
  const account = t.accountId ? accountMap[t.accountId] : null;
  const toAccount = t.toAccountId ? accountMap[t.toAccountId] : null;
  const debt = t.debtId ? debts.find(d => d.id === t.debtId) : null;
  const prefix = getAmountPrefix(t.type);
  const amountCls = getAmountClass(t.type);

  return (
    <div>
      {/* Amount + type badge */}
      <div className="text-center mb-4">
        <TransactionIcon type={t.type} activityIcon={activity?.icon} size={52} />
        <div className={`${amountCls} mt-3`} style={{ fontSize: '1.6rem', fontWeight: 800 }}>
          {prefix}{formatCurrency(t.amount, hideBalances)}
        </div>
        <div
          className="chip mt-2"
          style={{ cursor: 'default', display: 'inline-flex' }}
        >
          {TYPE_LABELS[t.type] || t.type}
        </div>
      </div>

      {/* Detail rows */}
      <div className="card" style={{ padding: 16 }}>
        <DetailRow label="Date" value={formatDate(t.date)} />
        {activity && <DetailRow label="Category" value={activity.name} />}
        {account && <DetailRow label="Account" value={account.name} />}
        {toAccount && <DetailRow label="To Account" value={toAccount.name} />}
        {debt && <DetailRow label="Person" value={debt.personName} />}
        {t.note && <DetailRow label="Note" value={t.note} />}
      </div>

      {/* Actions */}
      <div className="form-actions" style={{ marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={onEdit} style={{ flex: 1 }}>
          <Edit3 size={16} /> Edit
        </button>
        <button className="btn btn-danger" onClick={onDelete} style={{ flex: 1 }}>
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{label}</span>
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

/* ============================
   Transaction Form Component
   ============================ */
function TransactionForm({
  formType, setFormType,
  formAmount, setFormAmount,
  formDate, setFormDate,
  formActivityId, setFormActivityId,
  formAccountId, setFormAccountId,
  formToAccountId, setFormToAccountId,
  formNote, setFormNote,
  formErrors, formSaving,
  activityOptions, accountOptions, toAccountOptions,
  isEditing, onSave, onCancel,
  onVoiceResult, showToast,
}) {
  const typeTabs = [
    { key: 'expense', label: 'Expense', icon: <ArrowUpRight size={14} /> },
    { key: 'income', label: 'Income', icon: <ArrowDownLeft size={14} /> },
    { key: 'transfer', label: 'Transfer', icon: <ArrowRightLeft size={14} /> },
    { key: 'refund', label: 'Refund', icon: <RotateCcw size={14} /> },
  ];

  // Reset activity when type changes
  useEffect(() => {
    setFormActivityId('');
  }, [formType, setFormActivityId]);

  return (
    <div>
      {/* Type selector tabs */}
      <div className="tabs" role="tablist" aria-label="Transaction type">
        {typeTabs.map(tab => (
          <button
            key={tab.key}
            className={`tab ${formType === tab.key ? 'active' : ''}`}
            onClick={() => setFormType(tab.key)}
            role="tab"
            aria-selected={formType === tab.key}
          >
            <span className="flex items-center justify-center gap-2">
              {tab.icon} {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Amount */}
      <AmountInput
        value={formAmount}
        onChange={setFormAmount}
        error={formErrors.amount}
        autoFocus
      />

      {/* Date */}
      <DateField
        label="Date"
        value={formDate}
        onChange={setFormDate}
        error={formErrors.date}
      />

      {/* Category (not for transfers) */}
      {formType !== 'transfer' && (
        <SelectField
          label="Category"
          value={formActivityId}
          onChange={setFormActivityId}
          options={activityOptions}
          placeholder="Select category"
          error={formErrors.activity}
        />
      )}

      {/* Source account */}
      <SelectField
        label={formType === 'transfer' ? 'From Account' : 'Account'}
        value={formAccountId}
        onChange={setFormAccountId}
        options={accountOptions}
        placeholder="Select account"
        error={formErrors.account}
      />

      {/* Destination account (transfers only) */}
      {formType === 'transfer' && (
        <SelectField
          label="To Account"
          value={formToAccountId}
          onChange={setFormToAccountId}
          options={toAccountOptions}
          placeholder="Select destination"
          error={formErrors.toAccount}
        />
      )}

      {/* Note + Voice */}
      <div style={{ position: 'relative' }}>
        <TextField
          label="Note"
          value={formNote}
          onChange={setFormNote}
          placeholder="Add a note (optional)"
          multiline
        />
        <div style={{ position: 'absolute', right: 4, top: 24 }}>
          <VoiceInput
            onResult={onVoiceResult}
            onError={(msg) => showToast(msg, 'error')}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button className="btn btn-secondary" onClick={onCancel} style={{ flex: 1 }} disabled={formSaving}>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={onSave}
          style={{ flex: 2 }}
          disabled={formSaving}
        >
          {formSaving ? 'Saving…' : (isEditing ? 'Update' : 'Add Transaction')}
        </button>
      </div>
    </div>
  );
}
