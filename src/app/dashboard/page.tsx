'use client';

import { useState, useEffect, useMemo } from 'react';
import { MuscleGroup, TimeRange } from '@/types';
import { exercises, getAllCategories } from '@/data/exercises';
import { lbsToKg } from '@/utils/weight';
import {
  fetchOverview,
  fetchPersonalRecords,
  fetchExerciseHistory,
  OverviewStats,
  PersonalRecords,
  ExerciseHistoryPoint,
} from '@/lib/api';
import FilterBar from '@/components/FilterBar/FilterBar';
import ProgressChart from '@/components/ProgressChart/ProgressChart';
import styles from './page.module.css';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | 'all'>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('all-time');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  const [overallStats, setOverallStats] = useState<OverviewStats>({
    totalSessions: 0,
    totalWeight: 0,
    totalExercises: 0,
    personalRecordCount: 0,
  });
  const [personalRecords, setPersonalRecords] = useState<PersonalRecords>({});
  const [historyMap, setHistoryMap] = useState<Record<string, ExerciseHistoryPoint[]>>({});

  const muscleGroups = getAllCategories() as MuscleGroup[];

  const filteredExercises = useMemo(() => {
    if (selectedMuscleGroup === 'all') {
      return exercises.map((ex) => ({ id: ex.id, name: ex.name }));
    }
    return exercises
      .filter((ex) => ex.category === selectedMuscleGroup)
      .map((ex) => ({ id: ex.id, name: ex.name }));
  }, [selectedMuscleGroup]);

  const exercisesToDisplay = useMemo(() => {
    if (selectedExerciseId) {
      return [selectedExerciseId];
    }
    return filteredExercises.map((ex) => ex.id);
  }, [selectedExerciseId, filteredExercises]);

  // Load overview + personal records once on mount
  useEffect(() => {
    async function load() {
      try {
        const [stats, records] = await Promise.all([
          fetchOverview(),
          fetchPersonalRecords(),
        ]);
        setOverallStats(stats);
        setPersonalRecords(records);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
      setMounted(true);
    }
    load();
  }, []);

  // Load exercise histories when the displayed exercises change
  useEffect(() => {
    if (!mounted) return;

    async function loadHistories() {
      const newMap: Record<string, ExerciseHistoryPoint[]> = {};
      await Promise.all(
        exercisesToDisplay.map(async (id) => {
          if (historyMap[id]) {
            newMap[id] = historyMap[id];
          } else {
            try {
              newMap[id] = await fetchExerciseHistory(id);
            } catch {
              newMap[id] = [];
            }
          }
        })
      );
      setHistoryMap((prev) => ({ ...prev, ...newMap }));
    }
    loadHistories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, exercisesToDisplay]);

  const filterByTimeRange = (
    data: ExerciseHistoryPoint[]
  ) => {
    const now = new Date();
    return data.filter((d) => {
      const date = new Date(d.date);
      switch (selectedTimeRange) {
        case 'this-month':
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        case 'this-year':
          return date.getFullYear() === now.getFullYear();
        case 'all-time':
        default:
          return true;
      }
    });
  };

  if (!mounted) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Track your progress over time</p>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.overviewGrid}>
          <div className={styles.overviewCard}>
            <span className={styles.overviewValue}>
              {overallStats.totalSessions}
            </span>
            <span className={styles.overviewLabel}>Total Sessions</span>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewValue}>
              {overallStats.totalWeight.toLocaleString()}
            </span>
            <span className={styles.overviewLabel}>lbs Lifted</span>
            <span className={styles.overviewSub}>
              ({lbsToKg(overallStats.totalWeight).toLocaleString()} kg)
            </span>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewValue}>
              {overallStats.totalExercises}
            </span>
            <span className={styles.overviewLabel}>Exercises Tracked</span>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewValue}>
              {overallStats.personalRecordCount}
            </span>
            <span className={styles.overviewLabel}>Personal Records</span>
          </div>
        </div>

        <FilterBar
          selectedMuscleGroup={selectedMuscleGroup}
          selectedTimeRange={selectedTimeRange}
          selectedExerciseId={selectedExerciseId}
          muscleGroups={muscleGroups}
          exercises={filteredExercises}
          onMuscleGroupChange={setSelectedMuscleGroup}
          onTimeRangeChange={setSelectedTimeRange}
          onExerciseChange={setSelectedExerciseId}
        />

        <div className={`${styles.charts} ${exercisesToDisplay.length > 1 ? styles.chartsGrid : ''}`}>
          {exercisesToDisplay.map((exerciseId) => {
            const exercise = exercises.find((ex) => ex.id === exerciseId);
            if (!exercise) return null;

            const rawHistory = historyMap[exerciseId] || [];
            const history = filterByTimeRange(rawHistory);

            if (rawHistory.length === 0) return null;

            return (
              <div key={exerciseId} className={styles.chartSection}>
                <div className={styles.chartHeader}>
                  <h3 className={styles.chartTitle}>{exercise.name}</h3>
                  <span className={styles.chartCategory}>{exercise.category}</span>
                </div>
                <ProgressChart
                  data={history}
                  exerciseName={exercise.name}
                  showVolume={true}
                />
                {personalRecords[exerciseId] && (
                  <div className={styles.prBadge}>
                    PR: {personalRecords[exerciseId].maxWeight} lbs (
                    {lbsToKg(personalRecords[exerciseId].maxWeight)} kg)
                  </div>
                )}
              </div>
            );
          })}

          {overallStats.totalSessions === 0 && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📊</span>
              <h3 className={styles.emptyTitle}>No Data Yet</h3>
              <p className={styles.emptyText}>
                Complete your first workout to start tracking progress. Your
                charts and stats will appear here!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
