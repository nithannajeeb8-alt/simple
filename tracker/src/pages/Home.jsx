import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context';
import { db } from '../db';
import { formatCurrency, formatCurrencyShort, formatDate, formatDateShort, toDateString, getDaysInMonth, getDaysElapsed, getDaysRemaining } from '../utils';
import { getSpendingOverTime, getSpendingByCategory } from '../calculations';
import { Icon, Modal, ConfirmDialog, Avatar, TransactionIcon, AmountInput, SelectField, DateField, TextField, EmptyState, VoiceInput } from '../components/Shared';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Eye, EyeOff, Bell, Settings, Plus, Minus, ArrowRightLeft, MoreHorizontal,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, ChevronRight,
  Wallet, Target, AlertTriangle, AlertCircle, Info, HandCoins, Sparkles, X
} from 'lucide-react';

// ─── Greeting helper ────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Custom chart tooltip ───────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-sm)',
      padding: '10px 14px',
      boxShadow: 'var(--shadow-md)',
    }}>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

// ─── Transaction Form Modal ─────────────────────────────────────────────────────
function TransactionFormModal({ isOpen, onClose, initialType, accounts, activities, refreshData, showToast }) {
  const [type, setType] = useState(initialType || 'expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(toDateString());
  const [activityId, setActivityId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Reset form when modal opens or type changes
  useEffect(() => {
    if (isOpen) {
      setType(initialType || 'expense');
      setAmount('');
      setDate(toDateString());
      setActivityId('');
      setAccountId(accounts.length > 0 ? String(accounts[0].id) : '');
      setToAccountId('');
      setNote('');
      setErrors({});
      setSaving(false);
    }
  }, [isOpen, initialType, accounts]);

  const filteredActivities = useMemo(() =>
    activities.filter(a => a.type === type && !a.archived),
    [activities, type]
  );

  const activityOptions = useMemo(() =>
    filteredActivities.map(a => ({ value: String(a.id), label: a.name })),
    [filteredActivities]
  );

  const accountOptions = useMemo(() =>
    accounts.map(a => ({ value: String(a.id), label: a.name })),
    [accounts]
  );

  const toAccountOptions = useMemo(() =>
    accounts.filter(a => String(a.id) !== accountId).map(a => ({ value: String(a.id), label: a.name })),
    [accounts, accountId]
  );

  const typeOptions = [
    { value: 'expense', label: 'Expense' },
    { value: 'income', label: 'Income' },
    { value: 'transfer', label: 'Transfer' },
  ];

  const validate = () => {
    const errs = {};
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) errs.amount = 'Enter a valid amount';
    if (!date) errs.date = 'Select a date';
    if (type !== 'transfer' && !activityId) errs.activityId = 'Select a category';
    if (!accountId) errs.accountId = 'Select an account';
    if (type === 'transfer' && !toAccountId) errs.toAccountId = 'Select destination account';
    if (type === 'transfer' && accountId === toAccountId) errs.toAccountId = 'Source and destination must differ';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const txn = {
        type,
        amount: parseFloat(amount),
        date,
        activityId: type !== 'transfer' ? parseInt(activityId) : null,
        accountId: parseInt(accountId),
        toAccountId: type === 'transfer' ? parseInt(toAccountId) : null,
        note: note.trim() || null,
        createdAt: new Date().toISOString(),
      };
      await db.transactions.add(txn);
      await refreshData();
      const labels = { expense: 'Expense', income: 'Income', transfer: 'Transfer' };
      showToast(`${labels[type]} added successfully`);
      onClose();
    } catch (err) {
      console.error('Error saving transaction:', err);
      showToast('Failed to save transaction', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleVoiceResult = (text) => {
    setNote(prev => prev ? `${prev} ${text}` : text);
  };

  const modalTitle = type === 'expense' ? 'Add Expense' : type === 'income' ? 'Add Income' : 'Transfer Funds';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      {/* Type selector */}
      <div className="form-group">
        <div className="tabs">
          {typeOptions.map(opt => (
            <button
              key={opt.value}
              className={`tab ${type === opt.value ? 'active' : ''}`}
              onClick={() => { setType(opt.value); setActivityId(''); setErrors({}); }}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <AmountInput
        value={amount}
        onChange={setAmount}
        error={errors.amount}
        autoFocus
      />

      <DateField
        label="Date"
        value={date}
        onChange={setDate}
        error={errors.date}
      />

      {type !== 'transfer' && (
        <SelectField
          label="Category"
          value={activityId}
          onChange={setActivityId}
          options={activityOptions}
          placeholder="Select category"
          error={errors.activityId}
        />
      )}

      <SelectField
        label={type === 'transfer' ? 'From Account' : 'Account'}
        value={accountId}
        onChange={setAccountId}
        options={accountOptions}
        placeholder="Select account"
        error={errors.accountId}
      />

      {type === 'transfer' && (
        <SelectField
          label="To Account"
          value={toAccountId}
          onChange={setToAccountId}
          options={toAccountOptions}
          placeholder="Select destination"
          error={errors.toAccountId}
        />
      )}

      <div className="form-group">
        <label className="form-label">Note</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)"
              aria-label="Note"
            />
          </div>
          <VoiceInput onResult={handleVoiceResult} />
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }} type="button">
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ flex: 2 }}
          type="button"
        >
          {saving ? 'Saving...' : 'Save Transaction'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Quick Actions More Menu Modal ──────────────────────────────────────────────
function MoreActionsModal({ isOpen, onClose, navigate }) {
  const items = [
    { icon: 'hand-coins', label: 'Debt Manager', desc: 'Track money lent & borrowed', path: '/activity?tab=debts', color: '#f59e0b' },
    { icon: 'target', label: 'Savings Goals', desc: 'Track your savings goals', path: '/activity?tab=goals', color: '#10b981' },
    { icon: 'calendar', label: 'Reminders', desc: 'Set bill reminders', path: '/activity?tab=reminders', color: '#3b82f6' },
    { icon: 'bar-chart', label: 'Insights', desc: 'Spending analytics', path: '/insights', color: '#7c3aed' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quick Actions">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(item => (
          <button
            key={item.label}
            className="card card-clickable"
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', textAlign: 'left' }}
            onClick={() => { navigate(item.path); onClose(); }}
          >
            <div className="icon-circle" style={{ background: `${item.color}20`, color: item.color, width: 44, height: 44 }}>
              <Icon name={item.icon} size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{item.desc}</div>
            </div>
            <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ─── Main Home Component ────────────────────────────────────────────────────────
export default function Home() {
  const {
    profile, accounts, activities, balances, totalBalance,
    monthlyStats, budgetStatus, categoryBudgets, debtSummary,
    alerts, recentTransactions, hideBalances, hasSampleData,
    settings, refreshData, clearSampleData, showToast, setHideBalances
  } = useApp();

  const navigate = useNavigate();

  // Modal states
  const [txnModalOpen, setTxnModalOpen] = useState(false);
  const [txnModalType, setTxnModalType] = useState('expense');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  // Spending chart
  const [chartPeriod, setChartPeriod] = useState('month');
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);

  // Goals
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setChartLoading(true);
      try {
        const data = await getSpendingOverTime(chartPeriod);
        if (!cancelled) setChartData(data);
      } catch (err) {
        console.error('Error loading chart data:', err);
      } finally {
        if (!cancelled) setChartLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [chartPeriod]);

  // Load goals
  useEffect(() => {
    (async () => {
      try {
        const g = await db.goals.where('completed').equals(0).toArray();
        setGoals(g);
      } catch (err) {
        console.error('Error loading goals:', err);
      }
    })();
  }, [recentTransactions]); // Re-fetch when data refreshes

  const openTxnModal = useCallback((type) => {
    setTxnModalType(type);
    setTxnModalOpen(true);
  }, []);

  // Build transaction display info
  const getTransactionInfo = useCallback((txn) => {
    const activity = activities.find(a => a.id === txn.activityId);
    const account = accounts.find(a => a.id === txn.accountId);
    const toAccount = accounts.find(a => a.id === txn.toAccountId);

    let name = activity?.name || txn.note || 'Transaction';
    if (txn.type === 'transfer') {
      name = `${account?.name || 'Account'} → ${toAccount?.name || 'Account'}`;
    }

    return { name, activity, account, toAccount };
  }, [activities, accounts]);

  // Format chart date labels
  const formatChartLabel = useCallback((dateStr) => {
    if (!dateStr) return '';
    if (chartPeriod === 'year') {
      // dateStr is YYYY-MM
      const [y, m] = dateStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthNames[parseInt(m) - 1] || dateStr;
    }
    // dateStr is YYYY-MM-DD
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parseInt(parts[2])}`;
    }
    return dateStr;
  }, [chartPeriod]);

  const displayedTransactions = recentTransactions.slice(0, 5);

  // Major accounts for summary cards
  const majorAccounts = accounts.slice(0, 3);

  return (
    <div className="page" style={{ paddingTop: 16, paddingBottom: 16 }}>

      {/* ──── Header ──── */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={profile?.name} bg={profile?.avatarBg} size={40} />
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.2 }}>{getGreeting()},</p>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.3 }}>{profile?.name || 'User'}</h1>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {alerts.length > 0 && (
            <button
              className="btn btn-icon btn-ghost"
              onClick={() => {
                const el = document.getElementById('alerts-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              aria-label={`${alerts.length} alerts`}
              style={{ position: 'relative' }}
            >
              <Bell size={20} />
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--color-danger)',
              }} />
            </button>
          )}
          {!alerts.length && (
            <button className="btn btn-icon btn-ghost" aria-label="Notifications" style={{ color: 'var(--text-tertiary)' }}>
              <Bell size={20} />
            </button>
          )}
          <button
            className="btn btn-icon btn-ghost"
            onClick={() => navigate('/settings')}
            aria-label="Settings"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* ──── Balance Section ──── */}
      <section className="bg-gradient-hero" style={{ position: 'relative', zIndex: 1, marginBottom: 24 }}>
        <div className="card" style={{
          position: 'relative',
          zIndex: 1,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(59,130,246,0.05) 100%)',
          borderColor: 'rgba(124,58,237,0.15)',
          textAlign: 'center',
          padding: '28px 20px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
              Total Balance
            </span>
            <button
              onClick={() => setHideBalances(!hideBalances)}
              style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
              aria-label={hideBalances ? 'Show balances' : 'Hide balances'}
            >
              {hideBalances ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <h2 style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: 20,
            background: hideBalances ? 'none' : 'var(--accent-gradient)',
            WebkitBackgroundClip: hideBalances ? 'unset' : 'text',
            WebkitTextFillColor: hideBalances ? 'var(--text-primary)' : 'transparent',
            backgroundClip: hideBalances ? 'unset' : 'text',
          }}>
            {formatCurrency(totalBalance, hideBalances)}
          </h2>

          {/* Income / Expenses / Net */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--radius-pill)',
              padding: '8px 14px',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(16,185,129,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ArrowDownLeft size={14} style={{ color: 'var(--color-income)' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Income</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-income)' }}>
                  {formatCurrencyShort(monthlyStats.totalIncome, hideBalances)}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(244,63,94,0.08)', borderRadius: 'var(--radius-pill)',
              padding: '8px 14px',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(244,63,94,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ArrowUpRight size={14} style={{ color: 'var(--color-expense)' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Expenses</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-expense)' }}>
                  {formatCurrencyShort(monthlyStats.totalExpenses, hideBalances)}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: monthlyStats.netCashFlow >= 0 ? 'rgba(16,185,129,0.06)' : 'rgba(244,63,94,0.06)',
              borderRadius: 'var(--radius-pill)', padding: '8px 14px',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: monthlyStats.netCashFlow >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {monthlyStats.netCashFlow >= 0
                  ? <TrendingUp size={14} style={{ color: 'var(--color-income)' }} />
                  : <TrendingDown size={14} style={{ color: 'var(--color-expense)' }} />
                }
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Net</div>
                <div style={{
                  fontSize: '0.85rem', fontWeight: 700,
                  color: monthlyStats.netCashFlow >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
                }}>
                  {formatCurrencyShort(monthlyStats.netCashFlow, hideBalances)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Sample Data Banner ──── */}
      {hasSampleData && (
        <div className="sample-banner">
          <div className="sample-banner-text" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} />
            <span>Using sample data to explore Pocketwise</span>
          </div>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setClearConfirmOpen(true)}
            style={{ flexShrink: 0 }}
          >
            Clear
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        onConfirm={clearSampleData}
        title="Clear Sample Data?"
        message="This will remove all sample transactions, budgets, debts, and goals. You can start adding your own data afterwards."
        confirmText="Clear Data"
        danger
      />

      {/* ──── Quick Actions ──── */}
      <section style={{ marginBottom: 24 }}>
        <div className="quick-actions">
          <button className="quick-action" onClick={() => openTxnModal('expense')} aria-label="Add Expense">
            <div className="quick-action-icon" style={{ background: 'rgba(244,63,94,0.12)', color: '#f43f5e' }}>
              <Minus size={22} />
            </div>
            <span className="quick-action-label">Expense</span>
          </button>

          <button className="quick-action" onClick={() => openTxnModal('income')} aria-label="Add Income">
            <div className="quick-action-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
              <Plus size={22} />
            </div>
            <span className="quick-action-label">Income</span>
          </button>

          <button className="quick-action" onClick={() => openTxnModal('transfer')} aria-label="Transfer">
            <div className="quick-action-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
              <ArrowRightLeft size={22} />
            </div>
            <span className="quick-action-label">Transfer</span>
          </button>

          <button className="quick-action" onClick={() => setMoreMenuOpen(true)} aria-label="More actions">
            <div className="quick-action-icon" style={{ background: 'rgba(124,58,237,0.12)', color: '#7c3aed' }}>
              <MoreHorizontal size={22} />
            </div>
            <span className="quick-action-label">More</span>
          </button>
        </div>
      </section>

      {/* ──── Financial Summary Cards ──── */}
      <section style={{ marginBottom: 24 }}>
        <div className="h-scroll">
          {/* Budget Card */}
          {budgetStatus.budget > 0 && (
            <div
              className="card card-clickable"
              style={{ minWidth: 200, width: 220 }}
              onClick={() => navigate('/insights')}
              role="button"
              tabIndex={0}
              aria-label="Monthly budget status"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Monthly Budget</span>
                <div className="icon-circle icon-circle-sm" style={{
                  background: budgetStatus.isOverBudget ? 'var(--color-danger-bg)' : budgetStatus.isWarning ? 'var(--color-warning-bg)' : 'rgba(124,58,237,0.1)',
                  color: budgetStatus.isOverBudget ? 'var(--color-danger)' : budgetStatus.isWarning ? 'var(--color-warning)' : 'var(--accent-primary-light)',
                }}>
                  <Wallet size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>
                {formatCurrencyShort(budgetStatus.spent, hideBalances)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: 10 }}>
                of {formatCurrencyShort(budgetStatus.budget, hideBalances)}
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${budgetStatus.isOverBudget ? 'danger' : budgetStatus.isWarning ? 'warning' : ''}`}
                  style={{ width: `${Math.min(budgetStatus.percentage, 100)}%` }}
                />
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 6, textAlign: 'right' }}>
                {budgetStatus.percentage.toFixed(0)}% used
              </div>
            </div>
          )}

          {/* Goals Cards */}
          {goals.map(goal => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            return (
              <div
                key={goal.id}
                className="card card-clickable"
                style={{ minWidth: 200, width: 220 }}
                onClick={() => navigate('/activity?tab=goals')}
                role="button"
                tabIndex={0}
                aria-label={`Goal: ${goal.name}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }} className="truncate">
                    {goal.name}
                  </span>
                  <div className="icon-circle icon-circle-sm" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                    <Target size={16} />
                  </div>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>
                  {formatCurrencyShort(goal.currentAmount, hideBalances)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: 10 }}>
                  of {formatCurrencyShort(goal.targetAmount, hideBalances)}
                </div>
                <div className="progress-bar">
                  <div className="progress-fill success" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 6, textAlign: 'right' }}>
                  {progress.toFixed(0)}%
                </div>
              </div>
            );
          })}

          {/* Account Cards */}
          {majorAccounts.map(acc => (
            <div
              key={acc.id}
              className="card card-clickable"
              style={{ minWidth: 180, width: 200 }}
              onClick={() => navigate('/activity')}
              role="button"
              tabIndex={0}
              aria-label={`Account: ${acc.name}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>{acc.name}</span>
                <div className="icon-circle icon-circle-sm" style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
                  <Icon name={acc.type === 'cash' ? 'wallet' : acc.type === 'bank' ? 'landmark' : 'piggy-bank'} size={16} />
                </div>
              </div>
              <div style={{
                fontSize: '1.15rem', fontWeight: 700,
                color: (balances[acc.id] || 0) < 0 ? 'var(--color-expense)' : 'var(--text-primary)',
              }}>
                {formatCurrency(balances[acc.id] || 0, hideBalances)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 4, textTransform: 'capitalize' }}>
                {acc.type} account
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ──── Spending Chart ──── */}
      <section style={{ marginBottom: 24 }}>
        <div className="section-header">
          <h3 className="section-title">Spending Overview</h3>
          <div style={{ display: 'flex', gap: 4 }}>
            {['week', 'month', 'year'].map(p => (
              <button
                key={p}
                className={`chip ${chartPeriod === p ? 'active' : ''}`}
                onClick={() => setChartPeriod(p)}
                style={{ fontSize: '0.7rem', padding: '4px 10px' }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="chart-container">
            {chartLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Loading chart...</p>
              </div>
            ) : chartData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 8 }}>
                <Icon name="bar-chart" size={32} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>No spending data for this period</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatChartLabel}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={{ stroke: 'var(--border-subtle)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => formatCurrencyShort(v)}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    fill="url(#spendingGradient)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* ──── Alerts ──── */}
      {alerts.length > 0 && (
        <section id="alerts-section" style={{ marginBottom: 24 }}>
          <div className="section-header">
            <h3 className="section-title">Alerts</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{alerts.length} active</span>
          </div>

          {alerts.map((alert, i) => {
            const severityClass = {
              danger: 'alert-danger',
              warning: 'alert-warning',
              info: 'alert-info',
              success: 'alert-success',
            }[alert.severity] || 'alert-info';

            const severityColor = {
              danger: 'var(--color-danger)',
              warning: 'var(--color-warning)',
              info: 'var(--color-info)',
              success: 'var(--color-success)',
            }[alert.severity] || 'var(--color-info)';

            return (
              <div key={i} className={`alert-card ${severityClass}`}>
                <Icon name={alert.icon || 'alert-circle'} size={18} style={{ color: severityColor, flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 2, color: severityColor }}>{alert.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{alert.message}</div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* ──── Recent Transactions ──── */}
      <section style={{ marginBottom: 24 }}>
        <div className="section-header">
          <h3 className="section-title">Recent Transactions</h3>
          <button className="section-link" onClick={() => navigate('/activity')} aria-label="View all transactions">
            View All
          </button>
        </div>

        <div className="card" style={{ padding: displayedTransactions.length > 0 ? '8px 16px' : 20 }}>
          {displayedTransactions.length === 0 ? (
            <EmptyState
              icon="receipt"
              title="No transactions yet"
              message="Add your first transaction to start tracking your finances"
              action="Add Transaction"
              onAction={() => openTxnModal('expense')}
            />
          ) : (
            displayedTransactions.map(txn => {
              const info = getTransactionInfo(txn);
              const amountClass = txn.type === 'income' ? 'amount-income'
                : txn.type === 'expense' ? 'amount-expense'
                : 'amount-transfer';
              const amountPrefix = txn.type === 'income' ? '+' : txn.type === 'expense' ? '-' : '';

              return (
                <div key={txn.id} className="transaction-row" onClick={() => navigate('/activity')} role="button" tabIndex={0}>
                  <TransactionIcon
                    type={txn.type}
                    activityIcon={info.activity?.icon}
                    size={40}
                  />
                  <div className="transaction-info">
                    <div className="transaction-name">{info.name}</div>
                    <div className="transaction-meta">
                      {formatDateShort(txn.date)}
                      {info.account && ` · ${info.account.name}`}
                    </div>
                  </div>
                  <div className={`transaction-amount ${amountClass}`}>
                    {amountPrefix}{formatCurrency(txn.amount, hideBalances)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ──── Debt Summary ──── */}
      {(debtSummary.totalLentOutstanding > 0 || debtSummary.totalBorrowedOutstanding > 0) && (
        <section style={{ marginBottom: 24 }}>
          <div className="section-header">
            <h3 className="section-title">Debt Summary</h3>
            <button className="section-link" onClick={() => navigate('/activity?tab=debts')} aria-label="View debt details">
              Details
            </button>
          </div>

          <div className="grid-2">
            {debtSummary.totalLentOutstanding > 0 && (
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="icon-circle" style={{ background: 'var(--color-income-bg)', color: 'var(--color-income)' }}>
                  <ArrowUpRight size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>You're Owed</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-income)' }}>
                    {formatCurrency(debtSummary.totalLentOutstanding, hideBalances)}
                  </div>
                </div>
              </div>
            )}

            {debtSummary.totalBorrowedOutstanding > 0 && (
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="icon-circle" style={{ background: 'var(--color-expense-bg)', color: 'var(--color-expense)' }}>
                  <ArrowDownLeft size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>You Owe</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-expense)' }}>
                    {formatCurrency(debtSummary.totalBorrowedOutstanding, hideBalances)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ──── Footer spacer for nav ──── */}
      <div style={{ height: 8 }} />

      {/* ──── Modals ──── */}
      <TransactionFormModal
        isOpen={txnModalOpen}
        onClose={() => setTxnModalOpen(false)}
        initialType={txnModalType}
        accounts={accounts}
        activities={activities}
        refreshData={refreshData}
        showToast={showToast}
      />

      <MoreActionsModal
        isOpen={moreMenuOpen}
        onClose={() => setMoreMenuOpen(false)}
        navigate={navigate}
      />
    </div>
  );
}
