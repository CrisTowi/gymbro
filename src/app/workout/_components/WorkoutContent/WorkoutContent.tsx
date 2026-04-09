'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { SessionLog, ExerciseLog, SetLog, RoutineExercise } from '@/types';
import type { Routine } from '@/types';
import { fetchRoutineById } from '@/lib/api';
import { getExerciseById, getExerciseLocalized } from '@/data/exercises';
import { useLocale } from '@/context/LocaleContext';
import { useTimer } from '@/hooks/useTimer';
import { useNotification } from '@/hooks/useNotification';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { formatDuration } from '@/utils/time';
import { useTranslations } from 'next-intl';
import {
  fetchActiveSession,
  createSession,
  updateSession as apiUpdateSession,
  fetchLastExercisePerformance,
  fetchRecommendedSets,
  LastExercisePerformance,
  RecommendedSet,
} from '@/lib/api';
import {
  getRoutines,
  getLastSessionForExercise,
  getRecommendedSetsForExercise,
  saveSession,
  saveActiveSession,
} from '@/utils/storage';
import { addToOfflineQueue } from '@/utils/offlineQueue';
import WorkoutExercise from '@/components/WorkoutExercise/WorkoutExercise';
import RestTimer from '@/components/RestTimer/RestTimer';
import styles from '../../page.module.css';

interface ExerciseOverride {
  exerciseId: string;
  sets: number;
  reps: number;
  restTimeSeconds: number;
}

function readOverrides(): ExerciseOverride[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('gymbro_workout_overrides');
    if (!raw) return null;
    sessionStorage.removeItem('gymbro_workout_overrides');
    return JSON.parse(raw) as ExerciseOverride[];
  } catch {
    return null;
  }
}

function readPracticeFlag(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const flag = sessionStorage.getItem('gymbro_practice_session') === '1';
    sessionStorage.removeItem('gymbro_practice_session');
    return flag;
  } catch {
    return false;
  }
}

