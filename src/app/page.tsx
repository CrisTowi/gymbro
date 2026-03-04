'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import WeeklyPlan from '@/components/WeeklyPlan/WeeklyPlan';
import LastSessionCard from '@/components/SessionSummary/LastSessionCard';
import AIRoutineGenerator from '@/components/AIRoutineGenerator/AIRoutineGenerator';
import { WeeklyPlan as WeeklyPlanType, Routine, SessionLog, DEFAULT_WEEKLY_PLAN } from '@/types';
import { getDayOfWeek } from '@/utils/time';
import {
  fetchWeeklyPlan,
  updateWeeklyPlan,
  fetchLastSession,
  fetchRoutines,
  seedDefaultRoutines,
} from '@/lib/api';
import styles from './page.module.css';

export default function Home() {
  const t = useTranslations('home');
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanType>(DEFAULT_WEEKLY_PLAN);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [lastSession, setLastSession] = useState<SessionLog | null>(null);
  const [mounted, setMounted] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [plan, routineList, session] = await Promise.all([
        fetchWeeklyPlan(),
        fetchRoutines(),
        fetchLastSession(),
      ]);
      setWeeklyPlan(plan);
      setRoutines(routineList);
      setLastSession(session);
    } catch (err) {
      console.error('Failed to load home data:', err);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePlanChange = async (plan: WeeklyPlanType) => {
    setWeeklyPlan(plan);
    try {
      await updateWeeklyPlan(plan);
    } catch (err) {
      console.error('Failed to save weekly plan:', err);
    }
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      const created = await seedDefaultRoutines();
      setRoutines(created);
    } catch (err) {
      console.error('Failed to create default routines:', err);
    } finally {
      setSeeding(false);
    }
  };

  const todayRoutineId = weeklyPlan[getDayOfWeek()] ?? null;
  const todayRoutine = todayRoutineId ? routines.find((r) => r.id === todayRoutineId) : null;

  if (!mounted) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
        </div>
      </div>
    );
  }

  // No routines yet: show create/customize your routine with option to start from push/pull/legs/full-body
  if (routines.length === 0) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.logo}>
              <span className={styles.logoIcon}>⚡</span>
              {t('logo')}
            </h1>
            <p className={styles.greeting}>{t('setUpRoutine')}</p>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.emptyRoutineCard}>
            <span className={styles.emptyRoutineIcon}>📋</span>
            <h2 className={styles.emptyRoutineTitle}>{t('createCustomize')}</h2>
            <p className={styles.emptyRoutineDesc}>{t('createCustomizeDesc')}</p>
            <div className={styles.emptyRoutineActions}>
              <button
                type="button"
                className={styles.emptyRoutinePrimary}
                onClick={handleSeedDefaults}
                disabled={seeding}
              >
                {seeding ? t('creating') : t('startWithPushPullLegs')}
              </button>
              <Link href="/routines/new" className={styles.emptyRoutineSecondary}>
                {t('buildFromScratch')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
            {t('logo')}
          </h1>
          <p className={styles.greeting}>{t('readyToday')}</p>
        </div>
      </header>

      <div className={styles.content}>
        {todayRoutine ? (
          <div
            className={styles.todayCard}
            style={{
              borderColor: todayRoutine.color,
              background: `linear-gradient(135deg, ${todayRoutine.color}11, ${todayRoutine.color}05)`,
            }}
          >
            <div className={styles.todayInfo}>
              <span className={styles.todayLabel}>{t('todaysWorkout')}</span>
              <h2 className={styles.todayRoutine} style={{ color: todayRoutine.color }}>
                {todayRoutine.icon} {todayRoutine.name}
              </h2>
              <p className={styles.todayDesc}>{todayRoutine.description}</p>
              <span className={styles.todayExercises}>
                {t('exercisesCount', { count: todayRoutine.exercises.length })}
              </span>
            </div>
            <Link
              href={`/workout/preview?routine=${todayRoutineId}`}
              className={styles.startButton}
            >
              {t('startWorkout')}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className={styles.restDayCard}>
            <span className={styles.restIcon}>😴</span>
            <h2 className={styles.restTitle}>{t('restDay')}</h2>
            <p className={styles.restDesc}>{t('restDayDesc')}</p>
            <div className={styles.quickStart}>
              {routines.map((routine) => (
                <Link
                  key={routine.id}
                  href={`/workout/preview?routine=${routine.id}`}
                  className={styles.quickStartButton}
                  style={{
                    borderColor: routine.color,
                    color: routine.color,
                  }}
                >
                  {routine.icon} {routine.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <WeeklyPlan plan={weeklyPlan} onPlanChange={handlePlanChange} routines={routines} />

        {process.env.NEXT_PUBLIC_AI_ROUTINE_ENABLED !== 'false' && (
          <AIRoutineGenerator routines={routines} currentPlan={weeklyPlan} onPlanSaved={loadData} />
        )}

        <div className={styles.manageRoutines}>
          <Link href="/routines" className={styles.manageRoutinesLink}>
            {t('manageRoutines')}
          </Link>
        </div>

        <LastSessionCard
          session={lastSession}
          routine={
            lastSession ? (routines.find((r) => r.id === lastSession.routineId) ?? null) : null
          }
        />
      </div>
    </div>
  );
}
