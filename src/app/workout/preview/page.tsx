'use client';

import { useState, useMemo, useCallback, useEffect, useRef, Suspense, type ReactNode } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Exercise, type Locale } from '@/types';
import { fetchRoutineById } from '@/lib/api';
import type { Routine } from '@/types';
import { getExerciseById, getAlternativeExercises, getExerciseLocalized } from '@/data/exercises';
import { useLocale } from '@/context/LocaleContext';
import { formatWeight } from '@/utils/weight';
import { formatTime } from '@/utils/time';
import { fetchLastExercisePerformance, LastExercisePerformance } from '@/lib/api';
import styles from './page.module.css';

const touchActivation = { delay: 250, tolerance: 8 };
const pointerActivation = { distance: 8 };

interface ExerciseOverride {
  exerciseId: string;
  sets: number;
  reps: number;
  restTimeSeconds: number;
}

function estimateTime(exercises: ExerciseOverride[]): number {
  let totalSeconds = 0;
  for (const ex of exercises) {
    const timePerSet = 45;
    const setsTime = ex.sets * timePerSet;
    const restTime = (ex.sets - 1) * ex.restTimeSeconds;
    totalSeconds += setsTime + restTime;
  }
  return totalSeconds;
}

function formatEstimate(
  seconds: number,
  t: (key: string, values?: Record<string, number>) => string
): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return t('estTimeMin', { mins });
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return t('estTimeHours', { hours, remainMins });
}

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
  const { setNodeRef, setActivatorNodeRef, listeners, transform, transition, isDragging } =
    useSortable({ id });
  return (
    <>
      {children({ setNodeRef, setActivatorNodeRef, listeners, transform, transition, isDragging })}
    </>
  );
}

