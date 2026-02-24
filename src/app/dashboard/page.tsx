'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { MuscleGroup, TimeRange } from '@/types';
import { exercises, getAllCategories, getExerciseLocalized } from '@/data/exercises';
import { useLocale } from '@/context/LocaleContext';
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
  const t = useTranslations('dashboard');
  const { locale } = useLocale();
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
      return exercises.map((ex) => ({ id: ex.id, name: getExerciseLocalized(ex, locale).name }));
    }
    return exercises
      .filter((ex) => ex.category === selectedMuscleGroup)
      .map((ex) => ({ id: ex.id, name: getExerciseLocalized(ex, locale).name }));
  }, [selectedMuscleGroup, locale]);

  const exercisesToDisplay = useMemo(() => {
    if (selectedExerciseId) {
      return [selectedExerciseId];
    }
    return filteredExercises.map((ex) => ex.id);
  }, [selectedExerciseId, filteredExercises]);

  // Only fetch chart data when user has applied a filter (muscle group or specific exercise)
  const shouldLoadCharts = selectedMuscleGroup !== 'all' || selectedExerciseId !== null;
  const exercisesToFetch = useMemo(() => {
    if (!shouldLoadCharts) return [];
    if (selectedExerciseId) return [selectedExerciseId];
    if (selectedMuscleGroup !== 'all') {
      return exercisesToDisplay;
    }
    return [];
  }, [shouldLoadCharts, selectedExerciseId, selectedMuscleGroup, exercisesToDisplay]);

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

  // Load exercise histories only when user has selected a filter (muscle group or exercise)
  useEffect(() => {
    if (!mounted || exercisesToFetch.length === 0) return;

    async function loadHistories() {
      const newMap: Record<string, ExerciseHistoryPoint[]> = {};
      await Promise.all(
        exercisesToFetch.map(async (id) => {
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
  }, [mounted, exercisesToFetch]);

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
        <div className={styles.loading}>{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.subtitle}>{t('subtitle')}</p>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.overviewGrid}>
          <div className={styles.overviewCard}>
            <span className={styles.overviewValue}>
              {overallStats.totalSessions}
            </span>
            <span className={styles.overviewLabel}>{t('totalSessions')}</span>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewValue}>
              {overallStats.totalWeight.toLocaleString()}
            </span>
            <span className={styles.overviewLabel}>{t('lbsLifted')}</span>
            <span className={styles.overviewSub}>
              ({lbsToKg(overallStats.totalWeight).toLocaleString()} kg)
            </span>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewValue}>
              {overallStats.totalExercises}
            </span>
            <span className={styles.overviewLabel}>{t('exercisesTracked')}</span>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewValue}>
              {overallStats.personalRecordCount}
            </span>
            <span className={styles.overviewLabel}>{t('personalRecords')}</span>
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

        <div className={`${styles.charts} ${exercisesToFetch.length > 1 ? styles.chartsGrid : ''}`}>
          {overallStats.totalSessions === 0 && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📊</span>
              <h3 className={styles.emptyTitle}>{t('noDataYet')}</h3>
              <p className={styles.emptyText}>{t('noDataYetText')}</p>
            </div>
          )}

          {overallStats.totalSessions > 0 && !shouldLoadCharts && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📊</span>
              <h3 className={styles.emptyTitle}>{t('selectFilters')}</h3>
              <p className={styles.emptyText}>{t('selectFiltersText')}</p>
            </div>
          )}

          {overallStats.totalSessions > 0 &&
            shouldLoadCharts &&
            exercisesToFetch.map((exerciseId) => {
              const exercise = exercises.find((ex) => ex.id === exerciseId);
              if (!exercise) return null;

              const rawHistory = historyMap[exerciseId] || [];
              const history = filterByTimeRange(rawHistory);

              if (rawHistory.length === 0) return null;

              const exerciseName = getExerciseLocalized(exercise, locale).name;
              return (
                <div key={exerciseId} className={styles.chartSection}>
                  <div className={styles.chartHeader}>
                    <h3 className={styles.chartTitle}>{exerciseName}</h3>
                    <span className={styles.chartCategory}>{exercise.category}</span>
                  </div>
                  <ProgressChart
                    data={history}
                    exerciseName={exerciseName}
                    showVolume={true}
                  />
                  {personalRecords[exerciseId] && (
                    <div className={styles.prBadge}>
                      {t('pr')}: {personalRecords[exerciseId].maxWeight} lbs (
                      {lbsToKg(personalRecords[exerciseId].maxWeight)} kg)
                    </div>
                  )}
                </div>
              );
            })}

          {overallStats.totalSessions > 0 &&
            shouldLoadCharts &&
            exercisesToFetch.length > 0 &&
            exercisesToFetch.every((id) => (historyMap[id] || []).length === 0) && (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📈</span>
                <h3 className={styles.emptyTitle}>{t('noHistoryYet')}</h3>
                <p className={styles.emptyText}>{t('noHistoryYetText')}</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
