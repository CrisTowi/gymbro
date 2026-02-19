'use client';

import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Routine, RoutineExercise } from '@/types';
import { Exercise } from '@/types';
import {
  fetchRoutineById,
  updateRoutine,
  fetchExercises,
} from '@/lib/api';
import { getExerciseById, getAlternativeExercises } from '@/data/exercises';
import { formatTime } from '@/utils/time';
import styles from './page.module.css';

const touchActivation = { delay: 250, tolerance: 8 };
const pointerActivation = { distance: 8 };

function SortableRow({
  id,
  children,
}: {
  id: string;
  children: (props: {
    setNodeRef: (node: HTMLElement | null) => void;
    setActivatorNodeRef: (node: HTMLElement | null) => void;
    listeners: Record<string, unknown> | undefined;
    transform: { x: number; y: number; scaleX: number; scaleY: number } | null;
    transition: string | undefined;
    isDragging: boolean;
  }) => ReactNode;
}) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  return (
    <>{children({ setNodeRef, setActivatorNodeRef, listeners, transform, transition, isDragging })}</>
  );
}

const DEFAULT_EXERCISE: Omit<RoutineExercise, 'exerciseId'> = {
  sets: 3,
  reps: 10,
  restTimeSeconds: 90,
};

const EMOJI_OPTIONS = ['💪', '🏋️', '🦵', '⚡', '🔥', '🎯', '💎', '🏃', '🧘', '👊', '🦾', '📋'];
const COLOR_OPTIONS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#F97316', '#22C55E', '#3B82F6', '#EC4899'];

