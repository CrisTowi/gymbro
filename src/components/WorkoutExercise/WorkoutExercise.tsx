'use client';

import { useState, useMemo } from 'react';
import { Exercise, SetLog } from '@/types';
import { formatWeight, lbsToKg } from '@/utils/weight';
import {
  getLastSessionForExercise,
  getRecommendedSetsForExercise,
  RecommendedSet,
} from '@/utils/storage';
import styles from './WorkoutExercise.module.css';

interface WorkoutExerciseProps {
  exercise: Exercise;
  sets: SetLog[];
  targetSets: number;
  targetReps: number;
  notes?: string;
  isActive: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
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
  onSetComplete,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onToggleActive,
  onMoveUp,
  onMoveDown,
}: WorkoutExerciseProps) {
  const lastPerformance = useMemo(
    () => getLastSessionForExercise(exercise.id),
    [exercise.id]
  );
  const recommendedSets = useMemo(
    () => getRecommendedSetsForExercise(exercise.id, sets.length),
    [exercise.id, sets.length]
  );

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
              <h3 className={styles.name}>{exercise.name}</h3>
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          <button
            className={styles.reorderBtn}
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label="Move exercise down"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

function SetRow({
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
  const suggestedWeight = recommendation?.weightLbs
    ?? previousCompletedSet?.weightLbs
    ?? 0;
  const suggestedReps = recommendation?.reps ?? targetReps;

  const [weight, setWeight] = useState(set.weightLbs || suggestedWeight);
  const [reps, setReps] = useState(set.reps || suggestedReps);

  const isUsingRecommendation = hasRecommendations && !set.completed && weight === suggestedWeight && suggestedWeight > 0;

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
            const val = Number(e.target.value);
            if (!isNaN(val)) {
              setWeight(val);
              if (set.completed) onUpdate({ weightLbs: val });
            }
          }}
          placeholder={suggestedWeight > 0 ? String(suggestedWeight) : '0'}
          className={`${styles.input} ${isUsingRecommendation ? styles.inputRecommended : ''}`}
          disabled={set.completed}
        />
        {isUsingRecommendation && (
          <span className={styles.recommendedHint}>rec</span>
        )}
      </div>

      <div className={styles.repsInput}>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={reps || ''}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (!isNaN(val)) {
              setReps(val);
              if (set.completed) onUpdate({ reps: val });
            }
          }}
          placeholder={String(suggestedReps)}
          className={styles.input}
          disabled={set.completed}
        />
      </div>

      <div className={styles.setActions}>
        {!set.completed ? (
          <button
            className={styles.completeButton}
            onClick={handleComplete}
            disabled={weight <= 0 || reps <= 0}
            aria-label={`Complete set ${index + 1}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        ) : (
          <button
            className={styles.removeButton}
            onClick={onRemove}
            aria-label={`Remove set ${index + 1}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {!set.completed && suggestedWeight > 0 && (
        <div className={styles.setRecommendation}>
          {recommendation
            ? `Last session: ${recommendation.weightLbs} lbs (${lbsToKg(recommendation.weightLbs)} kg) x ${recommendation.reps}`
            : previousCompletedSet
              ? `Prev set: ${previousCompletedSet.weightLbs} lbs`
              : ''}
        </div>
      )}
    </div>
  );
}
