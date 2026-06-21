"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Language } from "@/types";

type TranslationMap = Record<string, string>;
type TranslationsData = Record<string, TranslationMap>;

type LocaleContextValue = {
  locale: Language;
  setLocale: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const val = params[key];
    return val !== undefined ? String(val) : `{${key}}`;
  });
}

function resolveInitialLocale(serverLocale: Language): Language {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("ui_locale") as Language | null;
    if (saved && ["english", "yoruba", "hausa", "igbo"].includes(saved)) {
      return saved;
    }
  }
  return serverLocale;
}

export function LocaleProvider({
  children,
  initialLocale = "english",
  translations,
}: {
  children: React.ReactNode;
  initialLocale?: Language;
  translations: TranslationsData;
}) {
  const [locale, setLocaleState] = useState<Language>(initialLocale);
  const [data, setData] = useState<TranslationsData>(translations);

  // Restore persisted locale on mount
  useEffect(() => {
    const resolved = resolveInitialLocale(initialLocale);
    if (resolved !== initialLocale) {
      setLocaleState(resolved);
    }
  }, [initialLocale]);

  const setLocale = useCallback((lang: Language) => {
    localStorage.setItem("ui_locale", lang);
    setLocaleState(lang);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const langMap = data[locale];
      if (langMap && key in langMap) {
        return interpolate(langMap[key], params);
      }
      // Fall back to English
      const enMap = data.english;
      if (enMap && key in enMap) {
        return interpolate(enMap[key], params);
      }
      return key;
    },
    [locale, data]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, isLoading: false }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useT(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useT must be used within a LocaleProvider");
  }
  return ctx;
}
