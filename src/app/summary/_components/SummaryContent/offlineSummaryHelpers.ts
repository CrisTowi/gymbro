import { SessionLog } from '@/types';
import { getSessions, getPersonalRecords } from '@/utils/storage';
import { PersonalRecords } from '@/lib/api';

export function getOfflineSessionById(sessionId: string): SessionLog | null {
  const sessions = getSessions();
  return sessions.find((session) => session.id === sessionId) ?? null;
}

export function getLocalPersonalRecords(): PersonalRecords {
  return getPersonalRecords();
}
