'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { formatTime } from '@/utils/time';
import styles from './RestTimer.module.css';

export interface NextExercisePreview {
  name: string;
  instructions: string[];
}

interface RestTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  progress: number;
  onAddTime: () => void;
  onReduceTime: () => void;
  onSkip: () => void;
  onPause: () => void;
  onResume: () => void;
  nextExercise?: NextExercisePreview | null;
}

export default function RestTimer({
  remainingSeconds,
  totalSeconds,
  isRunning,
  progress,
  onAddTime,
  onReduceTime,
  onSkip,
  onPause,
  onResume,
  nextExercise,
}: RestTimerProps) {
  // Remove focus from any input when timer opens to avoid iOS "Undo typing" prompt when moving the phone
  useEffect(() => {
    (document.activeElement as HTMLElement)?.blur?.();
  }, []);

  // Lock background scroll while timer overlay is open (removes scrollbar behind modal)
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  // Keep screen on while rest timer is visible (e.g. avoid iPhone auto-lock). Supported in Safari iOS 16.4+.
  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null;
    const nav = typeof navigator !== 'undefined' ? navigator : null;
    const wakeLock = nav && 'wakeLock' in nav ? (nav as Navigator & { wakeLock: { request(type: 'screen'): Promise<WakeLockSentinel> } }).wakeLock : null;

    async function requestWakeLock() {
      if (wakeLock) {
        try {
          sentinel = await wakeLock.request('screen');
        } catch {
          // Ignore (e.g. low battery, or already active)
        }
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        sentinel = null; // Browser releases automatically when hidden
      } else {
        requestWakeLock();
      }
    }

    requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      sentinel?.release().catch(() => {});
    };
  }, []);

  if (totalSeconds === 0) return null;

  const t = useTranslations('restTimer');
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - progress);
  const isAlmostDone = remainingSeconds <= 10 && remainingSeconds > 0;

  return (
    <div className={`${styles.overlay} ${isAlmostDone ? styles.almostDone : ''}`}>
      <div className={styles.container}>
        <h3 className={styles.title}>{t('restTime')}</h3>

        <div className={styles.timerCircle}>
          <svg className={styles.svg} viewBox="0 0 120 120">
            <circle
              className={styles.trackCircle}
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="6"
            />
            <circle
              className={styles.progressCircle}
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className={styles.timeDisplay}>
            <span className={`${styles.time} ${isAlmostDone ? styles.timePulse : ''}`}>
              {formatTime(remainingSeconds)}
            </span>
            <span className={styles.totalTime}>{t('of')} {formatTime(totalSeconds)}</span>
          </div>
        </div>

        <div className={styles.adjustButtons}>
          <button
            className={styles.adjustButton}
            onClick={onReduceTime}
            disabled={remainingSeconds <= 15}
            aria-label={t('reduce15')}
          >
            {t('reduce15Short')}
          </button>

          {isRunning ? (
            <button className={styles.pauseButton} onClick={onPause} aria-label={t('pause')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            </button>
          ) : (
            <button className={styles.pauseButton} onClick={onResume} aria-label={t('resume')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </button>
          )}

          <button className={styles.adjustButton} onClick={onAddTime} aria-label={t('add15')}>
            {t('add15Short')}
          </button>
        </div>

        {nextExercise && (
          <div className={styles.nextExercise}>
            <h4 className={styles.nextExerciseTitle}>{t('nextUp')}</h4>
            <p className={styles.nextExerciseName}>{nextExercise.name}</p>
            {nextExercise.instructions.length > 0 && (
              <ol className={styles.nextExerciseInstructions}>
                {nextExercise.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            )}
          </div>
        )}

        <button className={styles.skipButton} onClick={onSkip}>
          {t('skipRest')}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5,4 15,12 5,20" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>
      </div>
    </div>
  );
}
