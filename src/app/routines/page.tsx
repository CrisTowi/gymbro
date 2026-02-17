'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Routine, WeeklyPlan } from '@/types';
import { getDayOfWeek } from '@/utils/time';
import {
  fetchRoutines,
  fetchWeeklyPlan,
  updateWeeklyPlan,
  deleteRoutine,
} from '@/lib/api';
import styles from './page.module.css';

const CONFIRM_SET_ACTIVE =
  'Setting this as today\'s workout will update your weekly plan. Continue?';
const CONFIRM_DELETE = 'Delete this routine? It will be removed from any days it\'s assigned to.';

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [list, plan] = await Promise.all([
        fetchRoutines(),
        fetchWeeklyPlan(),
      ]);
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
      if (!weeklyPlan || !confirm(CONFIRM_SET_ACTIVE)) return;
      const next = { ...weeklyPlan, [todayKey]: routineId };
      try {
        await updateWeeklyPlan(next);
        setWeeklyPlan(next);
      } catch (err) {
        console.error('Failed to update plan:', err);
      }
    },
    [weeklyPlan, todayKey]
  );

  const handleDelete = useCallback(
    async (routine: Routine) => {
      if (routine.id === activeRoutineId) return;
      if (!confirm(CONFIRM_DELETE)) return;
      try {
        await deleteRoutine(routine.id);
        const nextPlan = weeklyPlan
          ? Object.fromEntries(
              Object.entries(weeklyPlan).map(([day, id]) => [
                day,
                id === routine.id ? null : id,
              ])
            ) : null;
        if (nextPlan) {
          await updateWeeklyPlan(nextPlan);
          setWeeklyPlan(nextPlan);
        }
        setRoutines((prev) => prev.filter((r) => r.id !== routine.id));
      } catch (err) {
        console.error('Failed to delete routine:', err);
      }
    },
    [activeRoutineId, weeklyPlan]
  );

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading routines…</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          ← Back
        </Link>
        <h1 className={styles.title}>Manage routines</h1>
        <p className={styles.subtitle}>
          Only one routine is active at a time (today&apos;s workout). Create, edit, or delete
          routines. You can&apos;t delete the active routine—switch to another first.
        </p>
      </header>

      <div className={styles.content}>
        {activeRoutineId && (
          <p className={styles.activeHint}>
            <span className={styles.activeHintDot} />
            Active today: the routine assigned to today in your weekly plan
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
                    aria-label={`Edit ${routine.name}`}
                  >
                    <span className={styles.cardIcon}>{routine.icon}</span>
                    <div className={styles.cardBody}>
                      <h2 className={styles.cardName} style={{ color: routine.color }}>
                        {routine.name}
                      </h2>
                      <span className={styles.cardMeta}>
                        {routine.exercises.length} exercises
                        {isActive && (
                          <>
                            {' · '}
                            <span className={styles.activeBadge}>Active today</span>
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
                        Set as today&apos;s workout
                      </button>
                    )}
                    {isActive && (
                      <span className={styles.activeLabel} title="This is today's workout">
                        Active
                      </span>
                    )}
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(routine)}
                      disabled={isActive}
                      title={
                        isActive
                          ? 'Cannot delete the active routine. Set another as today\'s workout first.'
                          : 'Delete routine'
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <Link href="/routines/new" className={styles.addButton}>
          + New routine
        </Link>
      </div>
    </div>
  );
}
