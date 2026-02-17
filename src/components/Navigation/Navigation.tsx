'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './Navigation.module.css';

const navItems = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
];

function NavIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'home':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'dashboard':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Navigation() {
  const pathname = usePathname();
  const { logout } = useAuth();

  if (
    pathname.startsWith('/workout') ||
    pathname.startsWith('/summary') ||
    pathname === '/login' ||
    pathname === '/register'
  ) {
    return null;
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.navInner}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <NavIcon icon={item.icon} />
              <span className={styles.label}>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => logout()}
          className={styles.navItem}
          aria-label="Log out"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className={styles.label}>Log out</span>
        </button>
      </div>
    </nav>
  );
}
