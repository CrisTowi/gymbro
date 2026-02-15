'use client';

import { SessionLog } from '@/types';
import { getExerciseById } from '@/data/exercises';
import { getRoutineById } from '@/data/routines';
import { formatDuration, getRelativeDate } from '@/utils/time';
import { formatWeight } from '@/utils/weight';
import styles from './LastSessionCard.module.css';

interface LastSessionCardProps {
  session: SessionLog | null;
}

export default function LastSessionCard({ session }: LastSessionCardProps) {
  if (!session) {
    return (
      <div className={styles.card}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🏋️</span>
          <p className={styles.emptyText}>No previous sessions yet</p>
          <p className={styles.emptySubtext}>Start your first workout to see stats here!</p>
        </div>
      </div>
    );
  }

  const routine = getRoutineById(session.routineId);
  const completedSets = session.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalSets = session.exercises.reduce(
    (sum, ex) => sum + ex.sets.length,
    0
  );
  const exerciseCount = session.exercises.filter(
    (ex) => ex.sets.some((s) => s.completed)
  ).length;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Last Session</h3>
        <span className={styles.date}>{getRelativeDate(session.date)}</span>
      </div>

      <div
        className={styles.routineBadge}
        style={{ backgroundColor: routine?.color ? `${routine.color}22` : undefined, color: routine?.color }}
      >
        {routine?.icon} {routine?.name || session.routineId}
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{formatWeight(session.totalWeightLbs, false)}</span>
          <span className={styles.statLabel}>Total lifted</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{exerciseCount}</span>
          <span className={styles.statLabel}>Exercises</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {completedSets}/{totalSets}
          </span>
          <span className={styles.statLabel}>Sets</span>
        </div>
        {session.duration && (
          <div className={styles.stat}>
            <span className={styles.statValue}>{formatDuration(session.duration)}</span>
            <span className={styles.statLabel}>Duration</span>
          </div>
        )}
      </div>

      {session.exercises.length > 0 && (
        <div className={styles.exercises}>
          {session.exercises.slice(0, 3).map((ex) => {
            const exercise = getExerciseById(ex.exerciseId);
            const bestSet = ex.sets
              .filter((s) => s.completed)
              .reduce(
                (best, s) => (s.weightLbs > best.weightLbs ? s : best),
                ex.sets[0]
              );
            return (
              <div key={ex.exerciseId} className={styles.exerciseRow}>
                <span className={styles.exerciseName}>{exercise?.name || ex.exerciseId}</span>
                <span className={styles.exerciseDetail}>
                  {bestSet?.weightLbs || 0} lbs x {bestSet?.reps || 0}
                </span>
              </div>
            );
          })}
          {session.exercises.length > 3 && (
            <span className={styles.moreText}>
              +{session.exercises.length - 3} more exercises
            </span>
          )}
        </div>
      )}
    </div>
  );
}
