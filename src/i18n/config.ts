import { Language, LanguageMetadata } from './types';
import { locales } from './locales';

export const DEFAULT_LANGUAGE: Language = 'en';
export const STORAGE_KEY = 'artha-lang';
export const EVENT_KEY = 'artha-lang-changed';

export const SUPPORTED_LANGUAGES: LanguageMetadata[] = [
  // Global Trade Languages
  {
    code: 'en',
    name: 'English',
    nativeName: 'English (US/UK)',
    flag: '🌐',
    dir: 'ltr',
    region: 'Global Trade Hub',
    category: 'global',
    currencyCode: 'USD',
    currencySymbol: '$',
    googleCode: 'en',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    dir: 'ltr',
    region: 'Europe (DACH)',
    category: 'global',
    currencyCode: 'EUR',
    currencySymbol: '€',
    googleCode: 'de',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    dir: 'ltr',
    region: 'Latin America & Spain',
    category: 'global',
    currencyCode: 'USD',
    currencySymbol: '$',
    googleCode: 'es',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    dir: 'ltr',
    region: 'Europe & Francophone',
    category: 'global',
    currencyCode: 'EUR',
    currencySymbol: '€',
    googleCode: 'fr',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇦🇪',
    dir: 'rtl',
    region: 'Middle East & GCC',
    category: 'global',
    currencyCode: 'AED',
    currencySymbol: 'د.إ',
    googleCode: 'ar',
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文 (简体)',
    flag: '🇨🇳',
    dir: 'ltr',
    region: 'East Asia',
    category: 'global',
    currencyCode: 'CNY',
    currencySymbol: '¥',
    googleCode: 'zh-CN',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    dir: 'ltr',
    region: 'Japan',
    category: 'global',
    currencyCode: 'JPY',
    currencySymbol: '¥',
    googleCode: 'ja',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    dir: 'ltr',
    region: 'Eurasia & CIS',
    category: 'global',
    currencyCode: 'USD',
    currencySymbol: '$',
    googleCode: 'ru',
  },

  // Indian Regional Manufacturing Hubs
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳',
    dir: 'ltr',
    region: 'Gujarat Hub (GIDC)',
    category: 'regional',
    currencyCode: 'INR',
    currencySymbol: '₹',
    googleCode: 'gu',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    flag: '🇮🇳',
    dir: 'ltr',
    region: 'National India',
    category: 'regional',
    currencyCode: 'INR',
    currencySymbol: '₹',
    googleCode: 'hi',
  },
];

export const LANGUAGE_MAP = new Map<Language, LanguageMetadata>(
  SUPPORTED_LANGUAGES.map((meta) => [meta.code, meta])
);

/**
 * Validate whether a string is a recognized Language code.
 */
export function isSupportedLanguage(code: string | null | undefined): code is Language {
  if (!code) return false;
  return code in locales;
}

/**
 * Determine the initial language from localStorage or browser preferences.
 */
export function detectInitialLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isSupportedLanguage(saved)) {
      return saved;
    }

    // Try browser navigator.languages
    const browserLanguages = navigator.languages || [navigator.language];
    for (const rawLang of browserLanguages) {
      const shortCode = rawLang.split('-')[0].toLowerCase();
      if (isSupportedLanguage(shortCode)) {
        return shortCode;
      }
    }
  } catch {
    // Ignore storage/navigator access errors in restricted sandbox
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Synchronize document HTML element attributes (lang and dir) for accessibility and RTL support.
 */
export function syncDocumentDirection(lang: Language): void {
  if (typeof document === 'undefined') return;

  const metadata = LANGUAGE_MAP.get(lang);
  const dir = metadata?.dir || 'ltr';

  document.documentElement.lang = lang;
  document.documentElement.dir = dir;

  // Add a class to body for easy CSS targeting if needed
  if (dir === 'rtl') {
    document.documentElement.classList.add('rtl-layout');
  } else {
    document.documentElement.classList.remove('rtl-layout');
  }
}

/**
 * Synchronize Google Translate cookie for full DOM translation across pages.
 */
export function syncGoogleTranslateCookie(lang: Language): void {
  if (typeof document === 'undefined') return;

  const metadata = LANGUAGE_MAP.get(lang);
  const targetCode = metadata?.googleCode || lang;

  try {
    if (lang === 'en') {
      // Reset Google Translate cookie
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
      document.cookie = `googtrans=/en/en; path=/;`;
    } else {
      document.cookie = `googtrans=/auto/${targetCode}; path=/;`;
      document.cookie = `googtrans=/en/${targetCode}; path=/;`;
    }
  } catch {
    // Ignore cookie write errors
  }
}
