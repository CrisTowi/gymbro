'use client';

import { useTranslations } from 'next-intl';
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

const TIME_RANGE_KEYS: { value: TimeRange; key: 'thisMonth' | 'thisYear' | 'allTime' }[] = [
  { value: 'this-month', key: 'thisMonth' },
  { value: 'this-year', key: 'thisYear' },
  { value: 'all-time', key: 'allTime' },
];

const MUSCLE_GROUP_KEYS: Record<string, string> = {
  all: 'filterAll',
  chest: 'filterChest',
  back: 'filterBack',
  shoulders: 'filterShoulders',
  biceps: 'filterBiceps',
  triceps: 'filterTriceps',
  quadriceps: 'filterQuads',
  hamstrings: 'filterHamstrings',
  glutes: 'filterGlutes',
  calves: 'filterCalves',
  core: 'filterCore',
  forearms: 'filterForearms',
  traps: 'filterTraps',
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
  const t = useTranslations('dashboard');

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <label className={styles.label}>{t('timeRange')}</label>
        <div className={styles.chips}>
          {TIME_RANGE_KEYS.map(({ value, key }) => (
            <button
              key={value}
              className={`${styles.chip} ${selectedTimeRange === value ? styles.chipActive : ''}`}
              onClick={() => onTimeRangeChange(value)}
            >
              {t(key)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>{t('muscleGroup')}</label>
        <div className={styles.chips}>
          <button
            className={`${styles.chip} ${selectedMuscleGroup === 'all' ? styles.chipActive : ''}`}
            onClick={() => {
              onMuscleGroupChange('all');
              onExerciseChange(null);
            }}
          >
            {t('filterAll')}
          </button>
          {muscleGroups.map((group) => (
            <button
              key={group}
              className={`${styles.chip} ${selectedMuscleGroup === group ? styles.chipActive : ''}`}
              onClick={() => {
                onMuscleGroupChange(group);
                onExerciseChange(null);
              }}
            >
              {t(MUSCLE_GROUP_KEYS[group] || group)}
            </button>
          ))}
        </div>
      </div>

      {exercises.length > 0 && (
        <div className={styles.section}>
          <label className={styles.label}>{t('exerciseLabel')}</label>
          <select
            className={styles.select}
            value={selectedExerciseId || ''}
            onChange={(e) => onExerciseChange(e.target.value || null)}
          >
            <option value="">{t('allExercises')}</option>
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
