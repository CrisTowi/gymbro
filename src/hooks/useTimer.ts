'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerReturn {
  remainingSeconds: number;
  isRunning: boolean;
  totalSeconds: number;
  progress: number;
  start: (seconds: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  addTime: (seconds: number) => void;
  reduceTime: (seconds: number) => void;
}

export function useTimer(onComplete?: () => void): UseTimerReturn {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Absolute timestamp when the timer should finish
  const endTimeRef = useRef<number>(0);
  // How many seconds were remaining when paused (for resume)
  const pausedRemainingRef = useRef<number>(0);

  const onCompleteRef = useRef(onComplete);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    const remaining = Math.round((endTimeRef.current - now) / 1000);

    if (remaining <= 0) {
      clearTimer();
      setRemainingSeconds(0);
      setIsRunning(false);
      onCompleteRef.current?.();
    } else {
      setRemainingSeconds(remaining);
    }
  }, [clearTimer]);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      // Tick immediately to catch up after tab switch
      tick();
      intervalRef.current = setInterval(tick, 1000);
    }

    return clearTimer;
    // remainingSeconds intentionally omitted: including it would restart the interval on every tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, clearTimer, tick]);

  // Recalculate when the tab becomes visible again
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isRunning) {
        tick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isRunning, tick]);

  const start = useCallback(
    (seconds: number) => {
      clearTimer();
      endTimeRef.current = Date.now() + seconds * 1000;
      pausedRemainingRef.current = 0;
      setTotalSeconds(seconds);
      setRemainingSeconds(seconds);
      setIsRunning(true);
    },
    [clearTimer]
  );

  const pause = useCallback(() => {
    const now = Date.now();
    const remaining = Math.max(0, Math.round((endTimeRef.current - now) / 1000));
    pausedRemainingRef.current = remaining;
    clearTimer();
    setIsRunning(false);
    setRemainingSeconds(remaining);
  }, [clearTimer]);

  const resume = useCallback(() => {
    const remaining = pausedRemainingRef.current || remainingSeconds;
    if (remaining > 0) {
      endTimeRef.current = Date.now() + remaining * 1000;
      pausedRemainingRef.current = 0;
      setIsRunning(true);
    }
  }, [remainingSeconds]);

  const reset = useCallback(() => {
    clearTimer();
    endTimeRef.current = 0;
    pausedRemainingRef.current = 0;
    setIsRunning(false);
    setRemainingSeconds(0);
    setTotalSeconds(0);
  }, [clearTimer]);

  const addTime = useCallback((seconds: number) => {
    endTimeRef.current += seconds * 1000;
    setTotalSeconds((prev) => prev + seconds);
    setRemainingSeconds(Math.round((endTimeRef.current - Date.now()) / 1000));
  }, []);

  const reduceTime = useCallback((seconds: number) => {
    const now = Date.now();
    const newEnd = endTimeRef.current - seconds * 1000;
    if (newEnd <= now) {
      // Reducing would finish the timer
      endTimeRef.current = now;
      setRemainingSeconds(0);
    } else {
      endTimeRef.current = newEnd;
      setRemainingSeconds(Math.round((newEnd - now) / 1000));
    }
  }, []);

  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;

  return {
    remainingSeconds,
    isRunning,
    totalSeconds,
    progress,
    start,
    pause,
    resume,
    reset,
    addTime,
    reduceTime,
  };
}
