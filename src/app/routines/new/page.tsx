'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createRoutine } from '@/lib/api';
import styles from '../[id]/edit/page.module.css';

const EMOJI_OPTIONS = ['💪', '🏋️', '🦵', '⚡', '🔥', '🎯', '💎', '🏃', '🧘', '👊', '🦾', '📋'];
const COLOR_OPTIONS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#F97316', '#22C55E', '#3B82F6', '#EC4899'];

export default function NewRoutinePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💪');
  const [color, setColor] = useState('#FF6B6B');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter a name for your routine.');
      return;
    }
    const slug = trimmed.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!slug) {
      setError('Name must contain at least one letter or number.');
      return;
    }
    setCreating(true);
    setError('');
    try {
      const routine = await createRoutine({
        routineId: slug,
        name: trimmed,
        description: description.trim() || undefined,
        color,
        icon,
        exercises: [],
      });
      router.push(`/routines/${routine.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create routine.');
      setCreating(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/routines" className={styles.backLink}>
          ← Back to routines
        </Link>
        <h1 className={styles.title}>New routine</h1>
        <p className={styles.subtitle}>
          Create a routine from scratch. You can add exercises on the next screen.
        </p>
      </header>

      <div className={styles.content}>
        <form onSubmit={handleSubmit}>
          <section className={styles.section}>
            <div className={styles.field}>
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Upper Body"
                className={styles.input}
                autoFocus
              />
            </div>
            <div className={styles.field}>
              <label>Emoji</label>
              <div className={styles.emojiRow}>
                {EMOJI_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    className={`${styles.emojiBtn} ${icon === em ? styles.emojiBtnActive : ''}`}
                    onClick={() => setIcon(em)}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label>Color</label>
              <div className={styles.colorRow}>
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={styles.colorBtn}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label>Description (optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description"
                className={styles.input}
              />
            </div>
          </section>

          {error && (
            <p className={styles.errorMsg} style={{ marginBottom: 'var(--space-md)' }}>
              {error}
            </p>
          )}

          <div className={styles.footer}>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={creating}
              style={{ backgroundColor: color }}
            >
              {creating ? 'Creating…' : 'Create & add exercises'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
