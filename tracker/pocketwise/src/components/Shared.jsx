import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, Trash2, Mic, MicOff, ChevronDown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

// Dynamic icon component
export function Icon({ name, size = 20, ...props }) {
  const iconMap = {
    'utensils': LucideIcons.UtensilsCrossed,
    'car': LucideIcons.Car,
    'shopping-bag': LucideIcons.ShoppingBag,
    'film': LucideIcons.Film,
    'zap': LucideIcons.Zap,
    'heart': LucideIcons.Heart,
    'book-open': LucideIcons.BookOpen,
    'shopping-cart': LucideIcons.ShoppingCart,
    'home': LucideIcons.Home,
    'shield': LucideIcons.Shield,
    'smile': LucideIcons.Smile,
    'gift': LucideIcons.Gift,
    'plane': LucideIcons.Plane,
    'repeat': LucideIcons.Repeat,
    'more-horizontal': LucideIcons.MoreHorizontal,
    'briefcase': LucideIcons.Briefcase,
    'laptop': LucideIcons.Laptop,
    'trending-up': LucideIcons.TrendingUp,
    'rotate-ccw': LucideIcons.RotateCcw,
    'plus-circle': LucideIcons.PlusCircle,
    'circle': LucideIcons.Circle,
    'wallet': LucideIcons.Wallet,
    'credit-card': LucideIcons.CreditCard,
    'banknote': LucideIcons.Banknote,
    'piggy-bank': LucideIcons.PiggyBank,
    'alert-triangle': LucideIcons.AlertTriangle,
    'alert-circle': LucideIcons.AlertCircle,
    'calendar': LucideIcons.Calendar,
    'clock': LucideIcons.Clock,
    'target': LucideIcons.Target,
    'arrow-up-right': LucideIcons.ArrowUpRight,
    'arrow-down-left': LucideIcons.ArrowDownLeft,
    'arrow-right-left': LucideIcons.ArrowRightLeft,
    'send': LucideIcons.Send,
    'download': LucideIcons.Download,
    'upload': LucideIcons.Upload,
    'trash': LucideIcons.Trash2,
    'edit': LucideIcons.Edit3,
    'check': LucideIcons.Check,
    'x': LucideIcons.X,
    'search': LucideIcons.Search,
    'filter': LucideIcons.Filter,
    'plus': LucideIcons.Plus,
    'minus': LucideIcons.Minus,
    'chevron-right': LucideIcons.ChevronRight,
    'chevron-down': LucideIcons.ChevronDown,
    'eye': LucideIcons.Eye,
    'eye-off': LucideIcons.EyeOff,
    'bell': LucideIcons.Bell,
    'settings': LucideIcons.Settings,
    'user': LucideIcons.User,
    'info': LucideIcons.Info,
    'help-circle': LucideIcons.HelpCircle,
    'bar-chart': LucideIcons.BarChart3,
    'pie-chart': LucideIcons.PieChart,
    'trending-down': LucideIcons.TrendingDown,
    'dollar-sign': LucideIcons.IndianRupee,
    'indian-rupee': LucideIcons.IndianRupee,
    'receipt': LucideIcons.Receipt,
    'hand-coins': LucideIcons.HandCoins,
    'landmark': LucideIcons.Landmark,
    'archive': LucideIcons.Archive,
    'star': LucideIcons.Star,
    'sparkles': LucideIcons.Sparkles,
    'bot': LucideIcons.Bot,
  };

  const IconComp = iconMap[name] || LucideIcons.Circle;
  return <IconComp size={size} {...props} />;
}

// Modal component
export function Modal({ isOpen, onClose, title, children, wide }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="modal" style={wide ? { maxWidth: 600 } : undefined}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Confirmation dialog
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false }) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="confirm-dialog">
        <div className="confirm-dialog-icon" style={{
          background: danger ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)',
          color: danger ? 'var(--color-danger)' : 'var(--color-warning)'
        }}>
          {danger ? <Trash2 size={24} /> : <AlertTriangle size={24} />}
        </div>
        <h3 className="confirm-dialog-title">{title}</h3>
        <p className="confirm-dialog-message">{message}</p>
        <div className="form-actions" style={{ justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Avatar component
export function Avatar({ name, bg, size = 40 }) {
  const initial = name ? name.charAt(0).toUpperCase() : 'U';
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: bg || 'var(--accent-gradient)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 700,
        fontSize: size * 0.4
      }}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}

// Transaction Icon
export function TransactionIcon({ type, activityIcon, size = 40 }) {
  const bgColors = {
    income: 'var(--color-income-bg)',
    expense: 'var(--color-expense-bg)',
    transfer: 'var(--color-info-bg)',
    refund: 'var(--color-success-bg)',
    debt_repayment_received: 'var(--color-income-bg)',
    debt_repayment_made: 'var(--color-expense-bg)',
  };

  const iconColors = {
    income: 'var(--color-income)',
    expense: 'var(--color-expense)',
    transfer: 'var(--color-info)',
    refund: 'var(--color-success)',
    debt_repayment_received: 'var(--color-income)',
    debt_repayment_made: 'var(--color-expense)',
  };

  const typeIcons = {
    income: 'arrow-down-left',
    expense: 'arrow-up-right',
    transfer: 'arrow-right-left',
    refund: 'rotate-ccw',
    debt_repayment_received: 'arrow-down-left',
    debt_repayment_made: 'arrow-up-right',
  };

  return (
    <div
      className="icon-circle"
      style={{
        width: size, height: size,
        background: bgColors[type] || 'var(--bg-card)',
        color: iconColors[type] || 'var(--text-secondary)',
      }}
    >
      <Icon name={activityIcon || typeIcons[type] || 'circle'} size={size * 0.45} />
    </div>
  );
}

// Voice input button
export function VoiceInput({ onResult, onError }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = () => {
    if (!isSupported) {
      onError?.('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setIsListening(false);
      onResult?.(text);
    };

    recognition.onerror = () => {
      setIsListening(false);
      onError?.('Could not recognize speech. Please try again.');
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      className="btn btn-icon"
      onClick={isListening ? stopListening : startListening}
      aria-label={isListening ? 'Stop recording' : 'Start voice input'}
      style={{
        color: isListening ? 'var(--color-danger)' : 'var(--text-tertiary)',
        background: isListening ? 'var(--color-danger-bg)' : 'transparent'
      }}
    >
      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
    </button>
  );
}

// Number pad for amount input
export function AmountInput({ value, onChange, error, label = 'Amount', autoFocus }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-tertiary)', fontWeight: 600, fontSize: '1.1rem'
        }}>₹</span>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ paddingLeft: 36, fontSize: '1.1rem', fontWeight: 600 }}
          autoFocus={autoFocus}
          aria-label={label}
        />
      </div>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

// Select with icon
export function SelectField({ label, value, onChange, options, error, placeholder }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

// Date input
export function DateField({ label, value, onChange, error }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      />
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

// Text input
export function TextField({ label, value, onChange, error, placeholder, multiline, type = 'text' }) {
  if (multiline) {
    return (
      <div className="form-group">
        {label && <label className="form-label">{label}</label>}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          aria-label={label}
        />
        {error && <div className="form-error">{error}</div>}
      </div>
    );
  }

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
      />
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

// Empty state
export function EmptyState({ icon = 'inbox', title, message, action, onAction }) {
  return (
    <div className="empty-state">
      <Icon name={icon} size={48} />
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-text">{message}</p>
      {action && onAction && (
        <button className="btn btn-primary btn-sm mt-4" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}
