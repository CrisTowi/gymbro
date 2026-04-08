'use client';

import { useState } from 'react';
import { Exercise, type Locale } from '@/types';
import { getExerciseLocalized } from '@/data/exercises';
import { filterAlternatives, groupByCategory } from './helpers';
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
  const [search, setSearch] = useState('');

  if (alternatives.length === 0) {
    return (
      <div className={styles.swapPicker}>
        <div className={styles.swapPickerHeader}>
          <span className={styles.swapPickerTitle}>{t('noAlternatives')}</span>
          <button
            type="button"
            className={styles.swapPickerClose}
            onClick={onClose}
            aria-label={t('close')}
          >
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

  const filtered = filterAlternatives(alternatives, search, locale);
  const grouped = groupByCategory(filtered);

  return (
    <div className={styles.swapPicker}>
      <div className={styles.swapPickerHeader}>
        <span className={styles.swapPickerTitle}>{t('replaceWithAlternative')}</span>
        <button
          type="button"
          className={styles.swapPickerClose}
          onClick={onClose}
          aria-label={t('close')}
        >
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
      <div className={styles.swapPickerSearch}>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('searchPlaceholder')}
          className={styles.swapPickerSearchInput}
          autoComplete="off"
        />
      </div>
      <div className={styles.swapPickerList}>
        {filtered.length === 0 ? (
          <div className={styles.swapPickerEmpty}>{t('noAlternatives')}</div>
        ) : (
          Object.entries(grouped).map(([category, exercises]) => (
            <div key={category}>
              <div className={styles.swapPickerGroup}>{category}</div>
              {exercises.map((alt) => (
                <button
                  key={alt.id}
                  type="button"
                  className={styles.swapOption}
                  onClick={() => onSelect(alt.id)}
                >
                  <div className={styles.swapOptionInfo}>
                    <span className={styles.swapOptionName}>
                      {getExerciseLocalized(alt, locale).name}
                    </span>
                    <span className={styles.swapOptionMeta}>
                      {alt.category} · {alt.equipment}
                      {alt.referenceUrl && (
                        <>
                          {' · '}
                          <a
                            href={alt.referenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.swapOptionLink}
                            onClick={(event) => event.stopPropagation()}
                          >
                            {t('howToPerform')}
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
          ))
        )}
      </div>
    </div>
  );
}
