// Simple i18n module for ARE YOU HUMAN?

let currentLang = 'en';
let locales = {};

export async function loadLocales() {
  const response = await fetch('./src/data/locales.json');
  locales = await response.json();
}

export function setLanguage(lang) {
  if (locales[lang]) {
    currentLang = lang;
  }
}

export function t(key) {
  const keys = key.split('.');
  let value = locales[currentLang];
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key;
    }
  }
  return value || key;
}

export function getCurrentLang() {
  return currentLang;
}
