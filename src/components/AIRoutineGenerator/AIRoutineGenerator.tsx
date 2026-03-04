'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/context/LocaleContext';
import { WeeklyPlan as WeeklyPlanType, Routine, Exercise } from '@/types';
import { generateWeeklyPlanFromDescription, updateWeeklyPlan, fetchExercises } from '@/lib/api';
import styles from './AIRoutineGenerator.module.css';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_ABBR = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_LABEL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface AIRoutineGeneratorProps {
  routines: Routine[];
  currentPlan?: WeeklyPlanType;
  onPlanSaved: () => void;
}

type Step = 'input' | 'preview';

export default function AIRoutineGenerator({
  routines,
  currentPlan: _currentPlan,
  onPlanSaved,
}: AIRoutineGeneratorProps) {
  const t = useTranslations('aiRoutine');
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('input');
  const [description, setDescription] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<WeeklyPlanType | null>(null);
  const [exerciseMap, setExerciseMap] = useState<Record<string, Exercise>>({});
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    setOpen(true);
    setStep('input');
    setDescription('');
    setGeneratedPlan(null);
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    setStep('input');
    setDescription('');
    setGeneratedPlan(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const needsExercises = Object.keys(exerciseMap).length === 0;
      const [plan, allExercises] = await Promise.all([
        generateWeeklyPlanFromDescription(description.trim()),
        needsExercises ? fetchExercises() : Promise.resolve(null),
      ]);
      setGeneratedPlan(plan);
      if (allExercises) {
        setExerciseMap(
          Object.fromEntries(
            allExercises.map((e) => [
              (e as unknown as { exerciseId: string }).exerciseId ?? e.id,
              e,
            ])
          )
        );
      }
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorGenerate'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    setStep('input');
    setGeneratedPlan(null);
    setEditingDay(null);
    setError(null);
  };

  const handleDayPillClick = (day: string) => {
    setEditingDay((prev) => (prev === day ? null : day));
  };

  const handleAssignDay = (day: string, routineId: string | null) => {
    setGeneratedPlan((prev) => ({ ...prev, [day]: routineId }));
    setEditingDay(null);
  };

  const handleConfirm = async () => {
    if (!generatedPlan) return;
    setLoading(true);
    setError(null);
    try {
      await updateWeeklyPlan(generatedPlan);
      onPlanSaved();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorSave'));
    } finally {
      setLoading(false);
    }
  };

  // Group consecutive/same-routine days together for the summary cards
  const routineGroups = (() => {
    if (!generatedPlan) return [];
    const groups: { routine: Routine; days: string[] }[] = [];
    const seen = new Map<string, number>();
    for (const day of DAYS) {
      const routineId = generatedPlan[day];
      if (!routineId) continue;
      if (seen.has(routineId)) {
        groups[seen.get(routineId)!].days.push(day);
      } else {
        const routine = routines.find((r) => r.id === routineId);
        if (routine) {
          seen.set(routineId, groups.length);
          groups.push({ routine, days: [day] });
        }
      }
    }
    return groups;
  })();

  const restDays = DAYS.filter((d) => !generatedPlan?.[d]);
  const totalExercises = routineGroups.reduce((sum, g) => sum + g.routine.exercises.length, 0);
  const activeDays = DAYS.length - restDays.length;

  return (
    <>
      <button
        type="button"
        className={styles.fab}
        onClick={handleOpen}
        aria-label={t('openLabel')}
        title={t('openLabel')}
      >
        <span className={styles.fabIcon}>✨</span>
        <span className={styles.fabLabel}>{t('cta')}</span>
      </button>

      {open && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-routine-title"
        >
          <div className={styles.modal}>
            <div className={styles.header}>
              <h2 id="ai-routine-title" className={styles.title}>
                {step === 'input' ? t('title') : t('previewTitle')}
              </h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={handleClose}
                aria-label={t('close')}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.body}>
              {step === 'input' && (
                <>
                  <p className={styles.hint}>{t('hint')}</p>
                  <textarea
                    className={styles.textarea}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('placeholder')}
                    rows={5}
                    disabled={loading}
                  />
                </>
              )}

              {step === 'preview' && generatedPlan && (
                <>
                  {/* Stats bar */}
                  <div className={styles.statsBar}>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>{activeDays}</span>
                      <span className={styles.statLabel}>{t('statWorkoutDays')}</span>
                    </div>
                    <div className={styles.statDivider} />
                    <div className={styles.stat}>
                      <span className={styles.statValue}>{restDays.length}</span>
                      <span className={styles.statLabel}>{t('statRestDays')}</span>
                    </div>
                    <div className={styles.statDivider} />
                    <div className={styles.stat}>
                      <span className={styles.statValue}>{totalExercises}</span>
                      <span className={styles.statLabel}>{t('statExercises')}</span>
                    </div>
                  </div>

                  {/* Week strip */}
                  <div className={styles.weekStrip}>
                    {DAYS.map((day, i) => {
                      const routineId = generatedPlan[day];
                      const routine = routineId ? routines.find((r) => r.id === routineId) : null;
                      const isEditing = editingDay === day;
                      return (
                        <button
                          key={day}
                          type="button"
                          className={`${styles.dayPill} ${isEditing ? styles.dayPillActive : ''}`}
                          title={DAY_LABEL[i]}
                          onClick={() => handleDayPillClick(day)}
                        >
                          <span className={styles.dayPillAbbr}>{DAY_ABBR[i]}</span>
                          {routine ? (
                            <span className={styles.dayPillIcon}>{routine.icon}</span>
                          ) : (
                            <span className={styles.dayPillRest}>—</span>
                          )}
                          <span
                            className={styles.dayPillBar}
                            style={{ background: routine ? routine.color : 'var(--color-border)' }}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Day editor */}
                  {editingDay && (
                    <div className={styles.dayEditor}>
                      <p className={styles.dayEditorTitle}>{DAY_LABEL[DAYS.indexOf(editingDay)]}</p>
                      <div className={styles.dayEditorOptions}>
                        <button
                          type="button"
                          className={`${styles.dayEditorOption} ${!generatedPlan[editingDay] ? styles.dayEditorOptionSelected : ''}`}
                          onClick={() => handleAssignDay(editingDay, null)}
                        >
                          <span>😴</span>
                          <span>{t('restDaysLabel')}</span>
                        </button>
                        {routines.map((routine) => (
                          <button
                            key={routine.id}
                            type="button"
                            className={`${styles.dayEditorOption} ${generatedPlan[editingDay] === routine.id ? styles.dayEditorOptionSelected : ''}`}
                            style={{ '--routine-color': routine.color } as React.CSSProperties}
                            onClick={() => handleAssignDay(editingDay, routine.id)}
                          >
                            <span>{routine.icon}</span>
                            <span>{routine.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Routine cards */}
                  <div className={styles.routineCards}>
                    {routineGroups.map(({ routine, days }) => (
                      <div
                        key={routine.id}
                        className={styles.routineCard}
                        style={{ '--routine-color': routine.color } as React.CSSProperties}
                      >
                        <div className={styles.routineCardHeader}>
                          <div className={styles.routineCardMeta}>
                            <span className={styles.routineCardIcon}>{routine.icon}</span>
                            <div>
                              <span
                                className={styles.routineCardName}
                                style={{ color: routine.color }}
                              >
                                {routine.name}
                              </span>
                              <span className={styles.routineCardDays}>
                                {days.map((d) => DAY_LABEL[DAYS.indexOf(d)]).join(' · ')}
                              </span>
                            </div>
                          </div>
                          <span className={styles.routineCardCount}>
                            {routine.exercises.length} exercises
                          </span>
                        </div>

                        <div className={styles.exerciseList}>
                          {routine.exercises.map((ex, idx) => {
                            const exercise = exerciseMap[ex.exerciseId];
                            const name = exercise
                              ? (exercise.name[locale] ?? exercise.name.en)
                              : null;
                            return (
                              <div key={idx} className={styles.exerciseItem}>
                                <div className={styles.exerciseLeft}>
                                  <span className={styles.exerciseIndex}>{idx + 1}</span>
                                  <span className={styles.exerciseName}>
                                    {name ?? <span className={styles.exerciseSkeleton} />}
                                  </span>
                                </div>
                                <span className={styles.exerciseSets}>
                                  {ex.sets} <span className={styles.exerciseSetsX}>×</span>{' '}
                                  {ex.reps}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {restDays.length > 0 && (
                      <div className={styles.restCard}>
                        <span className={styles.restEmoji}>😴</span>
                        <div>
                          <span className={styles.restCardLabel}>{t('restDaysLabel')}</span>
                          <span className={styles.restCardDays}>
                            {restDays.map((d) => DAY_LABEL[DAYS.indexOf(d)]).join(' · ')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {error && (
                <div className={styles.error} role="alert">
                  {error}
                </div>
              )}
            </div>

            <div className={styles.footer}>
              {step === 'input' && (
                <div className={styles.footerActions}>
                  <button type="button" className={styles.btnSecondary} onClick={handleClose}>
                    {t('cancel')}
                  </button>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={handleGenerate}
                    disabled={loading || !description.trim()}
                  >
                    {loading ? t('generating') : t('generate')}
                  </button>
                </div>
              )}
              {step === 'preview' && (
                <div className={styles.footerActions}>
                  <button type="button" className={styles.btnSecondary} onClick={handleRegenerate}>
                    {t('regenerate')}
                  </button>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    {loading ? t('saving') : t('confirm')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
