'use client';

import React, { createContext, useContext, useState, useCallback, useMemo, useSyncExternalStore } from 'react';
import enMessages from '@/messages/en.json';
import zhMessages from '@/messages/zh.json';

type Messages = typeof enMessages;
type Language = 'en' | 'zh';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  messages: Messages;
}

const messages: Record<Language, Messages> = {
  en: enMessages,
  zh: zhMessages,
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Custom hook to get initial language from localStorage
function useInitialLanguage(): Language {
  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return 'zh';
    return (localStorage.getItem('torrent-manager-language') as Language) || 'zh';
  }, []);

  const getServerSnapshot = useCallback(() => 'zh', []);

  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('storage', callback);
      return () => window.removeEventListener('storage', callback);
    },
    getSnapshot,
    getServerSnapshot
  );
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const initialLanguage = useInitialLanguage();
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('torrent-manager-language', lang);
    }
  }, []);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: unknown = messages[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === 'string' ? value : key;
  }, [language]);

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
    messages: messages[language],
  }), [language, setLanguage, t]);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
