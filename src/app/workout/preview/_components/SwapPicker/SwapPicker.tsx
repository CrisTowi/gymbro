'use client';

import { Exercise, type Locale } from '@/types';
import { getExerciseLocalized } from '@/data/exercises';
import styles from '../../page.module.css';

export default function SwapPicker({
  alternatives,
  locale,
  onSelect,
  onClose,
  t,
}: {
  alternatives: Exercise[];
  locale: Locale;
  onSelect: (exerciseId: string) => void;
  onClose: () => void;
  t: (key: string) => string;
}) {
  if (alternatives.length === 0) {
    return (
      <div className={styles.swapPicker}>
        <div className={styles.swapPickerHeader}>
          <span className={styles.swapPickerTitle}>{t('noAlternatives')}</span>
          <button className={styles.swapPickerClose} onClick={onClose} aria-label={t('close')}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.swapPicker}>
      <div className={styles.swapPickerHeader}>
        <span className={styles.swapPickerTitle}>{t('swapWithAlternative')}</span>
        <button className={styles.swapPickerClose} onClick={onClose} aria-label={t('close')}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className={styles.swapPickerList}>
        {alternatives.map((alt) => (
          <button key={alt.id} className={styles.swapOption} onClick={() => onSelect(alt.id)}>
            <div className={styles.swapOptionInfo}>
              <span className={styles.swapOptionName}>
                {getExerciseLocalized(alt, locale).name}
              </span>
              <span className={styles.swapOptionMeta}>
                {alt.equipment}
                {alt.referenceUrl && (
                  <>
                    {' · '}
                    <a
                      href={alt.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.swapOptionLink}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t('howTo')}
                    </a>
                  </>
                )}
              </span>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
