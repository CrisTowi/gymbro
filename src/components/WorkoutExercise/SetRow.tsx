'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { SetLog } from '@/types';
import { lbsToKg } from '@/utils/weight';
import { RecommendedSet } from '@/lib/api';
import styles from './WorkoutExercise.module.css';

export default function SetRow({
  set,
  index,
  targetReps,
  recommendation,
  previousCompletedSet,
  hasRecommendations,
  onComplete,
  onUpdate,
  onRemove,
}: {
  set: SetLog;
  index: number;
  targetReps: number;
  recommendation: RecommendedSet | null;
  previousCompletedSet: SetLog | null;
  hasRecommendations: boolean;
  onComplete: (weight: number, reps: number) => void;
  onUpdate: (updates: Partial<SetLog>) => void;
  onRemove: () => void;
}) {
  const t = useTranslations('workoutExercise');
  const suggestedWeight = recommendation?.weightLbs ?? previousCompletedSet?.weightLbs ?? 0;
  const suggestedReps = recommendation?.reps ?? previousCompletedSet?.reps ?? targetReps;

  const [weight, setWeight] = useState(set.weightLbs > 0 ? set.weightLbs : suggestedWeight);
  const [reps, setReps] = useState(set.reps > 0 ? set.reps : suggestedReps);

  useEffect(() => {
    setWeight(set.weightLbs > 0 ? set.weightLbs : suggestedWeight);
    setReps(set.reps > 0 ? set.reps : suggestedReps);
  }, [suggestedWeight, suggestedReps]);

  const isUsingRecommendation =
    hasRecommendations && !set.completed && weight === suggestedWeight && suggestedWeight > 0;

  const handleComplete = () => {
    onComplete(weight, reps);
  };

  return (
    <div className={`${styles.setRow} ${set.completed ? styles.setCompleted : ''}`}>
      <span className={styles.setNumber}>{index + 1}</span>

      <div className={styles.weightInput}>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={weight || ''}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              setWeight(0);
              onUpdate({ weightLbs: 0 });
              return;
            }
            const val = Number(raw);
            if (!isNaN(val)) {
              setWeight(val);
              onUpdate({ weightLbs: val });
            }
          }}
          onFocus={(e) => e.target.select()}
          placeholder={suggestedWeight > 0 ? String(suggestedWeight) : '0'}
          className={`${styles.input} ${isUsingRecommendation ? styles.inputRecommended : ''}`}
          aria-label={`Set ${index + 1} weight`}
        />
        {isUsingRecommendation && <span className={styles.recommendedHint}>rec</span>}
      </div>

      <div className={styles.repsInput}>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={reps || ''}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              setReps(0);
              onUpdate({ reps: 0 });
              return;
            }
            const val = Number(raw);
            if (!isNaN(val)) {
              setReps(val);
              onUpdate({ reps: val });
            }
          }}
          onFocus={(e) => e.target.select()}
          placeholder={String(suggestedReps)}
          className={styles.input}
          aria-label={`Set ${index + 1} reps`}
        />
      </div>

      <div className={styles.setActions}>
        {!set.completed ? (
          <>
            <button
              className={styles.completeButton}
              onClick={handleComplete}
              disabled={weight <= 0 || reps <= 0}
              aria-label={`Complete set ${index + 1}`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
            <button
              className={styles.removeButton}
              onClick={onRemove}
              aria-label={`Remove set ${index + 1} (skip)`}
              title="Remove this set"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </>
        ) : (
          <button
            className={styles.removeButton}
            onClick={onRemove}
            aria-label={`Remove set ${index + 1}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {!set.completed && suggestedWeight > 0 && (
        <div className={styles.setRecommendation}>
          {recommendation
            ? t('lastSession', {
                weight: recommendation.weightLbs,
                weightKg: lbsToKg(recommendation.weightLbs),
                reps: recommendation.reps,
              })
            : previousCompletedSet
              ? t('prevSet', { weight: previousCompletedSet.weightLbs })
              : ''}
        </div>
      )}
    </div>
  );
}
