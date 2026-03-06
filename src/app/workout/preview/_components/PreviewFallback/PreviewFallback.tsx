'use client';

import { useTranslations } from 'next-intl';
import styles from '../../page.module.css';

export default function PreviewFallback() {
  const t = useTranslations('workoutPreview');
  return (
    <div className={styles.page}>
      <div className={styles.loading}>{t('loadingPreview')}</div>
    </div>
  );
}
