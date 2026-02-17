'use client';

import { useState } from 'react';
import { WeeklyPlan as WeeklyPlanType, Routine, DayOfWeek } from '@/types';
import { getDayOfWeek } from '@/utils/time';
import styles from './WeeklyPlan.module.css';

const DAYS: { key: DayOfWeek; short: string; label: string }[] = [
  { key: 'monday', short: 'Mon', label: 'Monday' },
  { key: 'tuesday', short: 'Tue', label: 'Tuesday' },
  { key: 'wednesday', short: 'Wed', label: 'Wednesday' },
  { key: 'thursday', short: 'Thu', label: 'Thursday' },
  { key: 'friday', short: 'Fri', label: 'Friday' },
  { key: 'saturday', short: 'Sat', label: 'Saturday' },
  { key: 'sunday', short: 'Sun', label: 'Sunday' },
];

interface WeeklyPlanProps {
  plan: WeeklyPlanType;
  onPlanChange: (plan: WeeklyPlanType) => void;
  routines: Routine[];
}

export default function WeeklyPlan({ plan, onPlanChange, routines }: WeeklyPlanProps) {
  const [editingDay, setEditingDay] = useState<DayOfWeek | null>(null);
  const today = getDayOfWeek();

  const handleDayClick = (day: DayOfWeek) => {
    setEditingDay(editingDay === day ? null : day);
  };

  const handleRoutineSelect = (day: DayOfWeek, routineId: string | null) => {
    onPlanChange({ ...plan, [day]: routineId });
    setEditingDay(null);
  };

  const getRoutineColor = (routineId: string | null): string => {
    if (!routineId) return 'transparent';
    const routine = routines.find((r) => r.id === routineId);
    return routine?.color || 'transparent';
  };

  const getRoutineName = (routineId: string | null): string => {
    if (!routineId) return 'Rest';
    const routine = routines.find((r) => r.id === routineId);
    return routine?.name || '';
  };

  const getRoutineIcon = (routineId: string | null): string => {
    if (!routineId) return '😴';
    const routine = routines.find((r) => r.id === routineId);
    return routine?.icon || '';
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Weekly Plan</h2>
      <div className={styles.grid}>
        {DAYS.map(({ key, short }) => {
          const routineId = plan[key] ?? null;
          const isToday = today === key;
          const isEditing = editingDay === key;

          return (
            <div key={key} className={styles.dayWrapper}>
              <button
                className={`${styles.day} ${isToday ? styles.today : ''} ${
                  routineId ? styles.hasRoutine : styles.restDay
                }`}
                style={{
                  borderColor: routineId ? getRoutineColor(routineId) : undefined,
                }}
                onClick={() => handleDayClick(key)}
                aria-label={`${short}: ${getRoutineName(routineId)}`}
              >
                <span className={styles.dayLabel}>{short}</span>
                <span className={styles.icon}>{getRoutineIcon(routineId)}</span>
                <span
                  className={styles.routineName}
                  style={{ color: routineId ? getRoutineColor(routineId) : undefined }}
                >
                  {getRoutineName(routineId)}
                </span>
                {isToday && <span className={styles.todayDot} />}
              </button>

              {isEditing && (
                <div className={styles.dropdown}>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => handleRoutineSelect(key, null)}
                  >
                    😴 Rest Day
                  </button>
                  {routines.map((routine) => (
                    <button
                      key={routine.id}
                      className={styles.dropdownItem}
                      onClick={() => handleRoutineSelect(key, routine.id)}
                      style={{ borderLeft: `3px solid ${routine.color}` }}
                    >
                      {routine.icon} {routine.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