function SwapPicker({
  alternatives,
  onSelect,
  onClose,
}: {
  alternatives: Exercise[];
  onSelect: (exerciseId: string) => void;
  onClose: () => void;
}) {
  if (alternatives.length === 0) {
    return (
      <div className={styles.swapPicker}>
        <div className={styles.swapPickerHeader}>
          <span className={styles.swapPickerTitle}>No alternatives available</span>
          <button type="button" className={styles.swapPickerClose} onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.swapPicker}>
      <div className={styles.swapPickerHeader}>
        <span className={styles.swapPickerTitle}>Replace with alternative</span>
        <button type="button" className={styles.swapPickerClose} onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className={styles.swapPickerList}>
        {alternatives.map((alt) => (
          <button
            key={alt.id}
            type="button"
            className={styles.swapOption}
            onClick={() => onSelect(alt.id)}
          >
            <div className={styles.swapOptionInfo}>
              <span className={styles.swapOptionName}>{alt.name}</span>
              <span className={styles.swapOptionMeta}>
                {alt.category} · {alt.equipment}
                {alt.referenceUrl && (
                  <>
                    {' · '}
                    <a
                      href={alt.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.swapOptionLink}
                      onClick={(e) => e.stopPropagation()}
                    >
                      How to
                    </a>
                  </>
                )}
              </span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

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
  const [swapIndex, setSwapIndex] = useState<number | null>(null);

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

  const sensors = useSensors(
    useSensor(TouchSensor, { activationConstraint: touchActivation }),
    useSensor(PointerSensor, { activationConstraint: pointerActivation })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = Number(active.id);
    const toIndex = Number(over.id);
    if (Number.isNaN(fromIndex) || Number.isNaN(toIndex)) return;
    setExercises((prev) => arrayMove(prev, fromIndex, toIndex));
  }, []);

  const handleSwapExercise = (index: number, newExerciseId: string) => {
    setExercises((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], exerciseId: newExerciseId };
      return next;
    });
    setSwapIndex(null);
  };

  const swapAlternatives =
    swapIndex !== null && exercises[swapIndex]
      ? getAlternativeExercises(
          exercises[swapIndex].exerciseId,
          exercises.map((e) => e.exerciseId)
        )
      : [];

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
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext
                items={exercises.map((_, i) => String(i))}
                strategy={verticalListSortingStrategy}
              >
                {exercises.map((ex, index) => {
                  const meta = getExerciseById(ex.exerciseId);
                  return (
                    <SortableRow key={`${ex.exerciseId}-${index}`} id={String(index)}>
                      {({ setNodeRef, setActivatorNodeRef, listeners, transform, transition, isDragging }) => (
                        <li
                          ref={setNodeRef}
                          style={{
                            transform: CSS.Transform.toString(transform),
                            transition,
                          }}
                          className={`${styles.exerciseRow} ${isDragging ? styles.dragging : ''}`}
                        >
                          <div className={styles.cardHeader}>
                            <div className={styles.exerciseInfo}>
                              <span className={styles.exerciseIndex}>{index + 1}</span>
                              <span className={styles.exerciseName}>
                                {meta?.name ?? ex.exerciseId}
                              </span>
                            </div>
                            <div
                              ref={setActivatorNodeRef}
                              className={styles.dragHandle}
                              role="button"
                              tabIndex={0}
                              aria-label="Drag to reorder"
                              title="Drag to reorder"
                              {...listeners}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="5" r="1" />
                                <circle cx="9" cy="12" r="1" />
                                <circle cx="9" cy="19" r="1" />
                                <circle cx="15" cy="5" r="1" />
                                <circle cx="15" cy="12" r="1" />
                                <circle cx="15" cy="19" r="1" />
                              </svg>
                            </div>
                          </div>
                          <div className={styles.exerciseDetails}>
                            <span className={styles.exerciseMeta}>
                              {meta?.category} · {meta?.equipment}
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
                          </div>

                          {swapIndex === index && (
                            <SwapPicker
                              alternatives={swapAlternatives}
                              onSelect={(id) => handleSwapExercise(index, id)}
                              onClose={() => setSwapIndex(null)}
                            />
                          )}

                          <div className={styles.rowActions}>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => setSwapIndex(swapIndex === index ? null : index)}
                      aria-label="Replace with alternative"
                      title="Replace with alternative"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="17 1 21 5 17 9" />
                        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                        <polyline points="7 23 3 19 7 15" />
                        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                      onClick={() => removeExercise(index)}
                      aria-label="Remove exercise"
                      title="Remove exercise"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                          </div>

                          <div className={styles.controls}>
                            <div className={styles.control}>
                              <button
                                type="button"
                                className={styles.controlBtn}
                                onClick={() => updateExercise(index, 'sets', ex.sets - 1)}
                                disabled={ex.sets <= 1}
                                aria-label="Decrease sets"
                              >
                                −
                              </button>
                              <span className={styles.controlValue}>{ex.sets}</span>
                              <button
                                type="button"
                                className={styles.controlBtn}
                                onClick={() => updateExercise(index, 'sets', ex.sets + 1)}
                                aria-label="Increase sets"
                              >
                                +
                              </button>
                            </div>
                            <div className={styles.control}>
                              <button
                                type="button"
                                className={styles.controlBtn}
                                onClick={() => updateExercise(index, 'reps', ex.reps - 1)}
                                disabled={ex.reps <= 1}
                                aria-label="Decrease reps"
                              >
                                −
                              </button>
                              <span className={styles.controlValue}>{ex.reps}</span>
                              <button
                                type="button"
                                className={styles.controlBtn}
                                onClick={() => updateExercise(index, 'reps', ex.reps + 1)}
                                aria-label="Increase reps"
                              >
                                +
                              </button>
                            </div>
                            <div className={styles.control}>
                              <button
                                type="button"
                                className={styles.controlBtn}
                                onClick={() =>
                                  updateExercise(index, 'restTimeSeconds', Math.max(0, ex.restTimeSeconds - 15))
                                }
                                disabled={ex.restTimeSeconds < 15}
                                aria-label="Decrease rest"
                              >
                                −
                              </button>
                              <span className={styles.controlValue}>
                                {formatTime(ex.restTimeSeconds)}
                              </span>
                              <button
                                type="button"
                                className={styles.controlBtn}
                                onClick={() =>
                                  updateExercise(index, 'restTimeSeconds', ex.restTimeSeconds + 15)
                                }
                                aria-label="Increase rest"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </li>
                      )}
                    </SortableRow>
                  );
                })}
              </SortableContext>
            </DndContext>
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
