'use client';

import { useTranslations } from 'next-intl';
import { useNetworkStatusContext } from '@/context/NetworkStatusContext';
import styles from './OfflineStatusBanner.module.css';

export default function OfflineStatusBanner() {
  const t = useTranslations('offlineStatus');
  const { isOnline, pendingSyncCount, isSyncing } = useNetworkStatusContext();

  const isVisible = !isOnline || isSyncing || pendingSyncCount > 0;
  if (!isVisible) return null;

  return (
    <div className={`${styles.banner} ${isSyncing ? styles.syncing : styles.offline}`}>
      {isSyncing
        ? t('syncing', { count: pendingSyncCount })
        : !isOnline
          ? pendingSyncCount > 0
            ? `${t('youAreOffline')} · ${t('pendingSync', { count: pendingSyncCount })}`
            : t('youAreOffline')
          : t('pendingSync', { count: pendingSyncCount })}
    </div>
  );
}