export default function WorkoutContent() {
  const t = useTranslations('workout');
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isOnline = useNetworkStatus();
  const routineId = searchParams.get('routine');
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [routineLoading, setRoutineLoading] = useState(!!routineId);

  useEffect(() => {
    if (!routineId) {
      setRoutineLoading(false);
      return;
    }
    let cancelled = false;

    async function loadRoutine() {
      try {
        const fetchedRoutine = await fetchRoutineById(routineId!);
        if (!cancelled) setRoutine(fetchedRoutine);
      } catch {
        // Network failed — try the locally cached routines
        const { routines: cached } = getRoutines();
        const found = cached.find((cachedRoutine) => cachedRoutine.id === routineId) ?? null;
        if (!cancelled) setRoutine(found);
      } finally {
        if (!cancelled) setRoutineLoading(false);
      }
    }

    loadRoutine();
    return () => {
      cancelled = true;
    };
  }, [routineId]);

  const [session, setSession] = useState<SessionLog | null>(null);
  const [effectiveExercises, setEffectiveExercises] = useState<RoutineExercise[]>([]);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [nextExercisePreview, setNextExercisePreview] = useState<{
    name: string;
    instructions: string[];
    referenceUrl?: string;
    nextSetWeightLbs?: number;
    nextSetReps?: number;
  } | null>(null);
  const [_currentRestTime, setCurrentRestTime] = useState(120);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [showPracticeSummary, setShowPracticeSummary] = useState(false);
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);
  const shouldFinishAfterLastSetRef = useRef(false);

  const hasIncompleteSets = useCallback((sessionLog: SessionLog) => {
    return sessionLog.exercises.some((ex) =>
      ex.sets.some((set) => !set.completed || set.reps === 0)
    );
  }, []);

  const [lastPerfMap, setLastPerfMap] = useState<Record<string, LastExercisePerformance | null>>(
    {}
  );
  const [recSetsMap, setRecSetsMap] = useState<Record<string, RecommendedSet[]>>({});

  const { permission, requestPermission, sendNotification } = useNotification();

  const handleTimerComplete = useCallback(() => {
    setShowTimer(false);
    setNextExercisePreview(null);
    sendNotification(t('restCompleteTitle'), {
      body: t('restCompleteBody'),
      tag: 'rest-timer',
      requireInteraction: true,
    });
  }, [sendNotification, t]);

  const timer = useTimer(handleTimerComplete);

  useEffect(() => {
    if (permission === 'default') {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    if (!session) return;
    type OrientationWithLock = ScreenOrientation & {
      lock?: (orientation: string) => Promise<void>;
    };
    const orientation =
      typeof screen !== 'undefined' ? (screen.orientation as OrientationWithLock) : null;
    orientation?.lock?.('portrait')?.catch(() => {});
    return () => {
      try {
        screen?.orientation?.unlock?.();
      } catch {
        /* ignore */
      }
    };
  }, [session]);

  useEffect(() => {
    if (!session) return;
    let sentinel: WakeLockSentinel | null = null;
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    const wakeLock =
      nav && 'wakeLock' in nav
        ? (nav as Navigator & { wakeLock: { request(type: 'screen'): Promise<WakeLockSentinel> } })
            .wakeLock
        : null;

    async function requestWakeLock() {
      if (wakeLock) {
        try {
          sentinel = await wakeLock.request('screen');
        } catch {
          // Ignore
        }
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        sentinel = null;
      } else {
        requestWakeLock();
      }
    }

    requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      sentinel?.release().catch(() => {});
    };
  }, [session]);

  const loadExerciseData = useCallback(
    async (exerciseConfigs: RoutineExercise[]) => {
      const perfMap: Record<string, LastExercisePerformance | null> = {};
      const recsMap: Record<string, RecommendedSet[]> = {};

      if (!isOnline) {
        // Offline: read from locally cached session history
        for (const ex of exerciseConfigs) {
          perfMap[ex.exerciseId] = getLastSessionForExercise(ex.exerciseId);
          recsMap[ex.exerciseId] = getRecommendedSetsForExercise(ex.exerciseId, ex.sets);
        }
      } else {
        await Promise.all(
          exerciseConfigs.map(async (ex) => {
            try {
              perfMap[ex.exerciseId] = await fetchLastExercisePerformance(ex.exerciseId);
            } catch {
              perfMap[ex.exerciseId] = null;
            }
            try {
              recsMap[ex.exerciseId] = await fetchRecommendedSets(ex.exerciseId, ex.sets);
            } catch {
              recsMap[ex.exerciseId] = [];
            }
          })
        );
      }

      setLastPerfMap(perfMap);
      setRecSetsMap(recsMap);
    },
    [isOnline]
  );

  useEffect(() => {
    if (!routine || !routineId) return;

    const practice = readPracticeFlag();
    setIsPracticeMode(practice);

    async function init() {
      try {
        if (!practice && isOnline) {
          const existingSession = await fetchActiveSession();
          if (existingSession && existingSession.routineId === routineId) {
            setSession(existingSession);
            const resumedConfig: RoutineExercise[] = existingSession.exercises.map((ex, i) => {
              const routineEx = routine!.exercises[i];
              return {
                exerciseId: ex.exerciseId,
                sets: routineEx?.sets ?? ex.sets.length,
                reps: routineEx?.reps ?? 12,
                restTimeSeconds: routineEx?.restTimeSeconds ?? 120,
                notes: routineEx?.notes,
              };
            });
            setEffectiveExercises(resumedConfig);
            await loadExerciseData(resumedConfig);
            return;
          }
        }

        const overrides = readOverrides();

        const exerciseConfig: RoutineExercise[] = overrides
          ? overrides.map((overrideEx, i) => ({
              exerciseId: overrideEx.exerciseId,
              sets: overrideEx.sets,
              reps: overrideEx.reps,
              restTimeSeconds: overrideEx.restTimeSeconds,
              notes: routine!.exercises[i]?.notes,
            }))
          : routine!.exercises;

        setEffectiveExercises(exerciseConfig);

        const sessionId = uuidv4();
        const now = new Date().toISOString();

        const exerciseLogs: ExerciseLog[] = exerciseConfig.map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: Array.from({ length: ex.sets }, (_, setIndex) => ({
            setNumber: setIndex + 1,
            reps: 0,
            weightLbs: 0,
            completed: false,
          })),
        }));

        const sessionPayload: SessionLog = {
          id: sessionId,
          date: now,
          routineId: routineId!,
          startTime: now,
          exercises: exerciseLogs,
          totalWeightLbs: 0,
          completed: false,
        };

        if (practice || !isOnline) {
          // Practice mode or offline: run the session entirely in local state.
          // Offline sessions will be queued for sync on completion.
          setSession(sessionPayload);
          if (!isOnline) {
            saveActiveSession(sessionPayload);
          }
        } else {
          const newSession = await createSession({
            sessionId,
            date: now,
            routineId: routineId!,
            startTime: now,
            exercises: exerciseLogs,
          });
          setSession(newSession);
        }
        await loadExerciseData(exerciseConfig);
      } catch (err) {
        console.error('Failed to initialize workout:', err);
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routine, routineId, isOnline]);

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      const start = new Date(session.startTime).getTime();
      const now = Date.now();
      setElapsedSeconds(Math.floor((now - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const persistSession = useCallback(
    async (updated: SessionLog) => {
      if (isPracticeMode) return;
      if (!isOnline) {
        // Offline: keep local state consistent in case the tab is closed mid-workout
        saveActiveSession(updated);
        return;
      }
      try {
        await apiUpdateSession(updated.id, {
          exercises: updated.exercises,
          totalWeightLbs: updated.totalWeightLbs,
        });
      } catch (err) {
        console.error('Failed to sync session:', err);
      }
    },
    [isPracticeMode, isOnline]
  );

  const updateSessionLocal = useCallback(
    (updater: (prev: SessionLog) => SessionLog) => {
      setSession((prev) => {
        if (!prev) return prev;
        const updated = updater(prev);
        const totalWeight = updated.exercises.reduce(
          (total, ex) =>
            total +
            ex.sets.filter((s) => s.completed).reduce((sum, s) => sum + s.weightLbs * s.reps, 0),
          0
        );
        const withTotal = { ...updated, totalWeightLbs: totalWeight };
        persistSession(withTotal);
        return withTotal;
      });
    },
    [persistSession]
  );

  const handleSetComplete = useCallback(
    (exerciseIndex: number, setIndex: number, weight: number, reps: number) => {
      updateSessionLocal((prev) => {
        const exercises = [...prev.exercises];
        const exercise = { ...exercises[exerciseIndex] };
        const sets = [...exercise.sets];
        sets[setIndex] = {
          ...sets[setIndex],
          weightLbs: weight,
          reps,
          completed: true,
          timestamp: new Date().toISOString(),
        };
        exercise.sets = sets;
        exercises[exerciseIndex] = exercise;
        return { ...prev, exercises };
      });

      const exerciseConfig = effectiveExercises[exerciseIndex];
      const hasMoreSetsInExercise = setIndex + 1 < (exerciseConfig?.sets ?? 0);
      const _nextExerciseIndex = hasMoreSetsInExercise ? exerciseIndex : exerciseIndex + 1;
      const nextSetIndex = hasMoreSetsInExercise ? setIndex + 1 : 0;
      const isLastSetOfRoutine =
        !hasMoreSetsInExercise && exerciseIndex >= effectiveExercises.length - 1;

      if (isLastSetOfRoutine) {
        (document.activeElement as HTMLElement)?.blur?.();
        shouldFinishAfterLastSetRef.current = true;
        return;
      }

      const nextExerciseId = hasMoreSetsInExercise
        ? exerciseConfig?.exerciseId
        : effectiveExercises[exerciseIndex + 1]?.exerciseId;
      const nextExercise = nextExerciseId ? getExerciseById(nextExerciseId) : null;
      const localized = nextExercise ? getExerciseLocalized(nextExercise, locale) : null;
      const nextRecSets = nextExerciseId ? (recSetsMap[nextExerciseId] ?? []) : [];
      const nextRec = nextRecSets[nextSetIndex];
      setNextExercisePreview(
        localized
          ? {
              name: localized.name,
              instructions: localized.instructions,
              referenceUrl: nextExercise?.referenceUrl,
              nextSetWeightLbs: nextRec?.weightLbs,
              nextSetReps: nextRec?.reps,
            }
          : null
      );

      if (!hasMoreSetsInExercise && exerciseIndex + 1 < effectiveExercises.length) {
        setActiveExerciseIndex(exerciseIndex + 1);
      }

      const restTime = exerciseConfig?.restTimeSeconds || 120;
      (document.activeElement as HTMLElement)?.blur?.();
      setCurrentRestTime(restTime);
      timer.start(restTime);
      setShowTimer(true);
    },
    [updateSessionLocal, effectiveExercises, timer, locale, recSetsMap]
  );

  const handleUpdateSet = useCallback(
    (exerciseIndex: number, setIndex: number, updates: Partial<SetLog>) => {
      updateSessionLocal((prev) => {
        const exercises = [...prev.exercises];
        const exercise = { ...exercises[exerciseIndex] };
        const sets = [...exercise.sets];
        sets[setIndex] = { ...sets[setIndex], ...updates };
        exercise.sets = sets;
        exercises[exerciseIndex] = exercise;
        return { ...prev, exercises };
      });
    },
    [updateSessionLocal]
  );

  const handleAddSet = useCallback(
    (exerciseIndex: number) => {
      updateSessionLocal((prev) => {
        const exercises = [...prev.exercises];
        const exercise = { ...exercises[exerciseIndex] };
        exercise.sets = [
          ...exercise.sets,
          {
            setNumber: exercise.sets.length + 1,
            reps: 0,
            weightLbs: 0,
            completed: false,
          },
        ];
        exercises[exerciseIndex] = exercise;
        return { ...prev, exercises };
      });
    },
    [updateSessionLocal]
  );

  const handleRemoveSet = useCallback(
    (exerciseIndex: number, setIndex: number) => {
      updateSessionLocal((prev) => {
        const exercises = [...prev.exercises];
        const exercise = { ...exercises[exerciseIndex] };
        exercise.sets = exercise.sets.filter((_, i) => i !== setIndex);
        exercise.sets = exercise.sets.map((s, i) => ({
          ...s,
          setNumber: i + 1,
        }));
        exercises[exerciseIndex] = exercise;
        return { ...prev, exercises };
      });
    },
    [updateSessionLocal]
  );

  const handleMoveExercise = useCallback(
    (fromIndex: number, toIndex: number) => {
      updateSessionLocal((prev) => {
        const exercises = [...prev.exercises];
        const [moved] = exercises.splice(fromIndex, 1);
        exercises.splice(toIndex, 0, moved);
        return { ...prev, exercises };
      });

      setEffectiveExercises((prev) => {
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
      });

      setActiveExerciseIndex((prev) => {
        if (prev === fromIndex) return toIndex;
        if (prev === toIndex) return fromIndex;
        return prev;
      });
    },
    [updateSessionLocal]
  );

  const handleFinishWorkout = useCallback(
    async (sessionOverride?: SessionLog) => {
      const sessionToUse = sessionOverride ?? session;
      if (!sessionToUse) return;

      setShowConfirmEnd(false);

      if (isPracticeMode) {
        setShowPracticeSummary(true);
        return;
      }

      const endTime = new Date().toISOString();
      const duration = Math.floor(
        (new Date(endTime).getTime() - new Date(sessionToUse.startTime).getTime()) / 1000
      );

      if (!isOnline) {
        // Offline: save locally and queue for sync on reconnect
        const completedSession: SessionLog = {
          ...sessionToUse,
          endTime,
          duration,
          completed: true,
        };
        saveSession(completedSession);
        addToOfflineQueue(completedSession);
        saveActiveSession(null);
        router.push(`/summary?sessionId=${sessionToUse.id}&offline=true`);
        return;
      }

      try {
        await apiUpdateSession(sessionToUse.id, {
          endTime,
          duration,
          completed: true,
          exercises: sessionToUse.exercises,
          totalWeightLbs: sessionToUse.totalWeightLbs,
        });
      } catch (err) {
        console.error('Failed to finish workout:', err);
      }

      router.push(`/summary?sessionId=${sessionToUse.id}`);
    },
    [session, router, isPracticeMode, isOnline]
  );

  const handleSkipTimer = useCallback(() => {
    timer.reset();
    setShowTimer(false);
    setNextExercisePreview(null);
  }, [timer]);

  useEffect(() => {
    if (shouldFinishAfterLastSetRef.current && session) {
      shouldFinishAfterLastSetRef.current = false;
      if (hasIncompleteSets(session)) {
        setShowIncompleteWarning(true);
      } else {
        handleFinishWorkout(session);
      }
    }
  }, [session, handleFinishWorkout, hasIncompleteSets]);

  if (routineLoading || !routine) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          {routineLoading ? t('loadingRoutine') : t('noRoutineSelected')}
          {!routineLoading && (
            <button onClick={() => router.push('/')} className={styles.backButton}>
              {t('goHome')}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>{t('startingWorkout')}</div>
      </div>
    );
  }

  const totalCompletedSets = session.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <button className={styles.backButton} onClick={() => setShowConfirmEnd(true)}>
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
          </button>

          <div className={styles.headerCenter}>
            <h1 className={styles.routineName} style={{ color: routine.color }}>
              {routine.icon} {routine.name}
              {isPracticeMode && (
                <span className={styles.practiceBadge} title={t('practiceBadgeTitle')}>
                  {t('practiceBadge')}
                </span>
              )}
              {!isOnline && !isPracticeMode && (
                <span className={styles.practiceBadge} title={t('offlineBadgeTitle')}>
                  {t('offlineBadge')}
                </span>
              )}
            </h1>
          </div>

          <div className={styles.timerBadge}>{formatDuration(elapsedSeconds)}</div>
        </div>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${totalSets > 0 ? (totalCompletedSets / totalSets) * 100 : 0}%`,
              backgroundColor: routine.color,
            }}
          />
        </div>

        <div className={styles.statsRow}>
          <span className={styles.statItem}>
            {t('setsStat', { completed: totalCompletedSets, total: totalSets })}
          </span>
          <span className={styles.statItem}>
            {session.totalWeightLbs.toLocaleString()} {t('lbsTotal')}
          </span>
        </div>
      </header>

      <div className={styles.exercises}>
        {session.exercises.map((exerciseLog, index) => {
          const exercise = getExerciseById(exerciseLog.exerciseId);
          const exerciseConfig = effectiveExercises[index];
          if (!exercise || !exerciseConfig) return null;

          return (
            <WorkoutExercise
              key={`${exerciseLog.exerciseId}-${index}`}
              exercise={exercise}
              sets={exerciseLog.sets}
              targetSets={exerciseConfig.sets}
              targetReps={exerciseConfig.reps}
              notes={exerciseConfig.notes}
              isActive={activeExerciseIndex === index}
              canMoveUp={index > 0}
              canMoveDown={index < session.exercises.length - 1}
              lastPerformance={lastPerfMap[exerciseLog.exerciseId] ?? null}
              recommendedSets={recSetsMap[exerciseLog.exerciseId] ?? []}
              onSetComplete={(setIdx, weight, reps) =>
                handleSetComplete(index, setIdx, weight, reps)
              }
              onUpdateSet={(setIdx, updates) => handleUpdateSet(index, setIdx, updates)}
              onAddSet={() => handleAddSet(index)}
              onRemoveSet={(setIdx) => handleRemoveSet(index, setIdx)}
              onToggleActive={() =>
                setActiveExerciseIndex(activeExerciseIndex === index ? -1 : index)
              }
              onMoveUp={() => handleMoveExercise(index, index - 1)}
              onMoveDown={() => handleMoveExercise(index, index + 1)}
            />
          );
        })}
      </div>

      <div className={styles.footer}>
        <button
          className={styles.finishButton}
          onClick={() => setShowConfirmEnd(true)}
          style={{ backgroundColor: routine.color }}
        >
          {t('finishWorkout')}
        </button>
      </div>

      {showTimer && (
        <RestTimer
          remainingSeconds={timer.remainingSeconds}
          totalSeconds={timer.totalSeconds}
          isRunning={timer.isRunning}
          progress={timer.progress}
          onAddTime={() => timer.addTime(15)}
          onReduceTime={() => timer.reduceTime(15)}
          onSkip={handleSkipTimer}
          onPause={timer.pause}
          onResume={timer.resume}
          nextExercise={nextExercisePreview}
        />
      )}

      {showConfirmEnd && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmModal}>
            <h3 className={styles.confirmTitle}>{t('endWorkout')}</h3>
            <p className={styles.confirmText}>
              {totalCompletedSets === 0
                ? t('noSetsYet')
                : t('setsComplete', { completed: totalCompletedSets, total: totalSets })}
            </p>
            <div className={styles.confirmButtons}>
              <button className={styles.confirmCancel} onClick={() => setShowConfirmEnd(false)}>
                {t('keepGoing')}
              </button>
              <button className={styles.confirmEnd} onClick={() => handleFinishWorkout()}>
                {t('finish')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showIncompleteWarning && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmModal}>
            <h3 className={styles.confirmTitle}>{t('incompleteWarningTitle')}</h3>
            <p className={styles.confirmText}>{t('incompleteWarningText')}</p>
            <div className={styles.confirmButtons}>
              <button
                className={styles.confirmCancel}
                onClick={() => setShowIncompleteWarning(false)}
              >
                {t('goBack')}
              </button>
              <button
                className={styles.confirmEnd}
                onClick={() => {
                  setShowIncompleteWarning(false);
                  if (session) handleFinishWorkout(session);
                }}
              >
                {t('finishAnyway')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPracticeSummary && session && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmModal}>
            <h3 className={styles.confirmTitle}>{t('workoutComplete')}</h3>
            <p className={styles.practiceSummaryNote}>{t('notSavedNote')}</p>
            <div className={styles.practiceSummaryStats}>
              <span>{session.totalWeightLbs.toLocaleString()} lbs</span>
              <span>{formatDuration(elapsedSeconds)}</span>
              <span>
                {totalCompletedSets}/{totalSets} sets
              </span>
            </div>
            <button className={styles.practiceHomeButton} onClick={() => router.push('/')}>
              {t('backToHome')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
