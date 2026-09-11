import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getSettings, saveSettings } from './settings';
import { translations, rtlLanguages } from './translations';

const AppContext = createContext(null);

export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(() => getSettings());

  const { language, theme, documentLanguage, autoSave } = settings;

  // Apply theme (light / dark / system) to <html>.
  useEffect(() => {
    const root = document.documentElement;
    const apply = (mode) => {
      if (mode === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
    };

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches ? 'dark' : 'light');
      const handler = (e) => apply(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
    apply(theme);
  }, [theme]);

  // Apply language + direction (LTR/RTL) to <html>.
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', language);
    root.setAttribute('dir', rtlLanguages.includes(language) ? 'rtl' : 'ltr');
  }, [language]);

  const updateSettings = useCallback((partial) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  const t = useCallback((key) => {
    const dict = translations[language] || translations.en;
    return dict[key] ?? translations.en[key] ?? key;
  }, [language]);

  const dir = rtlLanguages.includes(language) ? 'rtl' : 'ltr';

  const value = useMemo(
    () => ({
      language,
      theme,
      documentLanguage,
      autoSave,
      dir,
      t,
      updateSettings,
    }),
    [language, theme, documentLanguage, autoSave, dir, t, updateSettings]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}