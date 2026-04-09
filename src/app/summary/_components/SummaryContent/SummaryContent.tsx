'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SessionLog, Routine } from '@/types';
import { getExerciseById, getExerciseLocalized } from '@/data/exercises';
import { useLocale } from '@/context/LocaleContext';
import { formatDuration } from '@/utils/time';
import { formatWeight, lbsToKg } from '@/utils/weight';
import { getSessionGrade } from '@/utils/motivation';
import { fetchSessionById, fetchPersonalRecords, fetchRoutineById } from '@/lib/api';
import { getOfflineSessionById, getLocalPersonalRecords } from './offlineSummaryHelpers';
import { getOfflineQueue } from '@/utils/offlineQueue';
import { getRoutines } from '@/utils/storage';
import styles from '../../page.module.css';

export default function SummaryContent() {
  const t = useTranslations('summary');
  const { locale } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('sessionId');
  const isOfflineSession = searchParams.get('offline') === 'true';

  const [session, setSession] = useState<SessionLog | null>(null);
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [personalRecords, setPersonalRecords] = useState<
    Record<string, { maxWeight: number; maxVolume: number; date: string }>
  >({});
  const [message, setMessage] = useState('');
  const [isPendingSync, setIsPendingSync] = useState(false);

  useEffect(() => {
    const motivationalMessages = Array.isArray(t('motivational')) ? t('motivational') : [];
    if (motivationalMessages.length > 0) {
      const index = Math.floor(Math.random() * motivationalMessages.length);
      setMessage(motivationalMessages[index]);
    } else {
      setMessage('Great work!');
    }
  }, [t]);

  useEffect(() => {
    if (!sessionId) return;

    async function load() {
      if (isOfflineSession) {
        // Load entirely from localStorage — no network calls needed
        const localSession = getOfflineSessionById(sessionId!);
        if (localSession) {
          setSession(localSession);
          setPersonalRecords(getLocalPersonalRecords());
          setIsPendingSync(true);
          // Attempt to load routine from cache
          const { routines: cachedRoutines } = getRoutines();
          const cachedRoutine =
            cachedRoutines.find((cachedR) => cachedR.id === localSession.routineId) ?? null;
          setRoutine(cachedRoutine);
        }
        return;
      }

      try {
        const [sess, records] = await Promise.all([
          fetchSessionById(sessionId!),
          fetchPersonalRecords(),
        ]);
        setSession(sess);
        setPersonalRecords(records);
        // Check if this session is still in the offline queue (e.g., sync hasn't run yet)
        const queue = getOfflineQueue();
        setIsPendingSync(queue.some((entry) => entry.sessionId === sessionId));
        if (sess.routineId) {
          try {
            const fetchedRoutine = await fetchRoutineById(sess.routineId);
            setRoutine(fetchedRoutine);
          } catch {
            setRoutine(null);
          }
        }
      } catch {
        // Network failed — fall back to localStorage
        const localSession = getOfflineSessionById(sessionId!);
        if (localSession) {
          setSession(localSession);
          setPersonalRecords(getLocalPersonalRecords());
          setIsPendingSync(true);
          const { routines: cachedRoutines } = getRoutines();
          const cachedRoutine =
            cachedRoutines.find((cachedR) => cachedR.id === localSession.routineId) ?? null;
          setRoutine(cachedRoutine);
        }
      }
    }
    load();
  }, [sessionId, isOfflineSession]);

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

  const { grade } = getSessionGrade(totalCompletedSets, totalSets);
  const gradeMessage = t(`grade${grade}`) || t('gradeMsg');

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
        {isPendingSync && <div className={styles.pendingSyncBanner}>{t('pendingSync')}</div>}
        <div className={styles.celebration}>
          <span className={styles.gradeLabel}>{t('grade')}</span>
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
