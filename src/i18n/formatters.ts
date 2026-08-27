import { Language, TranslationInterpolationValues } from './types';

/**
 * Replace placeholder variables in a translation string.
 * Supports syntax: `{{variable}}` and `{variable}`
 * 
 * Example: `interpolate('Hello, {{name}}!', { name: 'Aartha' })` -> `'Hello, Aartha!'`
 */
export function interpolate(template: string, values?: TranslationInterpolationValues): string {
  if (!values || !template) return template;

  return template.replace(/\{\{\s*(\w+)\s*\}\}|\{\s*(\w+)\s*\}/g, (match, p1, p2) => {
    const key = p1 || p2;
    const value = values[key];
    return value !== undefined && value !== null ? String(value) : match;
  });
}

/**
 * Format currency according to locale standards using the ECMAScript Internationalization API.
 */
export function formatCurrency(
  amount: number,
  currency: string = 'INR',
  lang: Language = 'en'
): string {
  const localeMap: Record<Language, string> = {
    en: 'en-IN',
    gu: 'gu-IN',
    hi: 'hi-IN',
    de: 'de-DE',
    es: 'es-ES',
    fr: 'fr-FR',
    ar: 'ar-AE',
    zh: 'zh-CN',
    ja: 'ja-JP',
    ru: 'ru-RU',
  };

  try {
    return new Intl.NumberFormat(localeMap[lang] || 'en-IN', {
      style: 'currency',
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

/**
 * Format numbers with localized separators.
 */
export function formatNumber(value: number, lang: Language = 'en'): string {
  const localeMap: Record<Language, string> = {
    en: 'en-US',
    gu: 'gu-IN',
    hi: 'hi-IN',
    de: 'de-DE',
    es: 'es-ES',
    fr: 'fr-FR',
    ar: 'ar-AE',
    zh: 'zh-CN',
    ja: 'ja-JP',
    ru: 'ru-RU',
  };

  try {
    return new Intl.NumberFormat(localeMap[lang] || 'en-US').format(value);
  } catch {
    return String(value);
  }
}

/**
 * Format dates with localized date formatting.
 */
export function formatDate(
  dateInput: string | number | Date,
  lang: Language = 'en',
  options?: Intl.DateTimeFormatOptions
): string {
  const localeMap: Record<Language, string> = {
    en: 'en-US',
    gu: 'gu-IN',
    hi: 'hi-IN',
    de: 'de-DE',
    es: 'es-ES',
    fr: 'fr-FR',
    ar: 'ar-AE',
    zh: 'zh-CN',
    ja: 'ja-JP',
    ru: 'ru-RU',
  };

  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
    return new Intl.DateTimeFormat(localeMap[lang] || 'en-US', options || {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return String(dateInput);
  }
}
