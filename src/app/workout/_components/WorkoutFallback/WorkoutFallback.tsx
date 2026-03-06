'use client';

import { useTranslations } from 'next-intl';
import styles from '../../page.module.css';

export default function WorkoutFallback() {
  const t = useTranslations('workout');
  return (
    <div className={styles.page}>
      <div className={styles.loading}>{t('loadingWorkout')}</div>
    </div>
  );
}
