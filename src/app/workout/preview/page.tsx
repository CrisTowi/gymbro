'use client';

import { useState, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RoutineType, RoutineExercise } from '@/types';
import { getRoutineById } from '@/data/routines';
import { getExerciseById } from '@/data/exercises';
import { getLastSessionForExercise } from '@/utils/storage';
import { formatWeight } from '@/utils/weight';
import { formatTime } from '@/utils/time';
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

  const estimatedSeconds = useMemo(() => estimateTime(overrides), [overrides]);

  const totalSets = useMemo(
    () => overrides.reduce((sum, ex) => sum + ex.sets, 0),
    [overrides]
  );

  const hasChanges = useMemo(() => {
    if (!routine) return false;
    return overrides.some((o, i) => {
      const def = routine.exercises[i];
      return o.sets !== def.sets || o.reps !== def.reps || o.restTimeSeconds !== def.restTimeSeconds;
    });
  }, [overrides, routine]);

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
            const lastPerf = getLastSessionForExercise(override.exerciseId);
            const isModified =
              override.sets !== defaultEx.sets ||
              override.reps !== defaultEx.reps ||
              override.restTimeSeconds !== defaultEx.restTimeSeconds;

            return (
              <div
                key={override.exerciseId}
                className={`${styles.exerciseRow} ${isModified ? styles.modified : ''}`}
              >
                <div className={styles.exerciseInfo}>
                  <span className={styles.exerciseIndex}>{index + 1}</span>
                  <div className={styles.exerciseDetails}>
                    <span className={styles.exerciseName}>
                      {exercise?.name || override.exerciseId}
                    </span>
                    <span className={styles.exerciseMeta}>
                      {exercise?.category} · {exercise?.equipment}
                      {defaultEx.notes && (
                        <span className={styles.exerciseNote}> · {defaultEx.notes}</span>
                      )}
                    </span>
                    {lastPerf && (
                      <span className={styles.lastWeight}>
                        Last: {formatWeight(lastPerf.weightLbs, false)} x {lastPerf.reps}
                      </span>
                    )}
                  </div>
                </div>

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
