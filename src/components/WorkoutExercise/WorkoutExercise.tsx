'use client';

import { useTranslations } from 'next-intl';
import { Exercise, SetLog } from '@/types';
import { getExerciseLocalized } from '@/data/exercises';
import { useLocale } from '@/context/LocaleContext';
import { formatWeight } from '@/utils/weight';
import { RecommendedSet } from '@/lib/api';
import SetRow from './SetRow';
import styles from './WorkoutExercise.module.css';

interface LastPerformance {
  weightLbs: number;
  reps: number;
  date: string;
}

interface WorkoutExerciseProps {
  exercise: Exercise;
  sets: SetLog[];
  targetSets: number;
  targetReps: number;
  notes?: string;
  isActive: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  lastPerformance: LastPerformance | null;
  recommendedSets: RecommendedSet[];
  onSetComplete: (setIndex: number, weight: number, reps: number) => void;
  onUpdateSet: (setIndex: number, updates: Partial<SetLog>) => void;
  onAddSet: () => void;
  onRemoveSet: (setIndex: number) => void;
  onToggleActive: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function WorkoutExercise({
  exercise,
  sets,
  targetSets,
  targetReps,
  notes,
  isActive,
  canMoveUp,
  canMoveDown,
  lastPerformance,
  recommendedSets,
  onSetComplete,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onToggleActive,
  onMoveUp,
  onMoveDown,
}: WorkoutExerciseProps) {
  const t = useTranslations('workoutExercise');
  const { locale } = useLocale();
  const { name, description, instructions } = getExerciseLocalized(exercise, locale);
  const completedSets = sets.filter((s) => s.completed).length;
  const allComplete = completedSets === sets.length;
  const hasRecommendations = recommendedSets.length > 0;

  return (
    <div
      className={`${styles.card} ${isActive ? styles.active : ''} ${
        allComplete ? styles.complete : ''
      }`}
    >
      <div className={styles.header}>
        <button className={styles.headerToggle} onClick={onToggleActive}>
          <div className={styles.headerLeft}>
            <div className={styles.exerciseInfo}>
              <h3 className={styles.name}>{name}</h3>
              <span className={styles.meta}>
                {exercise.category} · {exercise.equipment}
              </span>
            </div>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.progress}>
              {completedSets}/{sets.length}
            </span>
            <span className={styles.target}>
              {targetSets}x{targetReps}
            </span>
            <svg
              className={`${styles.chevron} ${isActive ? styles.chevronOpen : ''}`}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </button>
        <div className={styles.reorderButtons}>
          <button
            className={styles.reorderBtn}
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label="Move exercise up"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          <button
            className={styles.reorderBtn}
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label="Move exercise down"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {isActive && (
        <div className={styles.body}>
          {lastPerformance && (
            <div className={styles.lastPerformance}>
              Previous best: {formatWeight(lastPerformance.weightLbs, false)} x{' '}
              {lastPerformance.reps} reps
            </div>
          )}

          {notes && <div className={styles.notes}>{notes}</div>}

          {exercise.referenceUrl && (
            <a
              href={exercise.referenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.referenceLink}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              How to perform this exercise
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}

          <div className={styles.setsList}>
            <div className={styles.setHeader}>
              <span className={styles.setCol}>Set</span>
              <span className={styles.weightCol}>Weight (lbs)</span>
              <span className={styles.repsCol}>Reps</span>
              <span className={styles.actionCol}></span>
            </div>

            {sets.map((set, index) => {
              const recommendation = recommendedSets[index] || null;
              const previousCompletedSet = sets
                .slice(0, index)
                .filter((s) => s.completed)
                .pop();

              return (
                <SetRow
                  key={index}
                  set={set}
                  index={index}
                  targetReps={targetReps}
                  recommendation={recommendation}
                  previousCompletedSet={previousCompletedSet || null}
                  hasRecommendations={hasRecommendations}
                  onComplete={(weight, reps) => onSetComplete(index, weight, reps)}
                  onUpdate={(updates) => onUpdateSet(index, updates)}
                  onRemove={() => onRemoveSet(index)}
                />
              );
            })}
          </div>

          <div className={styles.actions}>
            <button className={styles.addSetButton} onClick={onAddSet}>
              + Add Set
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
