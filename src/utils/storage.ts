import { SessionLog, WeeklyPlan, DEFAULT_WEEKLY_PLAN } from '@/types';

const STORAGE_KEYS = {
  SESSIONS: 'gymbro_sessions',
  WEEKLY_PLAN: 'gymbro_weekly_plan',
  ACTIVE_SESSION: 'gymbro_active_session',
  PENDING_SYNC: 'gymbro_pending_sync',
} as const;

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    markForSync(key);
  } catch (error) {
    console.error(`Failed to save to localStorage: ${key}`, error);
  }
}

function markForSync(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    const pending = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.PENDING_SYNC) || '[]'
    ) as string[];
    if (!pending.includes(key)) {
      pending.push(key);
      localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
    }
  } catch {
    // Ignore sync marking errors
  }
}

export function getSessions(): SessionLog[] {
  return getItem<SessionLog[]>(STORAGE_KEYS.SESSIONS, []);
}

export function saveSession(session: SessionLog): void {
  const sessions = getSessions();
  const existingIndex = sessions.findIndex((s) => s.id === session.id);
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.push(session);
  }
  setItem(STORAGE_KEYS.SESSIONS, sessions);
}

export function getWeeklyPlan(): WeeklyPlan {
  return getItem<WeeklyPlan>(STORAGE_KEYS.WEEKLY_PLAN, DEFAULT_WEEKLY_PLAN);
}

export function saveWeeklyPlan(plan: WeeklyPlan): void {
  setItem(STORAGE_KEYS.WEEKLY_PLAN, plan);
}

export function getActiveSession(): SessionLog | null {
  return getItem<SessionLog | null>(STORAGE_KEYS.ACTIVE_SESSION, null);
}

export function saveActiveSession(session: SessionLog | null): void {
  if (typeof window === 'undefined') return;
  if (session === null) {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  } else {
    setItem(STORAGE_KEYS.ACTIVE_SESSION, session);
  }
}

export function getCompletedSessions(): SessionLog[] {
  return getSessions().filter((s) => s.completed);
}

export function getSessionsByRoutine(routineId: string): SessionLog[] {
  return getSessions().filter(
    (s) => s.routineId === routineId && s.completed
  );
}

export function getLastSession(): SessionLog | null {
  const sessions = getCompletedSessions();
  if (sessions.length === 0) return null;
  return sessions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
}

export function getLastSessionForExercise(
  exerciseId: string
): { weightLbs: number; reps: number; date: string } | null {
  const sessions = getCompletedSessions();
  for (const session of sessions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )) {
    const exerciseLog = session.exercises.find(
      (e) => e.exerciseId === exerciseId
    );
    if (exerciseLog) {
      const completedSets = exerciseLog.sets.filter((s) => s.completed);
      if (completedSets.length > 0) {
        const bestSet = completedSets.reduce((best, set) =>
          set.weightLbs > best.weightLbs ? set : best
        );
        return {
          weightLbs: bestSet.weightLbs,
          reps: bestSet.reps,
          date: session.date,
        };
      }
    }
  }
  return null;
}

export interface RecommendedSet {
  weightLbs: number;
  reps: number;
}

export function getRecommendedSetsForExercise(
  exerciseId: string,
  targetSetCount: number
): RecommendedSet[] {
  const sessions = getCompletedSessions();
  const sorted = sessions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const session of sorted) {
    const exerciseLog = session.exercises.find(
      (e) => e.exerciseId === exerciseId
    );
    if (exerciseLog) {
      const completedSets = exerciseLog.sets.filter((s) => s.completed);
      if (completedSets.length > 0) {
        const recommendations: RecommendedSet[] = [];
        for (let i = 0; i < targetSetCount; i++) {
          if (i < completedSets.length) {
            recommendations.push({
              weightLbs: completedSets[i].weightLbs,
              reps: completedSets[i].reps,
            });
          } else {
            const lastKnown = completedSets[completedSets.length - 1];
            recommendations.push({
              weightLbs: lastKnown.weightLbs,
              reps: lastKnown.reps,
            });
          }
        }
        return recommendations;
      }
    }
  }

  return [];
}

export function getExerciseHistory(
  exerciseId: string
): { date: string; maxWeight: number; totalVolume: number }[] {
  const sessions = getCompletedSessions();
  const history: { date: string; maxWeight: number; totalVolume: number }[] = [];

  for (const session of sessions) {
    const exerciseLog = session.exercises.find(
      (e) => e.exerciseId === exerciseId
    );
    if (exerciseLog) {
      const completedSets = exerciseLog.sets.filter((s) => s.completed);
      if (completedSets.length > 0) {
        const maxWeight = Math.max(...completedSets.map((s) => s.weightLbs));
        const totalVolume = completedSets.reduce(
          (sum, s) => sum + s.weightLbs * s.reps,
          0
        );
        history.push({ date: session.date, maxWeight, totalVolume });
      }
    }
  }

  return history.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function getPersonalRecords(): Record<
  string,
  { maxWeight: number; maxVolume: number; date: string }
> {
  const sessions = getCompletedSessions();
  const records: Record<
    string,
    { maxWeight: number; maxVolume: number; date: string }
  > = {};

  for (const session of sessions) {
    for (const exerciseLog of session.exercises) {
      const completedSets = exerciseLog.sets.filter((s) => s.completed);
      if (completedSets.length === 0) continue;

      const maxWeight = Math.max(...completedSets.map((s) => s.weightLbs));
      const totalVolume = completedSets.reduce(
        (sum, s) => sum + s.weightLbs * s.reps,
        0
      );

      const current = records[exerciseLog.exerciseId];
      if (
        !current ||
        maxWeight > current.maxWeight ||
        totalVolume > current.maxVolume
      ) {
        records[exerciseLog.exerciseId] = {
          maxWeight: current
            ? Math.max(maxWeight, current.maxWeight)
            : maxWeight,
          maxVolume: current
            ? Math.max(totalVolume, current.maxVolume)
            : totalVolume,
          date: session.date,
        };
      }
    }
  }

  return records;
}

export function getPendingSyncKeys(): string[] {
  return getItem<string[]>(STORAGE_KEYS.PENDING_SYNC, []);
}

export function clearPendingSync(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, '[]');
}
