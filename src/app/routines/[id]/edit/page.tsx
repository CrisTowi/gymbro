'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Routine, RoutineExercise, Exercise } from '@/types';
import { fetchRoutineById, updateRoutine, fetchExercises } from '@/lib/api';
import { getExerciseById, getAlternativeExercises, getExerciseLocalized } from '@/data/exercises';
import { useLocale } from '@/context/LocaleContext';
import { formatTime } from '@/utils/time';
import SortableRow from '@/components/SortableRow/SortableRow';
import SwapPicker from './_components/SwapPicker/SwapPicker';
import styles from './page.module.css';

const touchActivation = { delay: 250, tolerance: 8 };
const pointerActivation = { distance: 8 };

const DEFAULT_EXERCISE: Omit<RoutineExercise, 'exerciseId'> = {
  sets: 3,
  reps: 10,
  restTimeSeconds: 90,
};

const EMOJI_OPTIONS = ['💪', '🏋️', '🦵', '⚡', '🔥', '🎯', '💎', '🏃', '🧘', '👊', '🦾', '📋'];
const COLOR_OPTIONS = [
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
  '#A78BFA',
  '#F97316',
  '#22C55E',
  '#3B82F6',
  '#EC4899',
];

export default function EditRoutinePage() {
  const t = useTranslations('routineEdit');
  const { locale } = useLocale();
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

  const lastOverIdRef = useRef<string | number | null>(null);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    if (event.over) lastOverIdRef.current = event.over.id;
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    const overId = over?.id ?? lastOverIdRef.current;
    lastOverIdRef.current = null;
    if (overId == null || String(overId) === String(active.id)) return;
    const fromIndex = Number(active.id);
    const toIndex = Number(overId);
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
          getExerciseLocalized(ex, locale)
            .name.toLowerCase()
            .includes(catalogSearch.toLowerCase()) ||
          ex.id.toLowerCase().includes(catalogSearch.toLowerCase())
      )
    : exerciseCatalog.slice(0, 50);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>{t('loading')}</div>
      </div>
    );
  }

  if (id !== 'new' && !routine) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <p>{t('routineNotFound')}</p>
          <Link href="/routines">{t('backToRoutines')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/routines" className={styles.backLink}>
          ← {t('backToRoutines')}
        </Link>
        <h1 className={styles.title}>{t('editRoutine')}</h1>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('nameAndStyle')}</h2>
          <div className={styles.field}>
            <label>{t('name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('namePlaceholder')}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label>{t('emoji')}</label>
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
            <label>{t('color')}</label>
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
            <label>{t('descriptionOptional')}</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              className={styles.input}
            />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('exercises')}</h2>
            <button
              type="button"
              className={styles.addExBtn}
              onClick={() => {
                setShowAddExercise(true);
                loadCatalog();
              }}
            >
              + {t('addExercise')}
            </button>
          </div>

          <ul className={styles.exerciseList}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={exercises.map((_, i) => String(i))}
                strategy={verticalListSortingStrategy}
              >
                {exercises.map((ex, index) => {
                  const meta = getExerciseById(ex.exerciseId);
                  return (
                    <SortableRow key={`${ex.exerciseId}-${index}`} id={String(index)}>
                      {({
                        setNodeRef,
                        setActivatorNodeRef,
                        listeners,
                        transform,
                        transition,
                        isDragging,
                      }) => (
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
                                {meta ? getExerciseLocalized(meta, locale).name : ex.exerciseId}
                              </span>
                            </div>
                            <div
                              ref={setActivatorNodeRef}
                              className={styles.dragHandle}
                              role="button"
                              tabIndex={0}
                              aria-label={t('dragToReorder')}
                              title={t('dragToReorder')}
                              {...listeners}
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
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
                                {t('howToPerform')}
                                <svg
                                  width="10"
                                  height="10"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
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
                              locale={locale}
                              onSelect={(newId) => handleSwapExercise(index, newId)}
                              onClose={() => setSwapIndex(null)}
                              t={t}
                            />
                          )}

                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              className={styles.actionBtn}
                              onClick={() => setSwapIndex(swapIndex === index ? null : index)}
                              aria-label={t('replaceWithAlternative')}
                              title={t('replaceWithAlternative')}
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
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
                              aria-label={t('removeExercise')}
                              title={t('removeExercise')}
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
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
                                aria-label={t('decreaseSets')}
                              >
                                −
                              </button>
                              <span className={styles.controlValue}>{ex.sets}</span>
                              <button
                                type="button"
                                className={styles.controlBtn}
                                onClick={() => updateExercise(index, 'sets', ex.sets + 1)}
                                aria-label={t('increaseSets')}
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
                                aria-label={t('decreaseReps')}
                              >
                                −
                              </button>
                              <span className={styles.controlValue}>{ex.reps}</span>
                              <button
                                type="button"
                                className={styles.controlBtn}
                                onClick={() => updateExercise(index, 'reps', ex.reps + 1)}
                                aria-label={t('increaseReps')}
                              >
                                +
                              </button>
                            </div>
                            <div className={styles.control}>
                              <button
                                type="button"
                                className={styles.controlBtn}
                                onClick={() =>
                                  updateExercise(
                                    index,
                                    'restTimeSeconds',
                                    Math.max(0, ex.restTimeSeconds - 15)
                                  )
                                }
                                disabled={ex.restTimeSeconds < 15}
                                aria-label={t('decreaseRest')}
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
                                aria-label={t('increaseRest')}
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
            <p className={styles.saveStatusSuccess} role="status">
              {t('routineSaved')}
            </p>
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
            {saving ? t('saving') : t('saveChanges')}
          </button>
        </div>
      </div>

      {showAddExercise && (
        <div className={styles.modalOverlay} onClick={() => setShowAddExercise(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{t('addExerciseTitle')}</h3>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowAddExercise(false)}
                aria-label={t('close')}
              >
                ×
              </button>
            </div>
            <input
              type="search"
              placeholder={t('searchPlaceholder')}
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
                    <span className={styles.catalogName}>
                      {getExerciseLocalized(ex, locale).name}
                    </span>
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
