'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { updateMe } from '@/lib/api';
import styles from './page.module.css';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { locale, setLocale } = useLocale();
  const t = useTranslations('profile');
  const tSettings = useTranslations('settings');
  const tAuth = useTranslations('auth');

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editHeight, setEditHeight] = useState<string>(
    user?.height != null ? String(user.height) : ''
  );
  const [editWeight, setEditWeight] = useState<string>(
    user?.weight != null ? String(user.weight) : ''
  );
  const [editGoal, setEditGoal] = useState<string>(user?.goal ?? '');

  const startEditing = () => {
    setEditHeight(user?.height != null ? String(user.height) : '');
    setEditWeight(user?.weight != null ? String(user.weight) : '');
    setEditGoal(user?.goal ?? '');
    setIsEditing(true);
    setSaved(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditHeight(user?.height != null ? String(user.height) : '');
    setEditWeight(user?.weight != null ? String(user.weight) : '');
    setEditGoal(user?.goal ?? '');
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const heightNum = editHeight.trim() === '' ? null : Number(editHeight.trim());
      const weightNum = editWeight.trim() === '' ? null : Number(editWeight.trim());
      const goalVal = editGoal.trim() === '' ? null : editGoal.trim();
      await updateMe({
        height: heightNum ?? undefined,
        weight: weightNum ?? undefined,
        goal: goalVal ?? undefined,
      });
      await refreshUser();
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

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
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('yourInfo')}</h2>
            {!isEditing ? (
              <button
                type="button"
                className={styles.editButton}
                onClick={startEditing}
              >
                {t('editInfo')}
              </button>
            ) : null}
          </div>
          <div className={styles.card}>
            <div className={styles.row}>
              <span className={styles.label}>{tAuth('name')}</span>
              <span className={styles.value}>{user.name}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>{tAuth('email')}</span>
              <span className={styles.value}>{user.email}</span>
            </div>
            {!isEditing ? (
              <>
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
                {(user.goal != null && user.goal !== '') && (
                  <div className={styles.row}>
                    <span className={styles.label}>{t('goal')}</span>
                    <span className={styles.value}>{user.goal}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={styles.editRow}>
                  <label className={styles.label} htmlFor="profile-height">
                    {t('height')} (cm)
                  </label>
                  <input
                    id="profile-height"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    placeholder={t('heightPlaceholder')}
                    className={styles.input}
                    value={editHeight}
                    onChange={(e) => setEditHeight(e.target.value)}
                  />
                </div>
                <div className={styles.editRow}>
                  <label className={styles.label} htmlFor="profile-weight">
                    {t('weight')} (kg)
                  </label>
                  <input
                    id="profile-weight"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    placeholder={t('weightPlaceholder')}
                    className={styles.input}
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                  />
                </div>
                <div className={styles.editRow}>
                  <label className={styles.label} htmlFor="profile-goal">
                    {t('goal')}
                  </label>
                  <input
                    id="profile-goal"
                    type="text"
                    placeholder={t('goalPlaceholder')}
                    className={styles.input}
                    value={editGoal}
                    onChange={(e) => setEditGoal(e.target.value)}
                  />
                </div>
                <div className={styles.editActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={cancelEditing}
                    disabled={saving}
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="button"
                    className={styles.saveButton}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? t('saving') : saved ? t('saved') : t('save')}
                  </button>
                </div>
              </>
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
