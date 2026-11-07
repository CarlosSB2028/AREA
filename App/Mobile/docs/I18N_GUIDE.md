# AREA Mobile - Internationalization Guide

Complete guide for managing translations and localization in the AREA Mobile application.

---

## 📋 Overview

The AREA Mobile app supports multiple languages using `react-i18next`. Currently supported languages:
- **French (fr)** - Default language
- **English (en)** - Secondary language

---

## 🏗️ Architecture

### File Structure

```
i18n/
├── index.ts              # i18n configuration
└── locales/
    ├── en.json           # English translations
    └── fr.json           # French translations
```

### Configuration

```typescript
// i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  fr: {
    translation: frTranslations,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // Default language
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for better UX
    },
  });

export default i18n;
```

---

## 📝 Translation Files Structure

### French (fr.json) - Default

```json
{
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "edit": "Modifier",
    "loading": "Chargement...",
    "error": "Erreur",
    "success": "Succès"
  },
  "auth": {
    "login": {
      "title": "Connexion",
      "email": "Email",
      "password": "Mot de passe",
      "submit": "Se connecter",
      "forgotPassword": "Mot de passe oublié ?",
      "noAccount": "Pas de compte ?",
      "createAccount": "Créer un compte"
    },
    "register": {
      "title": "Inscription",
      "confirmPassword": "Confirmer le mot de passe",
      "submit": "S'inscrire",
      "haveAccount": "Déjà un compte ?",
      "login": "Se connecter"
    }
  },
  "home": {
    "welcome": "Bienvenue sur AREA",
    "subtitle": "Créez vos automatisations personnalisées",
    "createArea": "Créer une AREA"
  }
}
```

### English (en.json)

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success"
  },
  "auth": {
    "login": {
      "title": "Login",
      "email": "Email",
      "password": "Password",
      "submit": "Sign In",
      "forgotPassword": "Forgot password?",
      "noAccount": "Don't have an account?",
      "createAccount": "Create account"
    },
    "register": {
      "title": "Register",
      "confirmPassword": "Confirm password",
      "submit": "Sign Up",
      "haveAccount": "Already have an account?",
      "login": "Sign In"
    }
  },
  "home": {
    "welcome": "Welcome to AREA",
    "subtitle": "Create your custom automations",
    "createArea": "Create an AREA"
  }
}
```

---

## 🚀 Usage in Components

### Basic Translation

```typescript
// components/WelcomeMessage.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';

export function WelcomeMessage() {
  const { t } = useTranslation();

  return (
    <Text className="text-xl font-bold">
      {t('home.welcome')}
    </Text>
  );
}
```

### Translation with Variables

```typescript
// Translation file
{
  "user": {
    "greeting": "Bonjour {{name}} !",
    "itemsCount": "Vous avez {{count}} élément(s)"
  }
}

// Component usage
import { useTranslation } from 'react-i18next';

export function UserGreeting({ userName, itemCount }) {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('user.greeting', { name: userName })}</Text>
      <Text>{t('user.itemsCount', { count: itemCount })}</Text>
    </View>
  );
}
```

### Pluralization

```typescript
// Translation file
{
  "items": {
    "count": "Aucun élément",
    "count_one": "{{count}} élément",
    "count_other": "{{count}} éléments"
  }
}

// Component usage
<Text>{t('items.count', { count: items.length })}</Text>
```

### Language Switching

```typescript
// components/LanguageSwitcher.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <View className="flex-row">
      <Button onPress={() => changeLanguage('fr')}>
        <Button.Text>Français</Button.Text>
      </Button>
      <Button onPress={() => changeLanguage('en')}>
        <Button.Text>English</Button.Text>
      </Button>
    </View>
  );
}
```

---

## 🔄 Adding New Languages

### Step 1: Create Translation File

```json
// locales/es.json
{
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "loading": "Cargando...",
    "error": "Error",
    "success": "Éxito"
  }
}
```

### Step 2: Update Configuration

```typescript
// i18n/index.ts
import esTranslations from './locales/es.json';

const resources = {
  en: { translation: enTranslations },
  fr: { translation: frTranslations },
  es: { translation: esTranslations }, // Add Spanish
};

i18n.init({
  resources,
  lng: 'fr',
  fallbackLng: 'fr',
  // Add Spanish to whitelist
  whitelist: ['fr', 'en', 'es'],
});
```

### Step 3: Update Language Switcher

```typescript
// components/LanguageSwitcher.tsx
const languages = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' }, // Add Spanish
];
```

---

## 🛠️ Maintenance

### Finding Missing Translations

```bash
# Script to find missing keys
# find-missing-translations.js
const fs = require('fs');
const en = JSON.parse(fs.readFileSync('locales/en.json', 'utf8'));
const fr = JSON.parse(fs.readFileSync('locales/fr.json', 'utf8'));

function findMissingKeys(obj1, obj2, path = '') {
  const missing = [];

  for (const key in obj1) {
    const currentPath = path ? `${path}.${key}` : key;

    if (typeof obj1[key] === 'object') {
      missing.push(...findMissingKeys(obj1[key], obj2[key] || {}, currentPath));
    } else if (!(key in obj2)) {
      missing.push(currentPath);
    }
  }

  return missing;
}

const missingInFr = findMissingKeys(en, fr);
const missingInEn = findMissingKeys(fr, en);

console.log('Missing in French:', missingInFr);
console.log('Missing in English:', missingInEn);
```

### Translation Validation

```typescript
// utils/validateTranslations.ts
export function validateTranslations() {
  const requiredKeys = ['common.save', 'common.cancel', 'auth.login.title'];

  const { i18n } = useTranslation();

  for (const key of requiredKeys) {
    if (!i18n.exists(key)) {
      console.warn(`Missing translation key: ${key}`);
    }
  }
}

// Call during app initialization
validateTranslations();
```

---

## 📊 Best Practices

### ✅ Do's

- **Use descriptive keys**: `auth.login.submit` instead of `submit`
- **Keep keys consistent**: Use the same key across components
- **Test translations**: Always test UI with different languages
- **Use interpolation**: For dynamic content
- **Document context**: Add comments for translators

### ❌ Don'ts

- **Don't hardcode text**: Never use string literals in components
- **Don't concatenate keys**: Use proper interpolation
- **Don't use translation in logic**: Keep translations in UI only
- **Don't forget fallbacks**: Always have fallback languages

### Translation Key Naming

```typescript
// Good structure
{
  "componentName": {
    "action": {
      "state": "Translation text"
    }
  }
}

// Examples
{
  "userCard": {
    "edit": {
      "success": "Utilisateur modifié avec succès",
      "error": "Erreur lors de la modification"
    }
  }
}
```

---

## 📚 Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Date-fns Localization](https://date-fns.org/docs/I18n)
