'use client';

import { formatTime } from '@/utils/time';
import styles from './RestTimer.module.css';

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
}: RestTimerProps) {
  if (totalSeconds === 0) return null;

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - progress);
  const isAlmostDone = remainingSeconds <= 10 && remainingSeconds > 0;

  return (
    <div className={`${styles.overlay} ${isAlmostDone ? styles.almostDone : ''}`}>
      <div className={styles.container}>
        <h3 className={styles.title}>Rest Time</h3>

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
            <span className={styles.totalTime}>of {formatTime(totalSeconds)}</span>
          </div>
        </div>

        <div className={styles.adjustButtons}>
          <button
            className={styles.adjustButton}
            onClick={onReduceTime}
            disabled={remainingSeconds <= 15}
            aria-label="Reduce 15 seconds"
          >
            -15s
          </button>

          {isRunning ? (
            <button className={styles.pauseButton} onClick={onPause} aria-label="Pause timer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            </button>
          ) : (
            <button className={styles.pauseButton} onClick={onResume} aria-label="Resume timer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </button>
          )}

          <button className={styles.adjustButton} onClick={onAddTime} aria-label="Add 15 seconds">
            +15s
          </button>
        </div>

        <button className={styles.skipButton} onClick={onSkip}>
          Skip Rest
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5,4 15,12 5,20" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>
      </div>
    </div>
  );
}
