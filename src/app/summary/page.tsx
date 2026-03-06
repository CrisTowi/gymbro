'use client';

import { Suspense } from 'react';
import SummaryContent from './_components/SummaryContent/SummaryContent';
import styles from './page.module.css';

export default function SummaryPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <div className={styles.loading}>Loading summary...</div>
        </div>
      }
    >
      <SummaryContent />
    </Suspense>
  );
}
