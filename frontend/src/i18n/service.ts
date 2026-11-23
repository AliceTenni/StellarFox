/**
 * i18n Service — Language, locale, date/time/currency formatting
 */

import { Language, Currency, LANGUAGES, DEFAULT_LANGUAGE, CURRENCY_SYMBOLS } from './config';
import { translations, TranslationKey } from './translations';

export class i18nService {
  private static currentLanguage: Language = DEFAULT_LANGUAGE;
  private static currentCurrency: Currency = 'USD';

  /**
   * Initialize i18n with language preference from localStorage or backend
   */
  static async initialize() {
    if (typeof window === 'undefined') return;

    // Try to load from localStorage
    const saved = localStorage.getItem('language') as Language | null;
    if (saved && Object.keys(translations).includes(saved)) {
      this.currentLanguage = saved;
    }

    // Apply RTL if needed
    this.applyRTL();
  }

  /**
   * Set current language
   */
  static setLanguage(language: Language) {
    if (!Object.keys(translations).includes(language)) {
      console.warn(`Language ${language} not supported`);
      return;
    }

    this.currentLanguage = language;

    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
      this.applyRTL();
    }

    // Dispatch event for listeners
    window.dispatchEvent(
      new CustomEvent('languageChanged', { detail: { language } })
    );
  }

  /**
   * Get current language
   */
  static getLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * Set current currency
   */
  static setCurrency(currency: Currency) {
    this.currentCurrency = currency;

    if (typeof window !== 'undefined') {
      localStorage.setItem('currency', currency);
    }

    window.dispatchEvent(
      new CustomEvent('currencyChanged', { detail: { currency } })
    );
  }

  /**
   * Get current currency
   */
  static getCurrency(): Currency {
    return this.currentCurrency;
  }

  /**
   * Translate a key
   */
  static t(key: TranslationKey, defaultValue?: string): string {
    const langTranslations = translations[this.currentLanguage];
    const value = langTranslations[key as keyof typeof langTranslations];
    return (value as string) || defaultValue || key;
  }

  /**
   * Get language info
   */
  static getLanguageInfo() {
    return LANGUAGES[this.currentLanguage];
  }

  /**
   * Check if current language is RTL
   */
  static isRTL(): boolean {
    return LANGUAGES[this.currentLanguage].dir === 'rtl';
  }

  /**
   * Apply RTL to document
   */
  private static applyRTL() {
    if (typeof document === 'undefined') return;
    const isRtl = this.isRTL();
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = LANGUAGES[this.currentLanguage].code;
    document.documentElement.setAttribute(
      'data-rtl',
      isRtl ? 'true' : 'false'
    );
  }

  /**
   * Format date according to current language
   */
  static formatDate(date: Date | string, format?: 'short' | 'long' | 'full'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const lang = LANGUAGES[this.currentLanguage];

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: format === 'short' ? '2-digit' : 'long',
      day: '2-digit',
    };

    return d.toLocaleDateString(lang.code, options);
  }

  /**
   * Format time according to current language
   */
  static formatTime(date: Date | string, format?: 'short' | 'long'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const lang = LANGUAGES[this.currentLanguage];

    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: format === 'long' ? '2-digit' : undefined,
    };

    return d.toLocaleTimeString(lang.code, options);
  }

  /**
   * Format date and time
   */
  static formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const lang = LANGUAGES[this.currentLanguage];

    return d.toLocaleString(lang.code, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  static formatRelativeTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    const lang = LANGUAGES[this.currentLanguage];

    if (diffSecs < 60) {
      return new Intl.RelativeTimeFormat(lang.code).format(-diffSecs, 'second');
    } else if (diffMins < 60) {
      return new Intl.RelativeTimeFormat(lang.code).format(-diffMins, 'minute');
    } else if (diffHours < 24) {
      return new Intl.RelativeTimeFormat(lang.code).format(-diffHours, 'hour');
    } else {
      return new Intl.RelativeTimeFormat(lang.code).format(-diffDays, 'day');
    }
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number, currency?: Currency): string {
    const curr = currency || this.currentCurrency;
    const lang = LANGUAGES[this.currentLanguage];

    return new Intl.NumberFormat(lang.code, {
      style: 'currency',
      currency: curr === 'XLM' ? 'USD' : curr,
      minimumFractionDigits: curr === 'JPY' ? 0 : 2,
      maximumFractionDigits: curr === 'JPY' ? 0 : 8, // For XLM/crypto
    }).format(amount);
  }

  /**
   * Format number according to language
   */
  static formatNumber(num: number, decimals = 2): string {
    const lang = LANGUAGES[this.currentLanguage];

    return new Intl.NumberFormat(lang.code, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  }

  /**
   * Format percentage
   */
  static formatPercent(num: number, decimals = 2): string {
    const lang = LANGUAGES[this.currentLanguage];

    return new Intl.NumberFormat(lang.code, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num / 100);
  }
}
