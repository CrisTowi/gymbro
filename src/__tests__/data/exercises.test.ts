import {
  exercises,
  getExerciseById,
  getExercisesByCategory,
  getExercisesByTag,
  getAllCategories,
} from '@/data/exercises';

describe('exercises data', () => {
  it('has a collection of exercises', () => {
    expect(exercises.length).toBeGreaterThan(0);
  });

  it('each exercise has required fields', () => {
    exercises.forEach((ex) => {
      expect(ex.id).toBeTruthy();
      expect(ex.name).toBeTruthy();
      expect(ex.category).toBeTruthy();
      expect(ex.equipment).toBeTruthy();
      expect(ex.description).toBeTruthy();
      expect(Array.isArray(ex.instructions)).toBe(true);
      expect(ex.instructions.length).toBeGreaterThan(0);
      expect(Array.isArray(ex.tags)).toBe(true);
    });
  });

  it('has unique exercise IDs', () => {
    const ids = exercises.map((ex) => ex.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('exercise IDs follow kebab-case convention', () => {
    exercises.forEach((ex) => {
      expect(ex.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    });
  });

  describe('getExerciseById', () => {
    it('returns exercise for valid ID', () => {
      const result = getExerciseById('bench-press');
      expect(result).toBeDefined();
      expect(result?.name).toBe('Bench Press');
    });

    it('returns undefined for invalid ID', () => {
      expect(getExerciseById('nonexistent')).toBeUndefined();
    });
  });

  describe('getExercisesByCategory', () => {
    it('returns exercises for chest category', () => {
      const chestExercises = getExercisesByCategory('chest');
      expect(chestExercises.length).toBeGreaterThan(0);
      chestExercises.forEach((ex) => {
        expect(ex.category).toBe('chest');
      });
    });

    it('returns empty array for invalid category', () => {
      expect(getExercisesByCategory('nonexistent')).toEqual([]);
    });
  });

  describe('getExercisesByTag', () => {
    it('returns exercises with push tag', () => {
      const pushExercises = getExercisesByTag('push');
      expect(pushExercises.length).toBeGreaterThan(0);
      pushExercises.forEach((ex) => {
        expect(ex.tags).toContain('push');
      });
    });
  });

  describe('getAllCategories', () => {
    it('returns unique categories', () => {
      const categories = getAllCategories();
      expect(categories.length).toBeGreaterThan(0);
      const unique = new Set(categories);
      expect(categories.length).toBe(unique.size);
    });
  });
});