function PreviewContent() {
  const t = useTranslations('workoutPreview');
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const routineId = searchParams.get('routine');
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [routineLoading, setRoutineLoading] = useState(!!routineId);

  useEffect(() => {
    if (!routineId) {
      setRoutineLoading(false);
      return;
    }
    let cancelled = false;
    fetchRoutineById(routineId)
      .then((r) => {
        if (!cancelled) setRoutine(r);
      })
      .catch(() => {
        if (!cancelled) setRoutine(null);
      })
      .finally(() => {
        if (!cancelled) setRoutineLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [routineId]);

  const [overrides, setOverrides] = useState<ExerciseOverride[]>([]);
  useEffect(() => {
    if (routine?.exercises?.length) {
      setOverrides(
        routine.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          restTimeSeconds: ex.restTimeSeconds,
        }))
      );
    }
  }, [routine]);

  const [swapIndex, setSwapIndex] = useState<number | null>(null);
  const [lastPerfMap, setLastPerfMap] = useState<Record<string, LastExercisePerformance | null>>(
    {}
  );
  const [dontSave, setDontSave] = useState(false);

  // Fetch last performance for all exercises in the routine
  useEffect(() => {
    async function loadLastPerformances() {
      const ids = overrides.map((o) => o.exerciseId);
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const perf = await fetchLastExercisePerformance(id);
            return [id, perf] as const;
          } catch {
            return [id, null] as const;
          }
        })
      );
      const map: Record<string, LastExercisePerformance | null> = {};
      for (const [id, perf] of results) {
        map[id] = perf;
      }
      setLastPerfMap(map);
    }
    if (overrides.length > 0) loadLastPerformances();
  }, [overrides]);

  const estimatedSeconds = useMemo(() => estimateTime(overrides), [overrides]);

  const totalSets = useMemo(() => overrides.reduce((sum, ex) => sum + ex.sets, 0), [overrides]);

  const hasChanges = useMemo(() => {
    if (!routine) return false;
    if (overrides.length !== routine.exercises.length) return true;
    return overrides.some((o, i) => {
      const def = routine.exercises[i];
      return (
        o.exerciseId !== def.exerciseId ||
        o.sets !== def.sets ||
        o.reps !== def.reps ||
        o.restTimeSeconds !== def.restTimeSeconds
      );
    });
  }, [overrides, routine]);

  const swapAlternatives = useMemo(() => {
    if (swapIndex === null) return [];
    const current = overrides[swapIndex];
    if (!current) return [];
    const usedIds = overrides.map((o) => o.exerciseId);
    return getAlternativeExercises(current.exerciseId, usedIds);
  }, [swapIndex, overrides]);

  const updateOverride = useCallback(
    (index: number, field: keyof ExerciseOverride, value: number) => {
      setOverrides((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: Math.max(1, value) };
        return next;
      });
    },
    []
  );

  const handleSwapExercise = useCallback((index: number, newExerciseId: string) => {
    setOverrides((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], exerciseId: newExerciseId };
      return next;
    });
    setSwapIndex(null);
  }, []);

  const removeExercise = useCallback((index: number) => {
    setOverrides((prev) => prev.filter((_, i) => i !== index));
    setSwapIndex((current) =>
      current === index ? null : current != null && current > index ? current - 1 : current
    );
  }, []);

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
    setOverrides((prev) => arrayMove(prev, fromIndex, toIndex));
    setSwapIndex((current) => {
      if (current === null) return null;
      if (current === fromIndex) return toIndex;
      if (fromIndex < current && toIndex >= current) return current - 1;
      if (fromIndex > current && toIndex <= current) return current + 1;
      return current;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    if (!routine) return;
    setOverrides(
      routine.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets,
        reps: ex.reps,
        restTimeSeconds: ex.restTimeSeconds,
      }))
    );
  }, [routine]);

  const handleStartWorkout = useCallback(() => {
    if (!routineId) return;
    sessionStorage.setItem('gymbro_workout_overrides', JSON.stringify(overrides));
    if (dontSave) {
      sessionStorage.setItem('gymbro_practice_session', '1');
    } else {
      sessionStorage.removeItem('gymbro_practice_session');
    }
    router.push(`/workout?routine=${routineId}`);
  }, [routineId, overrides, dontSave, router]);

  if (routineLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>{t('loadingRoutine')}</div>
      </div>
    );
  }

  if (!routine || !routineId) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>{t('noRoutineSelected')}</h2>
          <button onClick={() => router.push('/')} className={styles.backLink}>
            {t('goHome')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/')}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          {t('back')}
        </button>
      </header>

      <div className={styles.content}>
        <div className={styles.routineHeader} style={{ borderColor: routine.color }}>
          <span className={styles.routineIcon}>{routine.icon}</span>
          <h1 className={styles.routineName} style={{ color: routine.color }}>
            {routine.name}
          </h1>
          <p className={styles.routineDesc}>{routine.description}</p>
        </div>

        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{overrides.length}</span>
            <span className={styles.statLabel}>{t('exercises')}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{totalSets}</span>
            <span className={styles.statLabel}>{t('totalSets')}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{formatEstimate(estimatedSeconds, t)}</span>
            <span className={styles.statLabel}>{t('estTime')}</span>
          </div>
        </div>

        {hasChanges && (
          <button className={styles.resetBtn} onClick={resetToDefaults}>
            {t('resetToDefaults')}
          </button>
        )}

        <div className={styles.exerciseList}>
          <div className={styles.listHeader}>
            <span className={styles.listHeaderName}>{t('exercise')}</span>
            <span className={styles.listHeaderControl}>{t('sets')}</span>
            <span className={styles.listHeaderControl}>{t('reps')}</span>
            <span className={styles.listHeaderControl}>{t('rest')}</span>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={overrides.map((_, i) => String(i))}
              strategy={verticalListSortingStrategy}
            >
              {overrides.map((override, index) => {
                const exercise = getExerciseById(override.exerciseId);
                const defaultEx = routine.exercises[index];
                const lastPerf = lastPerfMap[override.exerciseId] ?? null;
                const isSwapped = defaultEx && override.exerciseId !== defaultEx.exerciseId;
                const isModified =
                  isSwapped ||
                  (defaultEx &&
                    (override.sets !== defaultEx.sets ||
                      override.reps !== defaultEx.reps ||
                      override.restTimeSeconds !== defaultEx.restTimeSeconds));

                return (
                  <SortableRow key={`${override.exerciseId}-${index}`} id={String(index)}>
                    {({
                      setNodeRef,
                      setActivatorNodeRef,
                      listeners,
                      transform,
                      transition,
                      isDragging,
                    }) => (
                      <div
                        ref={setNodeRef}
                        style={{
                          transform: CSS.Transform.toString(transform),
                          transition,
                        }}
                        className={`${styles.exerciseRow} ${isModified ? styles.modified : ''} ${isSwapped ? styles.swapped : ''} ${isDragging ? styles.dragging : ''}`}
                      >
                        <div className={styles.cardHeader}>
                          <div className={styles.exerciseInfo}>
                            <span className={styles.exerciseIndex}>{index + 1}</span>
                            <span className={styles.exerciseName}>
                              {exercise
                                ? getExerciseLocalized(exercise, locale).name
                                : override.exerciseId}
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
                            {exercise?.category} · {exercise?.equipment}
                            {isSwapped && defaultEx && (
                              <span className={styles.swappedNote}>
                                {' '}
                                ·{' '}
                                {t('replacesExercise', {
                                  name: (() => {
                                    const ex = getExerciseById(defaultEx.exerciseId);
                                    return ex
                                      ? getExerciseLocalized(ex, locale).name
                                      : defaultEx.exerciseId;
                                  })(),
                                })}
                              </span>
                            )}
                            {!isSwapped && defaultEx?.notes && (
                              <span className={styles.exerciseNote}> · {defaultEx.notes}</span>
                            )}
                          </span>
                          {lastPerf && (
                            <span className={styles.lastWeight}>
                              {t('lastWeight', {
                                weight: formatWeight(lastPerf.weightLbs, false),
                                reps: lastPerf.reps,
                              })}
                            </span>
                          )}
                          {exercise?.referenceUrl && (
                            <a
                              href={exercise.referenceUrl}
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
                            onSelect={(id) => handleSwapExercise(index, id)}
                            onClose={() => setSwapIndex(null)}
                            t={t}
                          />
                        )}

                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => setSwapIndex(swapIndex === index ? null : index)}
                            aria-label={t('swapExercise')}
                            title={t('swapExercise')}
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
                              className={styles.controlBtn}
                              onClick={() => updateOverride(index, 'sets', override.sets - 1)}
                              disabled={override.sets <= 1}
                              aria-label={t('decreaseSets')}
                            >
                              −
                            </button>
                            <span className={styles.controlValue}>{override.sets}</span>
                            <button
                              className={styles.controlBtn}
                              onClick={() => updateOverride(index, 'sets', override.sets + 1)}
                              aria-label={t('increaseSets')}
                            >
                              +
                            </button>
                          </div>

                          <div className={styles.control}>
                            <button
                              className={styles.controlBtn}
                              onClick={() => updateOverride(index, 'reps', override.reps - 1)}
                              disabled={override.reps <= 1}
                              aria-label={t('decreaseReps')}
                            >
                              −
                            </button>
                            <span className={styles.controlValue}>{override.reps}</span>
                            <button
                              className={styles.controlBtn}
                              onClick={() => updateOverride(index, 'reps', override.reps + 1)}
                              aria-label={t('increaseReps')}
                            >
                              +
                            </button>
                          </div>

                          <div className={styles.control}>
                            <button
                              className={styles.controlBtn}
                              onClick={() =>
                                updateOverride(
                                  index,
                                  'restTimeSeconds',
                                  override.restTimeSeconds - 15
                                )
                              }
                              disabled={override.restTimeSeconds <= 15}
                              aria-label={t('decreaseRest')}
                            >
                              −
                            </button>
                            <span className={styles.controlValue}>
                              {formatTime(override.restTimeSeconds)}
                            </span>
                            <button
                              className={styles.controlBtn}
                              onClick={() =>
                                updateOverride(
                                  index,
                                  'restTimeSeconds',
                                  override.restTimeSeconds + 15
                                )
                              }
                              aria-label={t('increaseRest')}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </SortableRow>
                );
              })}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      <div className={styles.footer}>
        <label className={styles.dontSaveLabel}>
          <input
            type="checkbox"
            checked={dontSave}
            onChange={(e) => setDontSave(e.target.checked)}
            className={styles.dontSaveCheckbox}
          />
          <span>{t('dontSaveWorkout')}</span>
        </label>
        <p className={styles.dontSaveHint}>{t('dontSaveHint')}</p>
        {overrides.length === 0 && <p className={styles.noExercisesHint}>{t('addOneExercise')}</p>}
        <button
          className={styles.startBtn}
          onClick={handleStartWorkout}
          disabled={overrides.length === 0}
          style={{ backgroundColor: routine.color }}
        >
          {t('startWorkout')}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function SwapPicker({
  alternatives,
  locale,
  onSelect,
  onClose,
  t,
}: {
  alternatives: Exercise[];
  locale: Locale;
  onSelect: (exerciseId: string) => void;
  onClose: () => void;
  t: (key: string) => string;
}) {
  if (alternatives.length === 0) {
    return (
      <div className={styles.swapPicker}>
        <div className={styles.swapPickerHeader}>
          <span className={styles.swapPickerTitle}>{t('noAlternatives')}</span>
          <button className={styles.swapPickerClose} onClick={onClose} aria-label={t('close')}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
        <span className={styles.swapPickerTitle}>{t('swapWithAlternative')}</span>
        <button className={styles.swapPickerClose} onClick={onClose} aria-label={t('close')}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className={styles.swapPickerList}>
        {alternatives.map((alt) => (
          <button key={alt.id} className={styles.swapOption} onClick={() => onSelect(alt.id)}>
            <div className={styles.swapOptionInfo}>
              <span className={styles.swapOptionName}>
                {getExerciseLocalized(alt, locale).name}
              </span>
              <span className={styles.swapOptionMeta}>
                {alt.equipment}
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
                      {t('howTo')}
                    </a>
                  </>
                )}
              </span>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

function PreviewFallback() {
  const t = useTranslations('workoutPreview');
  return (
    <div className={styles.page}>
      <div className={styles.loading}>{t('loadingPreview')}</div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<PreviewFallback />}>
      <PreviewContent />
    </Suspense>
  );
}
