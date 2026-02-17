import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import en from './locales/en.json';
import tr from './locales/tr.json';
import { GameStorage } from '../services/GameStorage';

const deviceLanguage = getLocales()[0]?.languageCode ?? 'en';
const supportedLanguage = deviceLanguage === 'tr' ? 'tr' : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    tr: { translation: tr },
  },
  lng: supportedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// Override with saved preference (async)
GameStorage.getLanguage().then(saved => {
  if (saved) {
    i18n.changeLanguage(saved);
  }
});

export default i18n;
