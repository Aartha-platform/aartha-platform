/**
 * Internationalization (i18n) Type Definitions for Aartha Enterprise Platform.
 */

export type Language = 
  | 'en' // English (Global Default)
  | 'gu' // Gujarati (Gujarat Manufacturing Hub)
  | 'hi' // Hindi (National India)
  | 'de' // German (European Industrial Hub)
  | 'es' // Spanish (Latin America & Europe)
  | 'fr' // French (Francophone Trade Corridor)
  | 'ar' // Arabic (Middle East / GCC Corridor, RTL)
  | 'zh' // Mandarin Chinese (East Asia & Supply Chain)
  | 'ja' // Japanese (High Precision & Technology)
  | 'ru'; // Russian (Eurasian Trade Corridor)

export type TextDirection = 'ltr' | 'rtl';

export interface LanguageMetadata {
  code: Language;
  name: string;
  nativeName: string;
  flag: string; // Emoji flag or code
  dir: TextDirection;
  region: string;
  category: 'global' | 'regional';
  currencyCode: string;
  currencySymbol: string;
  googleCode: string;
}

export type TranslationInterpolationValues = Record<string, string | number | boolean | undefined | null>;
