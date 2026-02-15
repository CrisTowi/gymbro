import {
  getSessions,
  saveSession,
  getWeeklyPlan,
  saveWeeklyPlan,
  getActiveSession,
  saveActiveSession,
  getLastSession,
  getCompletedSessions,
  getRecommendedSetsForExercise,
} from '@/utils/storage';
import { SessionLog, DEFAULT_WEEKLY_PLAN } from '@/types';

const mockSession: SessionLog = {
  id: 'test-session-1',
  date: '2026-02-15T10:00:00.000Z',
  routineId: 'push',
  startTime: '2026-02-15T10:00:00.000Z',
  endTime: '2026-02-15T11:00:00.000Z',
  exercises: [
    {
      exerciseId: 'bench-press',
      sets: [
        { setNumber: 1, reps: 12, weightLbs: 135, completed: true },
        { setNumber: 2, reps: 10, weightLbs: 155, completed: true },
      ],
    },
  ],
  completed: true,
  totalWeightLbs: 3170,
  duration: 3600,
};

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('sessions', () => {
    it('returns empty array when no sessions exist', () => {
      expect(getSessions()).toEqual([]);
    });

    it('saves and retrieves a session', () => {
      saveSession(mockSession);
      const sessions = getSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('test-session-1');
    });

    it('updates existing session by ID', () => {
      saveSession(mockSession);
      const updated = { ...mockSession, totalWeightLbs: 5000 };
      saveSession(updated);
      const sessions = getSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].totalWeightLbs).toBe(5000);
    });
  });

  describe('weekly plan', () => {
    it('returns default plan when none is saved', () => {
      const plan = getWeeklyPlan();
      expect(plan).toEqual(DEFAULT_WEEKLY_PLAN);
    });

    it('saves and retrieves custom plan', () => {
      const customPlan = { ...DEFAULT_WEEKLY_PLAN, wednesday: 'push' as const };
      saveWeeklyPlan(customPlan);
      expect(getWeeklyPlan()).toEqual(customPlan);
    });
  });

  describe('active session', () => {
    it('returns null when no active session', () => {
      expect(getActiveSession()).toBeNull();
    });

    it('saves and retrieves active session', () => {
      saveActiveSession(mockSession);
      const active = getActiveSession();
      expect(active?.id).toBe('test-session-1');
    });

    it('clears active session with null', () => {
      saveActiveSession(mockSession);
      saveActiveSession(null);
      expect(getActiveSession()).toBeNull();
    });
  });

  describe('getLastSession', () => {
    it('returns null when no sessions', () => {
      expect(getLastSession()).toBeNull();
    });

    it('returns most recent completed session', () => {
      saveSession(mockSession);
      const newer: SessionLog = {
        ...mockSession,
        id: 'test-session-2',
        date: '2026-02-16T10:00:00.000Z',
      };
      saveSession(newer);
      const last = getLastSession();
      expect(last?.id).toBe('test-session-2');
    });
  });

  describe('getCompletedSessions', () => {
    it('only returns completed sessions', () => {
      saveSession(mockSession);
      const incomplete: SessionLog = {
        ...mockSession,
        id: 'test-incomplete',
        completed: false,
      };
      saveSession(incomplete);
      const completed = getCompletedSessions();
      expect(completed).toHaveLength(1);
      expect(completed[0].completed).toBe(true);
    });
  });

  describe('getRecommendedSetsForExercise', () => {
    it('returns empty array when no previous data', () => {
      const recs = getRecommendedSetsForExercise('bench-press', 4);
      expect(recs).toEqual([]);
    });

    it('returns per-set recommendations from last session', () => {
      saveSession(mockSession);
      const recs = getRecommendedSetsForExercise('bench-press', 2);
      expect(recs).toHaveLength(2);
      expect(recs[0]).toEqual({ weightLbs: 135, reps: 12 });
      expect(recs[1]).toEqual({ weightLbs: 155, reps: 10 });
    });

    it('fills extra sets with last known weight when target exceeds history', () => {
      saveSession(mockSession);
      const recs = getRecommendedSetsForExercise('bench-press', 4);
      expect(recs).toHaveLength(4);
      expect(recs[0]).toEqual({ weightLbs: 135, reps: 12 });
      expect(recs[1]).toEqual({ weightLbs: 155, reps: 10 });
      expect(recs[2]).toEqual({ weightLbs: 155, reps: 10 });
      expect(recs[3]).toEqual({ weightLbs: 155, reps: 10 });
    });

    it('uses most recent session for recommendations', () => {
      saveSession(mockSession);
      const newerSession: SessionLog = {
        ...mockSession,
        id: 'test-session-newer',
        date: '2026-02-16T10:00:00.000Z',
        exercises: [
          {
            exerciseId: 'bench-press',
            sets: [
              { setNumber: 1, reps: 10, weightLbs: 165, completed: true },
              { setNumber: 2, reps: 8, weightLbs: 175, completed: true },
            ],
          },
        ],
      };
      saveSession(newerSession);
      const recs = getRecommendedSetsForExercise('bench-press', 2);
      expect(recs[0]).toEqual({ weightLbs: 165, reps: 10 });
      expect(recs[1]).toEqual({ weightLbs: 175, reps: 8 });
    });

    it('returns empty for exercises not in any session', () => {
      saveSession(mockSession);
      const recs = getRecommendedSetsForExercise('squats', 4);
      expect(recs).toEqual([]);
    });
  });
});
