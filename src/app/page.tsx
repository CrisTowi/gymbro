'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import WeeklyPlan from '@/components/WeeklyPlan/WeeklyPlan';
import LastSessionCard from '@/components/SessionSummary/LastSessionCard';
import { WeeklyPlan as WeeklyPlanType, RoutineType, SessionLog, DEFAULT_WEEKLY_PLAN } from '@/types';
import { getWeeklyPlan, saveWeeklyPlan, getLastSession } from '@/utils/storage';
import { routines } from '@/data/routines';
import { getDayOfWeek } from '@/utils/time';
import styles from './page.module.css';

export default function Home() {
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanType>(DEFAULT_WEEKLY_PLAN);
  const [lastSession, setLastSession] = useState<SessionLog | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setWeeklyPlan(getWeeklyPlan());
    setLastSession(getLastSession());
    setMounted(true);
  }, []);

  const handlePlanChange = (plan: WeeklyPlanType) => {
    setWeeklyPlan(plan);
    saveWeeklyPlan(plan);
  };

  const todayRoutineId = weeklyPlan[getDayOfWeek()] as RoutineType | null;
  const todayRoutine = todayRoutineId
    ? routines.find((r) => r.id === todayRoutineId)
    : null;

  if (!mounted) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
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
            GymTrack
          </h1>
          <p className={styles.greeting}>Ready to crush it today?</p>
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
              <span className={styles.todayLabel}>Today&apos;s Workout</span>
              <h2 className={styles.todayRoutine} style={{ color: todayRoutine.color }}>
                {todayRoutine.icon} {todayRoutine.name}
              </h2>
              <p className={styles.todayDesc}>{todayRoutine.description}</p>
              <span className={styles.todayExercises}>
                {todayRoutine.exercises.length} exercises
              </span>
            </div>
            <Link href={`/workout/preview?routine=${todayRoutineId}`} className={styles.startButton}>
              Start Workout
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className={styles.restDayCard}>
            <span className={styles.restIcon}>😴</span>
            <h2 className={styles.restTitle}>Rest Day</h2>
            <p className={styles.restDesc}>
              Recovery is part of the process. But if you&apos;re feeling energized...
            </p>
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

        <WeeklyPlan plan={weeklyPlan} onPlanChange={handlePlanChange} />

        <LastSessionCard session={lastSession} />
      </div>
    </div>
  );
}
