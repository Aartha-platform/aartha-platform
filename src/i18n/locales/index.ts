import { Language } from '../types';
import { en, TranslationDictionary, TranslationKey } from './en';
import { gu } from './gu';
import { hi } from './hi';
import { de } from './de';
import { es } from './es';
import { fr } from './fr';
import { ar } from './ar';
import { zh } from './zh';
import { ja } from './ja';
import { ru } from './ru';

export const locales: Record<Language, TranslationDictionary> = {
  en,
  gu,
  hi,
  de,
  es,
  fr,
  ar,
  zh,
  ja,
  ru,
};

export { en, gu, hi, de, es, fr, ar, zh, ja, ru };
export type { TranslationDictionary, TranslationKey };
