'use client';

import { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RoutineType, Exercise } from '@/types';
import { getRoutineById } from '@/data/routines';
import { getExerciseById, getAlternativeExercises } from '@/data/exercises';
import { formatWeight } from '@/utils/weight';
import { formatTime } from '@/utils/time';
import { fetchLastExercisePerformance, LastExercisePerformance } from '@/lib/api';
import styles from './page.module.css';

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

function formatEstimate(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `~${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `~${hours}h ${remainMins}m`;
}

function PreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const routineId = searchParams.get('routine') as RoutineType | null;
  const routine = routineId ? getRoutineById(routineId) : null;

  const [overrides, setOverrides] = useState<ExerciseOverride[]>(() => {
    if (!routine) return [];
    return routine.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      sets: ex.sets,
      reps: ex.reps,
      restTimeSeconds: ex.restTimeSeconds,
    }));
  });

  const [swapIndex, setSwapIndex] = useState<number | null>(null);
  const [lastPerfMap, setLastPerfMap] = useState<Record<string, LastExercisePerformance | null>>({});

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

  const totalSets = useMemo(
    () => overrides.reduce((sum, ex) => sum + ex.sets, 0),
    [overrides]
  );

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

  const handleSwapExercise = useCallback(
    (index: number, newExerciseId: string) => {
      setOverrides((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], exerciseId: newExerciseId };
        return next;
      });
      setSwapIndex(null);
    },
    []
  );

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
    sessionStorage.setItem(
      'gymtrack_workout_overrides',
      JSON.stringify(overrides)
    );
    router.push(`/workout?routine=${routineId}`);
  }, [routineId, overrides, router]);

  if (!routine || !routineId) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>No routine selected</h2>
          <button onClick={() => router.push('/')} className={styles.backLink}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
      </header>

      <div className={styles.content}>
        <div
          className={styles.routineHeader}
          style={{ borderColor: routine.color }}
        >
          <span className={styles.routineIcon}>{routine.icon}</span>
          <h1 className={styles.routineName} style={{ color: routine.color }}>
            {routine.name}
          </h1>
          <p className={styles.routineDesc}>{routine.description}</p>
        </div>

        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{overrides.length}</span>
            <span className={styles.statLabel}>Exercises</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{totalSets}</span>
            <span className={styles.statLabel}>Total Sets</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{formatEstimate(estimatedSeconds)}</span>
            <span className={styles.statLabel}>Est. Time</span>
          </div>
        </div>

        {hasChanges && (
          <button className={styles.resetBtn} onClick={resetToDefaults}>
            Reset to defaults
          </button>
        )}

        <div className={styles.exerciseList}>
          <div className={styles.listHeader}>
            <span className={styles.listHeaderName}>Exercise</span>
            <span className={styles.listHeaderControl}>Sets</span>
            <span className={styles.listHeaderControl}>Reps</span>
            <span className={styles.listHeaderControl}>Rest</span>
          </div>

          {overrides.map((override, index) => {
            const exercise = getExerciseById(override.exerciseId);
            const defaultEx = routine.exercises[index];
            const lastPerf = lastPerfMap[override.exerciseId] ?? null;
            const isSwapped = defaultEx && override.exerciseId !== defaultEx.exerciseId;
            const isModified =
              isSwapped ||
              (defaultEx && (
                override.sets !== defaultEx.sets ||
                override.reps !== defaultEx.reps ||
                override.restTimeSeconds !== defaultEx.restTimeSeconds
              ));

            return (
              <div
                key={`${override.exerciseId}-${index}`}
                className={`${styles.exerciseRow} ${isModified ? styles.modified : ''} ${isSwapped ? styles.swapped : ''}`}
              >
                <div className={styles.exerciseInfo}>
                  <span className={styles.exerciseIndex}>{index + 1}</span>
                  <div className={styles.exerciseDetails}>
                    <div className={styles.exerciseNameRow}>
                      <span className={styles.exerciseName}>
                        {exercise?.name || override.exerciseId}
                      </span>
                      <button
                        className={styles.swapBtn}
                        onClick={() => setSwapIndex(swapIndex === index ? null : index)}
                        aria-label="Swap exercise"
                        title="Swap exercise"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="17 1 21 5 17 9" />
                          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                          <polyline points="7 23 3 19 7 15" />
                          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                        </svg>
                      </button>
                    </div>
                    <span className={styles.exerciseMeta}>
                      {exercise?.category} · {exercise?.equipment}
                      {isSwapped && defaultEx && (
                        <span className={styles.swappedNote}>
                          {' '}· replaces {getExerciseById(defaultEx.exerciseId)?.name}
                        </span>
                      )}
                      {!isSwapped && defaultEx?.notes && (
                        <span className={styles.exerciseNote}> · {defaultEx.notes}</span>
                      )}
                    </span>
                    {lastPerf && (
                      <span className={styles.lastWeight}>
                        Last: {formatWeight(lastPerf.weightLbs, false)} x {lastPerf.reps}
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
                        How to perform
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>

                {swapIndex === index && (
                  <SwapPicker
                    alternatives={swapAlternatives}
                    onSelect={(id) => handleSwapExercise(index, id)}
                    onClose={() => setSwapIndex(null)}
                  />
                )}

                <div className={styles.controls}>
                  <div className={styles.control}>
                    <button
                      className={styles.controlBtn}
                      onClick={() => updateOverride(index, 'sets', override.sets - 1)}
                      disabled={override.sets <= 1}
                      aria-label="Decrease sets"
                    >
                      −
                    </button>
                    <span className={styles.controlValue}>{override.sets}</span>
                    <button
                      className={styles.controlBtn}
                      onClick={() => updateOverride(index, 'sets', override.sets + 1)}
                      aria-label="Increase sets"
                    >
                      +
                    </button>
                  </div>

                  <div className={styles.control}>
                    <button
                      className={styles.controlBtn}
                      onClick={() => updateOverride(index, 'reps', override.reps - 1)}
                      disabled={override.reps <= 1}
                      aria-label="Decrease reps"
                    >
                      −
                    </button>
                    <span className={styles.controlValue}>{override.reps}</span>
                    <button
                      className={styles.controlBtn}
                      onClick={() => updateOverride(index, 'reps', override.reps + 1)}
                      aria-label="Increase reps"
                    >
                      +
                    </button>
                  </div>

                  <div className={styles.control}>
                    <button
                      className={styles.controlBtn}
                      onClick={() =>
                        updateOverride(index, 'restTimeSeconds', override.restTimeSeconds - 15)
                      }
                      disabled={override.restTimeSeconds <= 15}
                      aria-label="Decrease rest"
                    >
                      −
                    </button>
                    <span className={styles.controlValue}>
                      {formatTime(override.restTimeSeconds)}
                    </span>
                    <button
                      className={styles.controlBtn}
                      onClick={() =>
                        updateOverride(index, 'restTimeSeconds', override.restTimeSeconds + 15)
                      }
                      aria-label="Increase rest"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.footer}>
        <button
          className={styles.startBtn}
          onClick={handleStartWorkout}
          style={{ backgroundColor: routine.color }}
        >
          Start Workout
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          <button className={styles.swapPickerClose} onClick={onClose}>
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
        <span className={styles.swapPickerTitle}>Swap with alternative</span>
        <button className={styles.swapPickerClose} onClick={onClose}>
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
            className={styles.swapOption}
            onClick={() => onSelect(alt.id)}
          >
            <div className={styles.swapOptionInfo}>
              <span className={styles.swapOptionName}>{alt.name}</span>
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

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <div className={styles.loading}>Loading preview...</div>
        </div>
      }
    >
      <PreviewContent />
    </Suspense>
  );
}
