'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '../login/auth.module.css';

function RegisterForm() {
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get('invitation') ?? '';
  const { register, validateInvitation } = useAuth();

  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('');

  useEffect(() => {
    if (!invitationToken) {
      setStatus('invalid');
      return;
    }
    validateInvitation(invitationToken)
      .then(() => setStatus('valid'))
      .catch(() => setStatus('invalid'));
  }, [invitationToken, validateInvitation]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        invitationToken,
        name,
        email,
        password,
        height: height ? Number(height) : null,
        weight: weight ? Number(weight) : null,
        goal: goal.trim() || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'checking') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.loadingSpinner} />
          <p className={styles.subtitle}>Checking invitation…</p>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>Invalid or expired invitation</h1>
          <p className={styles.subtitle}>
            This link is invalid, has already been used, or has expired.
          </p>
          <Link href="/login" className={styles.link}>
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          <span className={styles.logoIcon}>⚡</span> Create your account
        </h1>
        <p className={styles.subtitle}>You’re invited to join GymTrack</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p className={styles.error}>{error}</p>}
          <label className={styles.label}>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              autoComplete="name"
              required
            />
          </label>
          <label className={styles.label}>
            Email
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
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <label className={styles.label}>
            Height (optional)
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className={styles.input}
              placeholder="e.g. 170 (cm)"
              min={1}
              step={1}
            />
          </label>
          <label className={styles.label}>
            Weight (optional)
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={styles.input}
              placeholder="e.g. 70 (kg)"
              min={1}
              step={0.1}
            />
          </label>
          <label className={styles.label}>
            Goal (optional)
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className={styles.input}
              placeholder="e.g. Build strength, lose fat"
            />
          </label>
          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link href="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <div className={styles.card}>
            <div className={styles.loadingSpinner} />
          </div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
