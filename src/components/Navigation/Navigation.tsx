'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import NavIcon from './NavIcon';
import styles from './Navigation.module.css';

const navKeys = [
  { href: '/', key: 'home', icon: 'home', exact: true },
  { href: '/routines', key: 'routines', icon: 'routines', exact: false },
  { href: '/dashboard', key: 'dashboard', icon: 'dashboard', exact: true },
  { href: '/profile', key: 'profile', icon: 'profile', exact: true },
] as const;

export default function Navigation() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const t = useTranslations('nav');

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
        {navKeys.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <NavIcon icon={item.icon} />
              <span className={styles.label}>{t(item.key)}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => logout()}
          className={styles.navItem}
          aria-label={t('logOutAria')}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className={styles.label}>{t('logOut')}</span>
        </button>
      </div>
    </nav>
  );
}
