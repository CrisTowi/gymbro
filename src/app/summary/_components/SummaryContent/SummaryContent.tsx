'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SessionLog, Routine } from '@/types';
import { getExerciseById, getExerciseLocalized } from '@/data/exercises';
import { useLocale } from '@/context/LocaleContext';
import { formatDuration } from '@/utils/time';
import { formatWeight, lbsToKg } from '@/utils/weight';
import { getMotivationalMessage, getSessionGrade } from '@/utils/motivation';
import { fetchSessionById, fetchPersonalRecords, fetchRoutineById } from '@/lib/api';
import styles from '../../page.module.css';

export default function SummaryContent() {
  const t = useTranslations('summary');
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('sessionId');

  const [session, setSession] = useState<SessionLog | null>(null);
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [personalRecords, setPersonalRecords] = useState<
    Record<string, { maxWeight: number; maxVolume: number; date: string }>
  >({});
  const [message] = useState(getMotivationalMessage());

  useEffect(() => {
    if (!sessionId) return;

    async function load() {
      try {
        const [sess, records] = await Promise.all([
          fetchSessionById(sessionId!),
          fetchPersonalRecords(),
        ]);
        setSession(sess);
        setPersonalRecords(records);
        if (sess.routineId) {
          try {
            const r = await fetchRoutineById(sess.routineId);
            setRoutine(r);
          } catch {
            setRoutine(null);
          }
        }
      } catch (err) {
        console.error('Failed to load summary:', err);
      }
    }
    load();
  }, [sessionId]);

  if (!session) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>{t('loading')}</div>
      </div>
    );
  }
  const totalCompletedSets = session.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const exercisesCompleted = session.exercises.filter((ex) =>
    ex.sets.some((s) => s.completed)
  ).length;

  const { grade, message: gradeMessage } = getSessionGrade(totalCompletedSets, totalSets);

  const newPRs: { exerciseName: string; weight: number }[] = [];
  for (const ex of session.exercises) {
    const completedSets = ex.sets.filter((s) => s.completed);
    if (completedSets.length === 0) continue;
    const maxWeight = Math.max(...completedSets.map((s) => s.weightLbs));
    const record = personalRecords[ex.exerciseId];
    if (record && maxWeight >= record.maxWeight) {
      const exercise = getExerciseById(ex.exerciseId);
      if (exercise) {
        newPRs.push({
          exerciseName: getExerciseLocalized(exercise, locale).name,
          weight: maxWeight,
        });
      }
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.celebration}>
          <div className={styles.gradeCircle} style={{ borderColor: routine?.color }}>
            <span className={styles.grade}>{grade}</span>
          </div>
          <h1 className={styles.title}>{t('workoutComplete')}</h1>
          <p className={styles.gradeMsg}>{gradeMessage}</p>
          <p className={styles.motivation}>{message}</p>
        </div>

        <div
          className={styles.routineBadge}
          style={{
            backgroundColor: routine?.color ? `${routine.color}22` : undefined,
            color: routine?.color,
          }}
        >
          {routine ? `${routine.icon} ${routine.name}` : session.routineId}
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{session.totalWeightLbs.toLocaleString()}</span>
            <span className={styles.statUnit}>{t('lbsLifted')}</span>
            <span className={styles.statSub}>
              ({lbsToKg(session.totalWeightLbs).toLocaleString()} kg)
            </span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {session.duration ? formatDuration(session.duration) : '--'}
            </span>
            <span className={styles.statUnit}>{t('duration')}</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statValue}>{exercisesCompleted}</span>
            <span className={styles.statUnit}>{t('exercises')}</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {totalCompletedSets}/{totalSets}
            </span>
            <span className={styles.statUnit}>{t('setsCompleted')}</span>
          </div>
        </div>

        {newPRs.length > 0 && (
          <div className={styles.prSection}>
            <h2 className={styles.sectionTitle}>{t('personalRecords')}</h2>
            {newPRs.map((pr, i) => (
              <div key={i} className={styles.prItem}>
                <span className={styles.prIcon}>🏆</span>
                <span className={styles.prName}>{pr.exerciseName}</span>
                <span className={styles.prWeight}>{formatWeight(pr.weight)}</span>
              </div>
            ))}
          </div>
        )}

        <div className={styles.exerciseBreakdown}>
          <h2 className={styles.sectionTitle}>{t('exerciseBreakdown')}</h2>
          {session.exercises.map((ex) => {
            const exercise = getExerciseById(ex.exerciseId);
            const completedSets = ex.sets.filter((s) => s.completed);
            if (completedSets.length === 0) return null;

            const maxWeight = Math.max(...completedSets.map((s) => s.weightLbs));
            const volume = completedSets.reduce((sum, s) => sum + s.weightLbs * s.reps, 0);

            return (
              <div key={ex.exerciseId} className={styles.exerciseRow}>
                <div className={styles.exerciseInfo}>
                  <span className={styles.exerciseName}>
                    {exercise ? getExerciseLocalized(exercise, locale).name : ex.exerciseId}
                  </span>
                  <span className={styles.exerciseSets}>
                    {t('setsCompletedCount', { count: completedSets.length })}
                  </span>
                </div>
                <div className={styles.exerciseStats}>
                  <span className={styles.exerciseMax}>
                    {t('max')}: {maxWeight} lbs
                  </span>
                  <span className={styles.exerciseVol}>
                    {t('vol')}: {volume.toLocaleString()} lbs
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button className={styles.homeButton} onClick={() => router.push('/')}>
          {t('backToHome')}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}
