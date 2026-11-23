/**
 * i18n Configuration — Multi-language support with RTL
 * - Supported languages: English, Spanish, French, Arabic
 * - RTL support for Arabic
 * - Date, time, currency formatting
 */

export type Language = 'en' | 'es' | 'fr' | 'ar';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'XLM';

export interface LanguageConfig {
  name: string;
  nativeName: string;
  code: string;
  dir: 'ltr' | 'rtl';
  dateFormat: string;
  timeFormat: string;
  currencySymbol: string;
}

export const LANGUAGES: Record<Language, LanguageConfig> = {
  en: {
    name: 'English',
    nativeName: 'English',
    code: 'en-US',
    dir: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'HH:mm:ss',
    currencySymbol: '$',
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    code: 'es-ES',
    dir: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm:ss',
    currencySymbol: '€',
  },
  fr: {
    name: 'French',
    nativeName: 'Français',
    code: 'fr-FR',
    dir: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm:ss',
    currencySymbol: '€',
  },
  ar: {
    name: 'Arabic',
    nativeName: 'العربية',
    code: 'ar-SA',
    dir: 'rtl',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: 'HH:mm:ss',
    currencySymbol: 'ر.س',
  },
};

export const DEFAULT_LANGUAGE: Language = 'en';
export const DEFAULT_CURRENCY: Currency = 'USD';

export const CURRENCY_CODES: Record<Currency, string> = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  JPY: 'JPY',
  XLM: 'XLM',
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  XLM: '✦',
};
