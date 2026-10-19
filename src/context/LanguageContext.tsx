import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from '../lib/i18n';
import { Language } from '../types';

export interface LanguageOption {
  code: Language;
  nativeName: string;
  flagLabel: string;
  localeTag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', nativeName: 'English', flagLabel: 'EN', localeTag: 'en-US' },
  { code: 'uz', nativeName: 'O‘zbekcha', flagLabel: 'UZ', localeTag: 'uz-UZ' },
  { code: 'ru', nativeName: 'Русский', flagLabel: 'RU', localeTag: 'ru-RU' },
];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  formatDate: (date: string | Date | number, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (num: number) => string;
  formatDuration: (seconds: number) => string;
  formatDays: (count: number) => string;
  formatBooks: (count: number) => string;
  formatPages: (count: number) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  formatDate: () => '',
  formatNumber: (n) => String(n),
  formatDuration: (s) => `${Math.floor(s / 60)}m`,
  formatDays: (c) => `${c} days`,
  formatBooks: (c) => `${c} books`,
  formatPages: (c) => `${c} pages`,
});

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  userLanguage?: Language;
  onLanguageChange?: (lang: Language) => Promise<void>;
}> = ({ children, userLanguage, onLanguageChange }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (userLanguage && (userLanguage === 'en' || userLanguage === 'uz' || userLanguage === 'ru')) {
      return userLanguage;
    }
    const saved = localStorage.getItem('booklon-language');
    if (saved === 'uz' || saved === 'ru' || saved === 'en') {
      return saved;
    }
    return 'en';
  });

  // Keep in sync with user profile preference if user logs in
  useEffect(() => {
    if (userLanguage && userLanguage !== language && (userLanguage === 'en' || userLanguage === 'uz' || userLanguage === 'ru')) {
      setLanguageState(userLanguage);
      i18n.changeLanguage(userLanguage);
      localStorage.setItem('booklon-language', userLanguage);
    }
  }, [userLanguage]);

  const handleSetLanguage = async (newLang: Language) => {
    setLanguageState(newLang);
    await i18n.changeLanguage(newLang);
    localStorage.setItem('booklon-language', newLang);

    if (onLanguageChange) {
      try {
        await onLanguageChange(newLang);
      } catch (err) {
        console.warn('Could not sync language to user profile:', err);
      }
    }
  };

  const getLocaleTag = (lang: Language): string => {
    if (lang === 'uz') return 'uz-UZ';
    if (lang === 'ru') return 'ru-RU';
    return 'en-US';
  };

  const formatDate = (dateInput: string | Date | number, options?: Intl.DateTimeFormatOptions): string => {
    try {
      const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
      if (isNaN(d.getTime())) return String(dateInput);
      const tag = getLocaleTag(language);
      const defaultOptions: Intl.DateTimeFormatOptions = options || {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
      return new Intl.DateTimeFormat(tag, defaultOptions).format(d);
    } catch {
      return String(dateInput);
    }
  };

  const formatNumber = (num: number): string => {
    try {
      const tag = getLocaleTag(language);
      return new Intl.NumberFormat(tag).format(num);
    } catch {
      return String(num);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (language === 'uz') {
      return `${mins} daq ${secs} son`;
    }
    if (language === 'ru') {
      return `${mins}м ${secs}с`;
    }
    return `${mins}m ${secs}s`;
  };

  const formatDays = (count: number): string => {
    if (language === 'uz') {
      return `${count} kun`;
    }
    if (language === 'ru') {
      const mod10 = count % 10;
      const mod100 = count % 100;
      if (mod10 === 1 && mod100 !== 11) return `${count} день`;
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${count} дня`;
      return `${count} дней`;
    }
    return count === 1 ? '1 day' : `${count} days`;
  };

  const formatBooks = (count: number): string => {
    if (language === 'uz') {
      return `${count} ta kitob`;
    }
    if (language === 'ru') {
      const mod10 = count % 10;
      const mod100 = count % 100;
      if (mod10 === 1 && mod100 !== 11) return `${count} книга`;
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${count} книги`;
      return `${count} книг`;
    }
    return count === 1 ? '1 book' : `${count} books`;
  };

  const formatPages = (count: number): string => {
    if (language === 'uz') {
      return `${count} sahifa`;
    }
    if (language === 'ru') {
      const mod10 = count % 10;
      const mod100 = count % 100;
      if (mod10 === 1 && mod100 !== 11) return `${count} страница`;
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${count} страницы`;
      return `${count} страниц`;
    }
    return count === 1 ? '1 page' : `${count} pages`;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        formatDate,
        formatNumber,
        formatDuration,
        formatDays,
        formatBooks,
        formatPages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
