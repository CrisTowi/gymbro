'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { WeeklyPlan as WeeklyPlanType, Routine } from '@/types';
import {
  generateWeeklyPlanFromDescription,
  updateWeeklyPlan,
} from '@/lib/api';
import WeeklyPlan from '@/components/WeeklyPlan/WeeklyPlan';
import styles from './AIRoutineGenerator.module.css';

interface AIRoutineGeneratorProps {
  routines: Routine[];
  currentPlan: WeeklyPlanType;
  onPlanSaved: () => void;
}

type Step = 'input' | 'preview';

export default function AIRoutineGenerator({
  routines,
  currentPlan,
  onPlanSaved,
}: AIRoutineGeneratorProps) {
  const t = useTranslations('aiRoutine');
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('input');
  const [description, setDescription] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState<WeeklyPlanType | null>(null);
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
      const plan = await generateWeeklyPlanFromDescription(description.trim());
      setGeneratedPlan(plan);
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
    setError(null);
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

  const planToShow = generatedPlan ?? currentPlan;

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
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="ai-routine-title">
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

              {step === 'preview' && (
                <>
                  <p className={styles.previewHint}>{t('previewHint')}</p>
                  <div className={styles.planPreview}>
                    <WeeklyPlan
                      plan={planToShow}
                      onPlanChange={setGeneratedPlan}
                      routines={routines}
                    />
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
