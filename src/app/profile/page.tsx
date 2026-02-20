'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import styles from './page.module.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const { locale, setLocale } = useLocale();
  const t = useTranslations('profile');
  const tSettings = useTranslations('settings');
  const tAuth = useTranslations('auth');

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.subtitle}>{t('subtitle')}</p>
        </div>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('yourInfo')}</h2>
          <div className={styles.card}>
            <div className={styles.row}>
              <span className={styles.label}>{tAuth('name')}</span>
              <span className={styles.value}>{user.name}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>{tAuth('email')}</span>
              <span className={styles.value}>{user.email}</span>
            </div>
            {user.height != null && (
              <div className={styles.row}>
                <span className={styles.label}>{t('height')}</span>
                <span className={styles.value}>{user.height} cm</span>
              </div>
            )}
            {user.weight != null && (
              <div className={styles.row}>
                <span className={styles.label}>{t('weight')}</span>
                <span className={styles.value}>{user.weight} kg</span>
              </div>
            )}
            {user.goal != null && user.goal !== '' && (
              <div className={styles.row}>
                <span className={styles.label}>{t('goal')}</span>
                <span className={styles.value}>{user.goal}</span>
              </div>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{tSettings('language')}</h2>
          <div className={styles.card}>
            <p className={styles.languageHint}>{t('languageHint')}</p>
            <div className={styles.localeSwitch}>
              <button
                type="button"
                className={`${styles.localeBtn} ${locale === 'en' ? styles.localeActive : ''}`}
                onClick={() => setLocale('en')}
                aria-label={tSettings('english')}
              >
                {tSettings('english')}
              </button>
              <button
                type="button"
                className={`${styles.localeBtn} ${locale === 'es' ? styles.localeActive : ''}`}
                onClick={() => setLocale('es')}
                aria-label={tSettings('spanish')}
              >
                {tSettings('spanish')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
