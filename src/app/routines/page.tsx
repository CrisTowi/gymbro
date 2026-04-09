'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Routine, WeeklyPlan } from '@/types';
import { getDayOfWeek } from '@/utils/time';
import { fetchRoutines, fetchWeeklyPlan, updateWeeklyPlan, deleteRoutine } from '@/lib/api';
import { getRoutines } from '@/utils/storage';
import styles from './page.module.css';

export default function RoutinesPage() {
  const t = useTranslations('routines');
  const tCommon = useTranslations('common');
  const tHome = useTranslations('home');
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    // Load from cache immediately for fast first paint
    const cached = getRoutines();
    if (cached.routines.length > 0) {
      setRoutines(cached.routines);
    }

    // Fetch from API in background
    try {
      const [list, plan] = await Promise.all([fetchRoutines(), fetchWeeklyPlan()]);
      setRoutines(list);
      setWeeklyPlan(plan);
    } catch (err) {
      console.error('Failed to load routines:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const todayKey = getDayOfWeek();
  const activeRoutineId = weeklyPlan?.[todayKey] ?? null;

  const handleSetActive = useCallback(
    async (routineId: string) => {
      if (!weeklyPlan || !confirm(t('confirmSetActive'))) return;
      const next = { ...weeklyPlan, [todayKey]: routineId };
      try {
        await updateWeeklyPlan(next);
        setWeeklyPlan(next);
      } catch (err) {
        console.error('Failed to update plan:', err);
      }
    },
    [weeklyPlan, todayKey, t]
  );

  const handleDelete = useCallback(
    async (routine: Routine) => {
      if (routine.id === activeRoutineId) return;
      if (!confirm(t('confirmDelete'))) return;
      try {
        await deleteRoutine(routine.id);
        const nextPlan = weeklyPlan
          ? Object.fromEntries(
              Object.entries(weeklyPlan).map(([day, id]) => [day, id === routine.id ? null : id])
            )
          : null;
        if (nextPlan) {
          await updateWeeklyPlan(nextPlan);
          setWeeklyPlan(nextPlan);
        }
        setRoutines((prev) => prev.filter((r) => r.id !== routine.id));
      } catch (err) {
        console.error('Failed to delete routine:', err);
      }
    },
    [activeRoutineId, weeklyPlan, t]
  );

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>{t('loadingRoutines')}</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          ← {tCommon('back')}
        </Link>
        <h1 className={styles.title}>{t('manageTitle')}</h1>
        <p className={styles.subtitle}>{t('manageSubtitle')}</p>
      </header>

      <div className={styles.content}>
        {activeRoutineId && (
          <p className={styles.activeHint}>
            <span className={styles.activeHintDot} />
            {t('activeTodayHint')}
          </p>
        )}

        <ul className={styles.list}>
          {routines.map((routine) => {
            const isActive = routine.id === activeRoutineId;
            return (
              <li key={routine.id}>
                <div
                  className={styles.card}
                  style={{
                    borderColor: routine.color,
                    background: `linear-gradient(135deg, ${routine.color}11, ${routine.color}05)`,
                  }}
                >
                  <Link
                    href={`/routines/${routine.id}/edit`}
                    className={styles.cardMain}
                    aria-label={t('editRoutineAria', { name: routine.name })}
                  >
                    <span className={styles.cardIcon}>{routine.icon}</span>
                    <div className={styles.cardBody}>
                      <h2 className={styles.cardName} style={{ color: routine.color }}>
                        {routine.name}
                      </h2>
                      <span className={styles.cardMeta}>
                        {tHome('exercisesCount', { count: routine.exercises.length })}
                        {isActive && (
                          <>
                            {' · '}
                            <span className={styles.activeBadge}>{t('activeToday')}</span>
                          </>
                        )}
                      </span>
                    </div>
                    <span className={styles.cardArrow}>→</span>
                  </Link>

                  <div className={styles.cardActions}>
                    {!isActive && (
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => handleSetActive(routine.id)}
                      >
                        {t('setAsTodaysWorkout')}
                      </button>
                    )}
                    {isActive && (
                      <span className={styles.activeLabel} title={t('activeTodayHint')}>
                        {t('active')}
                      </span>
                    )}
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(routine)}
                      disabled={isActive}
                      title={isActive ? t('cannotDeleteActive') : t('deleteRoutine')}
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <Link href="/routines/new" className={styles.addButton}>
          + {t('newRoutine')}
        </Link>
      </div>
    </div>
  );
}
