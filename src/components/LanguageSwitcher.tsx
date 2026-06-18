"use client";

import type { Language } from "@/types";
import { cn } from "@/lib/utils";

const LANGUAGES: { key: Language; label: string; flag: string }[] = [
  { key: "english", label: "English", flag: "🇬🇧" },
  { key: "yoruba", label: "Yorùbá", flag: "🇳🇬" },
  { key: "hausa", label: "Hausa", flag: "🇳🇬" },
  { key: "igbo", label: "Igbo", flag: "🇳🇬" },
];

type Props = {
  active: Language;
  onChange: (lang: Language) => void;
};

export default function LanguageSwitcher({ active, onChange }: Props) {
  return (
    <div
      id="language-switcher"
      className={cn(
        "flex items-center gap-1 p-1 rounded-xl border w-fit",
        "bg-muted border-border",
      )}
      role="tablist"
      aria-label="Select explanation language"
    >
      {LANGUAGES.map(({ key, label, flag }) => (
        <button
          key={key}
          id={`lang-tab-${key}`}
          role="tab"
          aria-selected={active === key}
          onClick={() => onChange(key)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
            active === key
              ? "bg-accent text-accent-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary",
          )}
        >
          <span className="text-sm leading-none">{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
