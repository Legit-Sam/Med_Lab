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

export function LocaleProvider({
  children,
  initialLocale = "english",
  translations,
}: {
  children: React.ReactNode;
  initialLocale?: Language;
  translations: TranslationsData;
}) {
  const [locale, setLocale] = useState<Language>(initialLocale);
  const [data, setData] = useState<TranslationsData>(translations);

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
