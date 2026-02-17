'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Routine, RoutineExercise } from '@/types';
import { Exercise } from '@/types';
import {
  fetchRoutineById,
  updateRoutine,
  fetchExercises,
} from '@/lib/api';
import { getExerciseById } from '@/data/exercises';
import styles from './page.module.css';

const DEFAULT_EXERCISE: Omit<RoutineExercise, 'exerciseId'> = {
  sets: 3,
  reps: 10,
  restTimeSeconds: 90,
};

const EMOJI_OPTIONS = ['💪', '🏋️', '🦵', '⚡', '🔥', '🎯', '💎', '🏃', '🧘', '👊', '🦾', '📋'];
const COLOR_OPTIONS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#F97316', '#22C55E', '#3B82F6', '#EC4899'];

export default function EditRoutinePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveErrorMessage, setSaveErrorMessage] = useState('');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);

  const [showAddExercise, setShowAddExercise] = useState(false);
  const [exerciseCatalog, setExerciseCatalog] = useState<Exercise[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');

  useEffect(() => {
    async function load() {
      if (id === 'new') return setLoading(false);
      try {
        const r = await fetchRoutineById(id);
        setRoutine(r);
        setName(r.name);
        setIcon(r.icon);
        setColor(r.color);
        setDescription(r.description ?? '');
        setExercises(r.exercises ?? []);
      } catch (err) {
        console.error('Failed to load routine:', err);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const loadCatalog = useCallback(async () => {
    try {
      const list = await fetchExercises();
      setExerciseCatalog(list);
    } catch (err) {
      console.error('Failed to load exercises:', err);
    }
  }, []);

  const handleSave = async () => {
    if (!id || id === 'new') return;
    setSaving(true);
    setSaveStatus('idle');
    setSaveErrorMessage('');
    try {
      await updateRoutine(id, {
        name,
        icon,
        color,
        description,
        exercises,
      });
      setSaveStatus('success');
      setTimeout(() => router.push('/routines'), 800);
    } catch (err) {
      setSaveStatus('error');
      setSaveErrorMessage(err instanceof Error ? err.message : 'Failed to save routine');
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  const addExercise = (exerciseId: string) => {
    if (exercises.some((e) => e.exerciseId === exerciseId)) return;
    setExercises((prev) => [...prev, { ...DEFAULT_EXERCISE, exerciseId }]);
    setShowAddExercise(false);
    setCatalogSearch('');
  };

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof RoutineExercise, value: number | string) => {
    setExercises((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const moveExercise = (index: number, dir: 'up' | 'down') => {
    const to = dir === 'up' ? index - 1 : index + 1;
    if (to < 0 || to >= exercises.length) return;
    setExercises((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      next.splice(to, 0, removed);
      return next;
    });
  };

  const filteredCatalog = catalogSearch.trim()
    ? exerciseCatalog.filter(
        (ex) =>
          ex.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
          ex.id.toLowerCase().includes(catalogSearch.toLowerCase())
      )
    : exerciseCatalog.slice(0, 50);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading…</div>
      </div>
    );
  }

  if (id !== 'new' && !routine) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <p>Routine not found.</p>
          <Link href="/routines">Back to routines</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/routines" className={styles.backLink}>
          ← Back to routines
        </Link>
        <h1 className={styles.title}>Edit routine</h1>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Name & style</h2>
          <div className={styles.field}>
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Upper Body"
              className={styles.input}
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

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Exercises</h2>
            <button
              type="button"
              className={styles.addExBtn}
              onClick={() => {
                setShowAddExercise(true);
                loadCatalog();
              }}
            >
              + Add exercise
            </button>
          </div>

          <ul className={styles.exerciseList}>
            {exercises.map((ex, index) => {
              const meta = getExerciseById(ex.exerciseId);
              return (
                <li key={`${ex.exerciseId}-${index}`} className={styles.exerciseRow}>
                  <span className={styles.exerciseIndex}>{index + 1}</span>
                  <div className={styles.exerciseInfo}>
                    <span className={styles.exerciseName}>
                      {meta?.name ?? ex.exerciseId}
                    </span>
                    {meta?.referenceUrl && (
                      <a
                        href={meta.referenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.howToLink}
                        onClick={(e) => e.stopPropagation()}
                      >
                        How to perform
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    )}
                    <div className={styles.exerciseControls}>
                      <div className={styles.miniControl}>
                        <label>Sets</label>
                        <input
                          type="number"
                          min={1}
                          value={ex.sets}
                          onChange={(e) =>
                            updateExercise(index, 'sets', parseInt(e.target.value, 10) || 1)
                          }
                          className={styles.miniInput}
                        />
                      </div>
                      <div className={styles.miniControl}>
                        <label>Reps</label>
                        <input
                          type="number"
                          min={1}
                          value={ex.reps}
                          onChange={(e) =>
                            updateExercise(index, 'reps', parseInt(e.target.value, 10) || 1)
                          }
                          className={styles.miniInput}
                        />
                      </div>
                      <div className={styles.miniControl}>
                        <label>Rest (s)</label>
                        <input
                          type="number"
                          min={0}
                          value={ex.restTimeSeconds}
                          onChange={(e) =>
                            updateExercise(
                              index,
                              'restTimeSeconds',
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className={styles.miniInput}
                        />
                      </div>
                    </div>
                  </div>
                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => moveExercise(index, 'up')}
                      disabled={index === 0}
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => moveExercise(index, 'down')}
                      disabled={index === exercises.length - 1}
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeExercise(index)}
                      aria-label="Remove"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <div className={styles.footer}>
          {saveStatus === 'success' && (
            <p className={styles.saveStatusSuccess} role="status">Routine saved!</p>
          )}
          {saveStatus === 'error' && (
            <p className={styles.saveStatusError} role="alert">
              {saveErrorMessage}
            </p>
          )}
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
            style={{ backgroundColor: color || 'var(--color-accent)' }}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      {showAddExercise && (
        <div className={styles.modalOverlay} onClick={() => setShowAddExercise(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Add exercise</h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowAddExercise(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <input
              type="search"
              placeholder="Search by name or id…"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              className={styles.searchInput}
            />
            <ul className={styles.catalogList}>
              {filteredCatalog.map((ex) => (
                <li key={ex.id}>
                  <button
                    type="button"
                    className={styles.catalogItem}
                    onClick={() => addExercise(ex.id)}
                    disabled={exercises.some((e) => e.exerciseId === ex.id)}
                  >
                    <span className={styles.catalogName}>{ex.name}</span>
                    <span className={styles.catalogMeta}>
                      {ex.category} · {ex.equipment}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
