'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './DevTools.module.css';

const DEV_MODE_KEY = 'gymbro_dev_mode';

const STORAGE_KEYS = [
  'gymbro_sessions',
  'gymbro_weekly_plan',
  'gymbro_active_session',
  'gymbro_pending_sync',
];

export default function DevTools() {
  const [isDevMode, setIsDevMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const devParam = searchParams.get('dev');
    if (devParam === 'true') {
      sessionStorage.setItem(DEV_MODE_KEY, 'true');
      setIsDevMode(true);
    } else if (devParam === 'false') {
      sessionStorage.removeItem(DEV_MODE_KEY);
      setIsDevMode(false);
    } else {
      setIsDevMode(sessionStorage.getItem(DEV_MODE_KEY) === 'true');
    }
  }, [searchParams]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleClearAll = useCallback(() => {
    STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    showToast('All local data cleared');
    setConfirmAction(null);
    setIsOpen(false);
  }, [showToast]);

  const handleClearSessions = useCallback(() => {
    localStorage.removeItem('gymbro_sessions');
    localStorage.removeItem('gymbro_active_session');
    showToast('Session data cleared');
    setConfirmAction(null);
    setIsOpen(false);
  }, [showToast]);

  const handleClearPlan = useCallback(() => {
    localStorage.removeItem('gymbro_weekly_plan');
    showToast('Weekly plan reset to default');
    setConfirmAction(null);
    setIsOpen(false);
  }, [showToast]);

  const handleExitDevMode = useCallback(() => {
    sessionStorage.removeItem(DEV_MODE_KEY);
    setIsDevMode(false);
    setIsOpen(false);
  }, []);

  if (!isDevMode) return null;

  const actions = [
    { id: 'clear-all', label: 'Clear all data', icon: '🗑️', onConfirm: handleClearAll, destructive: true },
    { id: 'clear-sessions', label: 'Clear sessions', icon: '📋', onConfirm: handleClearSessions, destructive: true },
    { id: 'clear-plan', label: 'Reset weekly plan', icon: '📅', onConfirm: handleClearPlan, destructive: false },
    { id: 'exit-dev', label: 'Exit dev mode', icon: '🚪', onConfirm: handleExitDevMode, destructive: false },
  ];

  return (
    <>
      {toast && <div className={styles.toast}>{toast}</div>}

      {isOpen && (
        <div className={styles.backdrop} onClick={() => { setIsOpen(false); setConfirmAction(null); }} />
      )}

      <div className={`${styles.menu} ${isOpen ? styles.menuOpen : ''}`}>
        <div className={styles.menuHeader}>
          <span className={styles.menuTitle}>Dev Tools</span>
          <span className={styles.menuBadge}>DEV</span>
        </div>
        {actions.map((action) => (
          <div key={action.id}>
            {confirmAction === action.id ? (
              <div className={styles.confirmRow}>
                <span className={styles.confirmText}>Are you sure?</span>
                <button className={styles.confirmYes} onClick={action.onConfirm}>Yes</button>
                <button className={styles.confirmNo} onClick={() => setConfirmAction(null)}>No</button>
              </div>
            ) : (
              <button
                className={`${styles.menuItem} ${action.destructive ? styles.destructive : ''}`}
                onClick={() => {
                  if (action.destructive) {
                    setConfirmAction(action.id);
                  } else {
                    action.onConfirm();
                  }
                }}
              >
                <span className={styles.menuIcon}>{action.icon}</span>
                {action.label}
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        className={`${styles.fab} ${isOpen ? styles.fabOpen : ''}`}
        onClick={() => { setIsOpen(!isOpen); setConfirmAction(null); }}
        aria-label="Toggle dev tools"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </>
          )}
        </svg>
      </button>
    </>
  );
}
