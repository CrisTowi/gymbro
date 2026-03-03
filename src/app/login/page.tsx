'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import styles from './auth.module.css';

export default function LoginPage() {
  const t = useTranslations('auth');
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loginFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          <span className={styles.logoIcon}>⚡</span> GymBro
        </h1>
        <p className={styles.subtitle}>{t('signInToAccount')}</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p className={styles.error}>{error}</p>}
          <label className={styles.label}>
            {t('email')}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              autoComplete="email"
              required
            />
          </label>
          <label className={styles.label}>
            {t('password')}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? t('signingIn') : t('signIn')}
          </button>
        </form>

        <p className={styles.footer}>
          {t('noAccount')}{' '}
          <Link href="/register" className={styles.link}>
            {t('invitationLink')}
          </Link>{' '}
          {t('toRegister')}
        </p>
      </div>
    </div>
  );
}
