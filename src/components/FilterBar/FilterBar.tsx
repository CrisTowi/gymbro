'use client';

import { MuscleGroup, TimeRange } from '@/types';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  selectedMuscleGroup: MuscleGroup | 'all';
  selectedTimeRange: TimeRange;
  selectedExerciseId: string | null;
  muscleGroups: MuscleGroup[];
  exercises: { id: string; name: string }[];
  onMuscleGroupChange: (group: MuscleGroup | 'all') => void;
  onTimeRangeChange: (range: TimeRange) => void;
  onExerciseChange: (exerciseId: string | null) => void;
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: 'this-month', label: 'This Month' },
  { value: 'this-year', label: 'This Year' },
  { value: 'all-time', label: 'All Time' },
];

const MUSCLE_GROUP_LABELS: Record<string, string> = {
  all: 'All',
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  quadriceps: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  core: 'Core',
  forearms: 'Forearms',
  traps: 'Traps',
};

export default function FilterBar({
  selectedMuscleGroup,
  selectedTimeRange,
  selectedExerciseId,
  muscleGroups,
  exercises,
  onMuscleGroupChange,
  onTimeRangeChange,
  onExerciseChange,
}: FilterBarProps) {
  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <label className={styles.label}>Time Range</label>
        <div className={styles.chips}>
          {TIME_RANGES.map(({ value, label }) => (
            <button
              key={value}
              className={`${styles.chip} ${
                selectedTimeRange === value ? styles.chipActive : ''
              }`}
              onClick={() => onTimeRangeChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Muscle Group</label>
        <div className={styles.chips}>
          <button
            className={`${styles.chip} ${
              selectedMuscleGroup === 'all' ? styles.chipActive : ''
            }`}
            onClick={() => {
              onMuscleGroupChange('all');
              onExerciseChange(null);
            }}
          >
            All
          </button>
          {muscleGroups.map((group) => (
            <button
              key={group}
              className={`${styles.chip} ${
                selectedMuscleGroup === group ? styles.chipActive : ''
              }`}
              onClick={() => {
                onMuscleGroupChange(group);
                onExerciseChange(null);
              }}
            >
              {MUSCLE_GROUP_LABELS[group] || group}
            </button>
          ))}
        </div>
      </div>

      {exercises.length > 0 && (
        <div className={styles.section}>
          <label className={styles.label}>Exercise</label>
          <select
            className={styles.select}
            value={selectedExerciseId || ''}
            onChange={(e) =>
              onExerciseChange(e.target.value || null)
            }
          >
            <option value="">All exercises</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
