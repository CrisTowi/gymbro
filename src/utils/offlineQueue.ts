import { SessionLog } from '@/types';

const OFFLINE_QUEUE_KEY = 'gymbro_offline_queue';
const OFFLINE_SESSION_QUEUED_EVENT = 'gymbro:offline-session-queued';

export interface OfflineSessionQueueEntry {
  sessionId: string;
  session: SessionLog;
  queuedAt: string;
  syncAttempts: number;
  lastSyncError: string | null;
}

function readQueue(): OfflineSessionQueueEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? (JSON.parse(raw) as OfflineSessionQueueEntry[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: OfflineSessionQueueEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to write offline queue', error);
  }
}

export function getOfflineQueue(): OfflineSessionQueueEntry[] {
  return readQueue();
}

export function addToOfflineQueue(session: SessionLog): void {
  const queue = readQueue();
  const alreadyQueued = queue.some((entry) => entry.sessionId === session.id);
  if (alreadyQueued) return;

  const entry: OfflineSessionQueueEntry = {
    sessionId: session.id,
    session,
    queuedAt: new Date().toISOString(),
    syncAttempts: 0,
    lastSyncError: null,
  };
  queue.push(entry);
  writeQueue(queue);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OFFLINE_SESSION_QUEUED_EVENT));
  }
}

export function removeFromOfflineQueue(sessionId: string): void {
  const queue = readQueue().filter((entry) => entry.sessionId !== sessionId);
  writeQueue(queue);
}

export function incrementSyncAttempts(sessionId: string, error: string): void {
  const queue = readQueue().map((entry) => {
    if (entry.sessionId !== sessionId) return entry;
    return {
      ...entry,
      syncAttempts: entry.syncAttempts + 1,
      lastSyncError: error,
    };
  });
  writeQueue(queue);
}

export function clearOfflineQueue(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

export { OFFLINE_SESSION_QUEUED_EVENT };
