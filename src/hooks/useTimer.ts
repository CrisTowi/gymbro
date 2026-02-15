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
  const onCompleteRef = useRef(onComplete);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  onCompleteRef.current = onComplete;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearTimer();
            setIsRunning(false);
            onCompleteRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return clearTimer;
  }, [isRunning, clearTimer]);

  const start = useCallback(
    (seconds: number) => {
      clearTimer();
      setTotalSeconds(seconds);
      setRemainingSeconds(seconds);
      setIsRunning(true);
    },
    [clearTimer]
  );

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (remainingSeconds > 0) {
      setIsRunning(true);
    }
  }, [remainingSeconds]);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setRemainingSeconds(0);
    setTotalSeconds(0);
  }, [clearTimer]);

  const addTime = useCallback((seconds: number) => {
    setRemainingSeconds((prev) => prev + seconds);
    setTotalSeconds((prev) => prev + seconds);
  }, []);

  const reduceTime = useCallback((seconds: number) => {
    setRemainingSeconds((prev) => Math.max(0, prev - seconds));
  }, []);

  const progress =
    totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;

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
