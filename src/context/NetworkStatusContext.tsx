'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import {
  getOfflineQueue,
  removeFromOfflineQueue,
  incrementSyncAttempts,
  OFFLINE_SESSION_QUEUED_EVENT,
} from '@/utils/offlineQueue';
import { syncOfflineSession } from '@/lib/api';

interface NetworkStatusContextValue {
  isOnline: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  triggerSync: () => Promise<void>;
}

const NetworkStatusContext = createContext<NetworkStatusContextValue | null>(null);

export function useNetworkStatusContext(): NetworkStatusContextValue {
  const context = useContext(NetworkStatusContext);
  if (!context) {
    throw new Error('useNetworkStatusContext must be used within NetworkStatusProvider');
  }
  return context;
}

function getQueueCount(): number {
  return getOfflineQueue().length;
}

export function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
  const isOnline = useNetworkStatus();
  // Start with 0 to match server-rendered HTML. The useEffect below syncs the real
  // localStorage value on the client after hydration to avoid a hydration mismatch.
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const wasOnlineRef = useRef(isOnline);
  const isSyncingRef = useRef(false);

  const refreshCount = useCallback(() => {
    setPendingSyncCount(getQueueCount());
  }, []);

  // Sync pendingSyncCount from localStorage after hydration
  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  const triggerSync = useCallback(async () => {
    if (isSyncingRef.current) return;

    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    isSyncingRef.current = true;
    setIsSyncing(true);

    for (const entry of queue) {
      try {
        await syncOfflineSession(entry.session);
        removeFromOfflineQueue(entry.sessionId);
        refreshCount();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        incrementSyncAttempts(entry.sessionId, errorMessage);
        console.error(`Failed to sync offline session ${entry.sessionId}:`, error);
      }
    }

    isSyncingRef.current = false;
    setIsSyncing(false);
    refreshCount();
  }, [refreshCount]);

  // Auto-sync when coming back online
  useEffect(() => {
    const wasOnline = wasOnlineRef.current;
    wasOnlineRef.current = isOnline;

    if (isOnline && !wasOnline) {
      void triggerSync();
    }
  }, [isOnline, triggerSync]);

  // Listen for new offline sessions queued from WorkoutContent
  useEffect(() => {
    function handleSessionQueued() {
      refreshCount();
    }

    window.addEventListener(OFFLINE_SESSION_QUEUED_EVENT, handleSessionQueued);
    return () => {
      window.removeEventListener(OFFLINE_SESSION_QUEUED_EVENT, handleSessionQueued);
    };
  }, [refreshCount]);

  return (
    <NetworkStatusContext.Provider value={{ isOnline, pendingSyncCount, isSyncing, triggerSync }}>
      {children}
    </NetworkStatusContext.Provider>
  );
}
