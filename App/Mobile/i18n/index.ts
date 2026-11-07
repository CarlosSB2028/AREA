import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/en.json';
import fr from '@/locales/fr.json';

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        fr: { translation: fr },
      },
      lng: (() => {
        const locale = (Localization as any)?.getLocales?.()?.[0]?.languageCode
          || (Localization as any)?.locale?.split?.('-')?.[0];
        return (locale === 'fr' || locale === 'en') ? locale : 'en';
      })(),
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
}

export default i18n;
