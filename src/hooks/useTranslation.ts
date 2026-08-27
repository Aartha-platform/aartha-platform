'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Language,
  LanguageMetadata,
  TranslationInterpolationValues,
} from '@/i18n/types';
import {
  locales,
  TranslationKey,
} from '@/i18n/locales';
import {
  DEFAULT_LANGUAGE,
  STORAGE_KEY,
  EVENT_KEY,
  SUPPORTED_LANGUAGES,
  LANGUAGE_MAP,
  detectInitialLanguage,
  syncDocumentDirection,
  syncGoogleTranslateCookie,
} from '@/i18n/config';
import {
  interpolate,
  formatCurrency,
  formatNumber,
  formatDate,
} from '@/i18n/formatters';

export type { Language, LanguageMetadata, TranslationKey };

export function useTranslation() {
  const [lang, setLangState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Initialize language on client mount
  useEffect(() => {
    setIsMounted(true);
    const initialLang = detectInitialLanguage();
    setLangState(initialLang);
    syncDocumentDirection(initialLang);
    syncGoogleTranslateCookie(initialLang);
  }, []);

  // Update language across all subscribers and storage
  const setLang = useCallback((newLang: Language) => {
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      // Also write cookie for SSR / middleware compatibility if needed
      document.cookie = `${STORAGE_KEY}=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignore in private browsing / sandboxes
    }

    setLangState(newLang);
    syncDocumentDirection(newLang);
    syncGoogleTranslateCookie(newLang);

    // Dispatch global event for instant React tree re-renders and Google Translate bridge
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: newLang }));
    }
  }, []);

  // Listen to cross-component or cross-tab language changes
  useEffect(() => {
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<Language>;
      if (customEvent.detail && customEvent.detail !== lang) {
        setLangState(customEvent.detail);
        syncDocumentDirection(customEvent.detail);
      }
    };

    window.addEventListener(EVENT_KEY, handleLangChange);
    return () => {
      window.removeEventListener(EVENT_KEY, handleLangChange);
    };
  }, [lang]);

  /**
   * Translate a key with optional dynamic variable interpolation.
   * 
   * Fallback chain: Selected Language -> English Default -> Raw Key String.
   */
  const t = useCallback(
    (key: TranslationKey, values?: TranslationInterpolationValues): string => {
      const activeDict = locales[lang] || locales[DEFAULT_LANGUAGE];
      const template = activeDict[key] || locales[DEFAULT_LANGUAGE][key] || String(key);
      return values ? interpolate(template, values) : template;
    },
    [lang]
  );

  const currentLanguage: LanguageMetadata = useMemo(() => {
    return LANGUAGE_MAP.get(lang) || SUPPORTED_LANGUAGES[0];
  }, [lang]);

  const isRTL = currentLanguage.dir === 'rtl';

  return {
    lang,
    setLang,
    t,
    isMounted,
    currentLanguage,
    isRTL,
    supportedLanguages: SUPPORTED_LANGUAGES,
    formatCurrency: (amount: number, currency?: string) =>
      formatCurrency(amount, currency || currentLanguage.currencyCode, lang),
    formatNumber: (value: number) => formatNumber(value, lang),
    formatDate: (date: string | number | Date, options?: Intl.DateTimeFormatOptions) =>
      formatDate(date, lang, options),
  };
}
