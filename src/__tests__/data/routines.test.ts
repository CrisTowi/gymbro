import { routines, getRoutineById } from '@/data/routines';
import { getExerciseById } from '@/data/exercises';

describe('routines data', () => {
  it('has 4 routines (push, pull, legs, full-body)', () => {
    expect(routines.length).toBe(4);
    const ids = routines.map((r) => r.id);
    expect(ids).toContain('push');
    expect(ids).toContain('pull');
    expect(ids).toContain('legs');
    expect(ids).toContain('full-body');
  });

  it('each routine has required fields', () => {
    routines.forEach((routine) => {
      expect(routine.id).toBeTruthy();
      expect(routine.name).toBeTruthy();
      expect(routine.description).toBeTruthy();
      expect(routine.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(routine.icon).toBeTruthy();
      expect(Array.isArray(routine.exercises)).toBe(true);
      expect(routine.exercises.length).toBeGreaterThan(0);
    });
  });

  it('all exercise references in routines exist in exercise collection', () => {
    routines.forEach((routine) => {
      routine.exercises.forEach((routineEx) => {
        const exercise = getExerciseById(routineEx.exerciseId);
        expect(exercise).toBeDefined();
      });
    });
  });

  it('all routine exercises have valid set/rep configurations', () => {
    routines.forEach((routine) => {
      routine.exercises.forEach((ex) => {
        expect(ex.sets).toBeGreaterThan(0);
        expect(ex.reps).toBeGreaterThan(0);
        expect(ex.restTimeSeconds).toBeGreaterThan(0);
      });
    });
  });

  describe('getRoutineById', () => {
    it('returns routine for valid ID', () => {
      const result = getRoutineById('push');
      expect(result).toBeDefined();
      expect(result?.name).toBe('Push');
    });

    it('returns undefined for invalid ID', () => {
      expect(getRoutineById('nonexistent')).toBeUndefined();
    });
  });
});
