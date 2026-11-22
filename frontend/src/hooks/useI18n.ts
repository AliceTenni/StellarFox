/**
 * useI18n — React hook for internationalization
 * - Provides translation, formatting functions
 * - Triggers re-render on language change
 */

import { useEffect, useState, useCallback } from 'react';
import { i18nService } from '../i18n/service';
import { Language, Currency } from '../i18n/config';
import { TranslationKey } from '../i18n/translations';

export function useI18n() {
  const [language, setLanguage] = useState<Language>(() => i18nService.getLanguage());
  const [currency, setCurrency] = useState<Currency>(() => i18nService.getCurrency());
  const [, setRerender] = useState({});

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (e: any) => {
      setLanguage(e.detail.language);
      setRerender({});
    };

    const handleCurrencyChange = (e: any) => {
      setCurrency(e.detail.currency);
      setRerender({});
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    window.addEventListener('currencyChanged', handleCurrencyChange);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
      window.removeEventListener('currencyChanged', handleCurrencyChange);
    };
  }, []);

  const t = useCallback((key: TranslationKey, defaultValue?: string) => {
    return i18nService.t(key, defaultValue);
  }, []);

  const changeLanguage = useCallback((lang: Language) => {
    i18nService.setLanguage(lang);
  }, []);

  const changeCurrency = useCallback((curr: Currency) => {
    i18nService.setCurrency(curr);
  }, []);

  return {
    language,
    currency,
    t,
    changeLanguage,
    changeCurrency,
    isRTL: i18nService.isRTL(),
    formatDate: i18nService.formatDate.bind(i18nService),
    formatTime: i18nService.formatTime.bind(i18nService),
    formatDateTime: i18nService.formatDateTime.bind(i18nService),
    formatRelativeTime: i18nService.formatRelativeTime.bind(i18nService),
    formatCurrency: i18nService.formatCurrency.bind(i18nService),
    formatNumber: i18nService.formatNumber.bind(i18nService),
    formatPercent: i18nService.formatPercent.bind(i18nService),
  };
}

/**
 * useTranslate — Shorter alias for just getting t function
 */
export function useTranslate() {
  const { t } = useI18n();
  return t;
}

/**
 * useDateFormatting — Utilities for date/time formatting
 */
export function useDateFormatting() {
  return {
    formatDate: i18nService.formatDate.bind(i18nService),
    formatTime: i18nService.formatTime.bind(i18nService),
    formatDateTime: i18nService.formatDateTime.bind(i18nService),
    formatRelativeTime: i18nService.formatRelativeTime.bind(i18nService),
  };
}

/**
 * useCurrencyFormatting — Utilities for currency formatting
 */
export function useCurrencyFormatting() {
  return {
    formatCurrency: i18nService.formatCurrency.bind(i18nService),
    formatNumber: i18nService.formatNumber.bind(i18nService),
    formatPercent: i18nService.formatPercent.bind(i18nService),
  };
}

/**
 * useNumberFormatting — Utilities for number formatting
 */
export function useNumberFormatting() {
  return {
    formatNumber: i18nService.formatNumber.bind(i18nService),
    formatPercent: i18nService.formatPercent.bind(i18nService),
  };
}
