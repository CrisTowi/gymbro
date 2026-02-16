import {
  Exercise,
  SessionLog,
  WeeklyPlan,
  ExerciseLog,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

// ─── Exercises ───────────────────────────────────────────────

export async function fetchExercises(params?: {
  category?: string;
  tag?: string;
}): Promise<Exercise[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.tag) query.set('tag', params.tag);
  const qs = query.toString();
  return request<Exercise[]>(`/api/exercises${qs ? `?${qs}` : ''}`);
}

export async function fetchExerciseById(id: string): Promise<Exercise> {
  return request<Exercise>(`/api/exercises/${id}`);
}

export async function fetchCategories(): Promise<string[]> {
  return request<string[]>('/api/exercises/categories');
}

export async function fetchAlternatives(
  id: string,
  exclude?: string[]
): Promise<Exercise[]> {
  const qs = exclude?.length ? `?exclude=${exclude.join(',')}` : '';
  return request<Exercise[]>(`/api/exercises/${id}/alternatives${qs}`);
}

// ─── Routines ────────────────────────────────────────────────

interface RoutineResponse {
  routineId: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  exercises: {
    exerciseId: string;
    sets: number;
    reps: number;
    restTimeSeconds: number;
    notes?: string;
  }[];
}

export async function fetchRoutines(): Promise<RoutineResponse[]> {
  return request<RoutineResponse[]>('/api/routines');
}

export async function fetchRoutineById(
  id: string
): Promise<RoutineResponse> {
  return request<RoutineResponse>(`/api/routines/${id}`);
}

// ─── Weekly Plan ─────────────────────────────────────────────

export async function fetchWeeklyPlan(): Promise<WeeklyPlan> {
  return request<WeeklyPlan>('/api/weekly-plan');
}

export async function updateWeeklyPlan(
  plan: WeeklyPlan
): Promise<WeeklyPlan> {
  return request<WeeklyPlan>('/api/weekly-plan', {
    method: 'PUT',
    body: JSON.stringify(plan),
  });
}

// ─── Sessions ────────────────────────────────────────────────

interface SessionResponse extends Omit<SessionLog, 'id'> {
  sessionId: string;
  id?: string;
}

function normalizeSession(s: SessionResponse): SessionLog {
  return {
    ...s,
    id: s.sessionId ?? s.id ?? '',
  };
}

export async function fetchSessions(params?: {
  completed?: boolean;
  routineId?: string;
}): Promise<SessionLog[]> {
  const query = new URLSearchParams();
  if (params?.completed !== undefined)
    query.set('completed', String(params.completed));
  if (params?.routineId) query.set('routineId', params.routineId);
  const qs = query.toString();
  const data = await request<SessionResponse[]>(
    `/api/sessions${qs ? `?${qs}` : ''}`
  );
  return data.map(normalizeSession);
}

export async function fetchSessionById(id: string): Promise<SessionLog> {
  const data = await request<SessionResponse>(`/api/sessions/${id}`);
  return normalizeSession(data);
}

export async function fetchActiveSession(): Promise<SessionLog | null> {
  const data = await request<SessionResponse | null>('/api/sessions/active');
  return data ? normalizeSession(data) : null;
}

export async function clearActiveSession(): Promise<void> {
  await request('/api/sessions/active', { method: 'DELETE' }).catch(() => {
    // Ignore 404 if no active session
  });
}

export async function createSession(session: {
  sessionId: string;
  date: string;
  routineId: string;
  startTime: string;
  exercises: ExerciseLog[];
}): Promise<SessionLog> {
  const data = await request<SessionResponse>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify(session),
  });
  return normalizeSession(data);
}

export async function updateSession(
  id: string,
  updates: Partial<SessionLog>
): Promise<SessionLog> {
  const data = await request<SessionResponse>(`/api/sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return normalizeSession(data);
}

// ─── Stats ───────────────────────────────────────────────────

export interface OverviewStats {
  totalSessions: number;
  totalWeight: number;
  totalExercises: number;
  personalRecordCount: number;
}

export async function fetchOverview(): Promise<OverviewStats> {
  return request<OverviewStats>('/api/stats/overview');
}

export interface PersonalRecords {
  [exerciseId: string]: {
    maxWeight: number;
    maxVolume: number;
    date: string;
  };
}

export async function fetchPersonalRecords(): Promise<PersonalRecords> {
  return request<PersonalRecords>('/api/stats/personal-records');
}

export interface ExerciseHistoryPoint {
  date: string;
  maxWeight: number;
  totalVolume: number;
}

export async function fetchExerciseHistory(
  exerciseId: string
): Promise<ExerciseHistoryPoint[]> {
  return request<ExerciseHistoryPoint[]>(
    `/api/stats/exercises/${exerciseId}/history`
  );
}

export interface LastExercisePerformance {
  weightLbs: number;
  reps: number;
  date: string;
}

export async function fetchLastExercisePerformance(
  exerciseId: string
): Promise<LastExercisePerformance | null> {
  return request<LastExercisePerformance | null>(
    `/api/stats/exercises/${exerciseId}/last`
  );
}

export interface RecommendedSet {
  weightLbs: number;
  reps: number;
}

export async function fetchRecommendedSets(
  exerciseId: string,
  sets: number
): Promise<RecommendedSet[]> {
  return request<RecommendedSet[]>(
    `/api/stats/exercises/${exerciseId}/recommended-sets?sets=${sets}`
  );
}

export async function fetchLastSession(): Promise<SessionLog | null> {
  const data = await request<SessionResponse | null>('/api/stats/last-session');
  return data ? normalizeSession(data) : null;
}
