'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { updateMe } from '@/lib/api';
import type { Locale } from '@/types';

export type { Locale };

function normalizeLocale(lang: string | null | undefined): Locale {
  if (lang === 'es' || lang === 'en') return lang;
  if (typeof lang === 'string' && lang.toLowerCase().startsWith('es')) return 'es';
  return 'en';
}

import en from '../../messages/en.json';
import es from '../../messages/es.json';

const messagesMap: Record<Locale, Record<string, unknown>> = { en, es };

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => Promise<void>;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { user, token, refreshUser } = useAuth();
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  // Source of truth: user profile in DB when logged in, then browser language, then default.
  const resolvedLocale =
    (user?.language ? normalizeLocale(user.language) : null) ??
    (typeof window !== 'undefined' ? normalizeLocale(navigator.language) : null) ??
    'en';

  useEffect(() => {
    setLocaleState(resolvedLocale);
    setMounted(true);
  }, [resolvedLocale]);

  const setLocale = useCallback(
    async (next: Locale) => {
      setLocaleState(next);
      if (token) {
        try {
          await updateMe({ language: next });
          await refreshUser();
        } catch {
          // Revert to current resolved locale on failure
          setLocaleState(resolvedLocale);
        }
      }
    },
    [token, refreshUser, resolvedLocale]
  );

  const value: LocaleContextValue = { locale: mounted ? locale : resolvedLocale, setLocale };
  const currentLocale = value.locale;
  const messages = messagesMap[currentLocale] ?? messagesMap.en;

  return (
    <LocaleContext.Provider value={value}>
      <NextIntlClientProvider locale={currentLocale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
