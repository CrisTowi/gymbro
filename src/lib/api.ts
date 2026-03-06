import {
  Exercise,
  type Locale,
  SessionLog,
  WeeklyPlan,
  ExerciseLog,
  Routine,
  RoutineExercise,
} from '@/types';

/** Raw API shape: backend sends exerciseId instead of id, and name/description/instructions may be plain strings */
type LegacyExercise = Omit<Exercise, 'id' | 'name' | 'description' | 'instructions'> & {
  exerciseId: string;
  name: string | Record<Locale, string>;
  description: string | Record<Locale, string>;
  instructions: string[] | Record<Locale, string[]>;
};

function isI18nName(name: string | Record<Locale, string>): name is Record<Locale, string> {
  return typeof name === 'object' && name !== null && 'en' in name && 'es' in name;
}

function isI18nInstructions(
  instructions: string[] | Record<Locale, string[]>
): instructions is Record<Locale, string[]> {
  return (
    typeof instructions === 'object' &&
    instructions !== null &&
    'en' in instructions &&
    'es' in instructions
  );
}

/** Normalize API response so Exercise always has name/description/instructions keyed by locale. */
function normalizeExercise(raw: LegacyExercise): Exercise {
  const name = isI18nName(raw.name) ? raw.name : { en: raw.name, es: raw.name };
  const description = isI18nName(raw.description)
    ? raw.description
    : { en: raw.description, es: raw.description };
  const instructions = isI18nInstructions(raw.instructions)
    ? raw.instructions
    : { en: raw.instructions, es: raw.instructions };
  return {
    ...raw,
    id: raw.exerciseId,
    name,
    description,
    instructions,
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
  }
  const res = await fetch(`${API_URL}${path}`, {
    headers,
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
  const raw = await request<LegacyExercise[]>(`/api/exercises${qs ? `?${qs}` : ''}`);
  return raw.map(normalizeExercise);
}

export async function fetchExerciseById(id: string): Promise<Exercise> {
  const raw = await request<LegacyExercise>(`/api/exercises/${id}`);
  return normalizeExercise(raw);
}

export async function fetchCategories(): Promise<string[]> {
  return request<string[]>('/api/exercises/categories');
}

export async function fetchAlternatives(id: string, exclude?: string[]): Promise<Exercise[]> {
  const qs = exclude?.length ? `?exclude=${exclude.join(',')}` : '';
  const raw = await request<LegacyExercise[]>(`/api/exercises/${id}/alternatives${qs}`);
  return raw.map(normalizeExercise);
}

// ─── Routines (user-scoped) ───────────────────────────────────

interface RoutineResponse {
  _id?: string;
  routineId: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  exercises: RoutineExercise[];
}

function normalizeRoutine(r: RoutineResponse): Routine {
  return {
    id: r._id ?? r.routineId,
    name: r.name,
    description: r.description ?? '',
    color: r.color,
    icon: r.icon,
    exercises: r.exercises ?? [],
  };
}

export async function fetchRoutines(): Promise<Routine[]> {
  const data = await request<RoutineResponse[]>('/api/routines');
  return data.map(normalizeRoutine);
}

export async function fetchRoutineById(id: string): Promise<Routine> {
  const data = await request<RoutineResponse>(`/api/routines/${id}`);
  return normalizeRoutine(data);
}

export async function seedDefaultRoutines(lang: string = 'en'): Promise<Routine[]> {
  const data = await request<RoutineResponse[]>(
    `/api/routines/seed-defaults?lang=${encodeURIComponent(lang)}`,
    {
      method: 'POST',
    }
  );
  return data.map(normalizeRoutine);
}

export async function createRoutine(routine: {
  routineId: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  exercises?: RoutineExercise[];
}): Promise<Routine> {
  const data = await request<RoutineResponse>('/api/routines', {
    method: 'POST',
    body: JSON.stringify(routine),
  });
  return normalizeRoutine(data);
}

export async function updateRoutine(
  id: string,
  updates: Partial<Pick<Routine, 'name' | 'description' | 'color' | 'icon' | 'exercises'>>
): Promise<Routine> {
  const data = await request<RoutineResponse>(`/api/routines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return normalizeRoutine(data);
}

export async function deleteRoutine(id: string): Promise<void> {
  await request(`/api/routines/${id}`, { method: 'DELETE' });
}

// ─── Weekly Plan ─────────────────────────────────────────────

export async function fetchWeeklyPlan(): Promise<WeeklyPlan> {
  return request<WeeklyPlan>('/api/weekly-plan');
}

export async function updateWeeklyPlan(plan: WeeklyPlan): Promise<WeeklyPlan> {
  return request<WeeklyPlan>('/api/weekly-plan', {
    method: 'PUT',
    body: JSON.stringify(plan),
  });
}

export async function generateWeeklyPlanFromDescription(description: string): Promise<WeeklyPlan> {
  return request<WeeklyPlan>('/api/weekly-plan/generate', {
    method: 'POST',
    body: JSON.stringify({ description: description.trim() }),
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
  if (params?.completed !== undefined) query.set('completed', String(params.completed));
  if (params?.routineId) query.set('routineId', params.routineId);
  const qs = query.toString();
  const data = await request<SessionResponse[]>(`/api/sessions${qs ? `?${qs}` : ''}`);
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

export async function updateSession(id: string, updates: Partial<SessionLog>): Promise<SessionLog> {
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

export async function fetchExerciseHistory(exerciseId: string): Promise<ExerciseHistoryPoint[]> {
  return request<ExerciseHistoryPoint[]>(`/api/stats/exercises/${exerciseId}/history`);
}

export interface LastExercisePerformance {
  weightLbs: number;
  reps: number;
  date: string;
}

export async function fetchLastExercisePerformance(
  exerciseId: string
): Promise<LastExercisePerformance | null> {
  return request<LastExercisePerformance | null>(`/api/stats/exercises/${exerciseId}/last`);
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

// ─── Auth ─────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  height: number | null;
  weight: number | null;
  goal: string | null;
  language?: 'en' | 'es';
}

export async function validateInvitation(
  token: string
): Promise<{ valid: boolean; email: string | null; lang: string }> {
  return request<{ valid: boolean; invitationId?: string; email: string | null; lang: string }>(
    `/api/auth/invitation/${encodeURIComponent(token)}`
  );
}

export async function register(params: {
  invitationToken: string;
  name: string;
  email: string;
  password: string;
  height?: number | null;
  weight?: number | null;
  goal?: string | null;
  language?: string;
}): Promise<{ user: User; token: string }> {
  return request<{ user: User; token: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function login(
  email: string,
  password: string
): Promise<{ user: User; token: string }> {
  return request<{ user: User; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchMe(): Promise<User> {
  return request<User>('/api/auth/me');
}

export async function updateMe(
  updates: Partial<Pick<User, 'name' | 'height' | 'weight' | 'goal' | 'language'>>
): Promise<User> {
  return request<User>('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}
