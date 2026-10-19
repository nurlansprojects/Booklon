import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from '../locales/en/translation.json';
import uzTranslation from '../locales/uz/translation.json';
import ruTranslation from '../locales/ru/translation.json';

const savedLang = typeof window !== 'undefined' ? localStorage.getItem('booklon-language') : null;
const initialLanguage = savedLang === 'uz' || savedLang === 'ru' || savedLang === 'en' ? savedLang : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      uz: { translation: uzTranslation },
      ru: { translation: ruTranslation },
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
