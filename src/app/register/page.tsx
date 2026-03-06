'use client';

import { Suspense } from 'react';
import RegisterForm from './_components/RegisterForm/RegisterForm';
import styles from '../login/auth.module.css';

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <div className={styles.card}>
            <div className={styles.loadingSpinner} />
          </div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
