import React, { Suspense, lazy } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { Home, Activity, BarChart3, Settings, Bot } from 'lucide-react';
import { useApp } from './context';

const HomePage = lazy(() => import('./pages/Home'));
const ActivityPage = lazy(() => import('./pages/Activity'));
const InsightsPage = lazy(() => import('./pages/Insights'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const AssistantPage = lazy(() => import('./pages/Assistant'));

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', flexDirection: 'column', gap: 16
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: 'var(--accent-gradient)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 700, fontSize: '1.4rem',
        animation: 'pulse 1.5s infinite'
      }}>P</div>
      <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Loading Pocketwise...</p>
    </div>
  );
}

function Toast() {
  const { toastMessage } = useApp();
  if (!toastMessage) return null;

  return (
    <div className={`toast toast-${toastMessage.type}`} role="alert">
      {toastMessage.message}
    </div>
  );
}

function BottomNav() {
  const location = useLocation();

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/activity', icon: Activity, label: 'Activity' },
    { to: '/assistant', icon: Bot, label: 'AI' },
    { to: '/insights', icon: BarChart3, label: 'Insights' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          end={to === '/'}
          aria-label={label}
        >
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarNav() {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/activity', icon: Activity, label: 'Activity' },
    { to: '/assistant', icon: Bot, label: 'AI Assistant' },
    { to: '/insights', icon: BarChart3, label: 'Insights' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="sidebar-nav" aria-label="Main navigation">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">P</div>
        <span className="sidebar-logo-text">Pocketwise</span>
      </div>
      <div className="sidebar-nav-items">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            end={to === '/'}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default function App() {
  const { ready, settings } = useApp();
  const theme = settings.theme || 'dark';

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (!ready) return <LoadingScreen />;

  return (
    <div className="app-layout">
      <SidebarNav />
      <main className="app-content">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <BottomNav />
      <Toast />
    </div>
  );
}
