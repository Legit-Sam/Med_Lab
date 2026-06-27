"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Activity, FileText, HeartHandshake, Eye } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import DemoTextToSpeech from "./DemoTextToSpeech";
import type { Language } from "@/types";

type Props = {
  english: string;
  yoruba: string;
  hausa: string;
  igbo: string;
  yorubaAudioUrl?: string | null;
  hausaAudioUrl?: string | null;
  igboAudioUrl?: string | null;
  extractedText?: string;
  defaultLanguage?: Language;
};

type SectionKey = "summary" | "findings" | "interpretation";

const TABS: { id: SectionKey; label: string; icon: typeof FileText }[] = [
  { id: "summary", label: "Patient Summary", icon: FileText },
  { id: "findings", label: "Findings & Data", icon: Activity },
  { id: "interpretation", label: "Interpretation", icon: HeartHandshake },
];

export default function DemoResultCard({
  english,
  yoruba,
  hausa,
  igbo,
  yorubaAudioUrl,
  hausaAudioUrl,
  igboAudioUrl,
  extractedText,
  defaultLanguage = "english",
}: Props) {
  const [lang, setLang] = useState<Language>(defaultLanguage);
  const [activeSection, setActiveSection] = useState<SectionKey>("summary");
  const [showRaw, setShowRaw] = useState(false);

  const contentMap: Record<Language, string> = { english, yoruba, hausa, igbo };
  const audioUrlMap: Partial<Record<Language, string | null | undefined>> = {
    yoruba: yorubaAudioUrl,
    hausa: hausaAudioUrl,
    igbo: igboAudioUrl,
  };

  const currentText = useMemo(() => {
    const raw = contentMap[lang] || english;
    if (!raw) return "";
    return raw.replace(/\*\*/g, "").replace(/^#+\s+/gm, "").trim();
  }, [lang, english, contentMap]);

  const sections = useMemo(() => {
    const grouped: Record<SectionKey, string[]> = {
      summary: [],
      findings: [],
      interpretation: [],
    };

    const paragraphs = currentText.split("\n").map((p) => p.trim()).filter(Boolean);
    let currentSection: SectionKey = "summary";

    for (const para of paragraphs) {
      const upper = para.toUpperCase();
      const numMatch = para.match(/^(\d+)\.\s/);

      if (numMatch) {
        const num = parseInt(numMatch[1], 10);
        if (num === 1) {
          currentSection = "summary";
        } else if (num === 2 || num === 3) {
          currentSection = "findings";
        } else if (num >= 4) {
          currentSection = "interpretation";
        }
        grouped[currentSection].push(para);
        continue;
      }

      if (
        upper.includes("PATIENT LAB SUMMARY") ||
        (upper.includes("SUMMARY") && para.length < 50)
      ) {
        currentSection = "summary";
        grouped.summary.push(para);
      } else if (
        upper.includes("KEY FINDINGS") ||
        upper.includes("DETAILED ANALYSIS") ||
        (upper.includes("FINDINGS") && para.length < 50) ||
        (upper.includes("ANALYSIS") && para.length < 50)
      ) {
        currentSection = "findings";
        grouped.findings.push(para);
      } else if (
        upper.includes("CLINICAL INTERPRETATION") ||
        upper.includes("POSSIBLE NEXT ACTIONS") ||
        upper.includes("CLARIFICATIONS") ||
        (upper.includes("INTERPRETATION") && para.length < 50) ||
        (upper.includes("ACTIONS") && para.length < 50)
      ) {
        currentSection = "interpretation";
        grouped.interpretation.push(para);
      } else {
        grouped[currentSection].push(para);
      }
    }

    if (
      grouped.summary.length === 0 &&
      grouped.findings.length === 0 &&
      grouped.interpretation.length === 0
    ) {
      grouped.summary = paragraphs;
    }

    return grouped;
  }, [currentText]);

  const renderParagraphs = (paras: string[]) => {
    if (paras.length === 0) {
      return <p className="text-muted-foreground text-sm italic">No data in this section.</p>;
    }

    return paras.map((para, i) => {
      const isHeader =
        para.length < 85 &&
        (para.endsWith(":") || /^\d+\./.test(para) || para.toUpperCase() === para);

      if (isHeader) {
        return (
          <h3 key={i} className="text-xs font-extrabold text-primary uppercase tracking-wider mt-5 mb-2 first:mt-0">
            {para}
          </h3>
        );
      }

      if (/^[•\-*]/.test(para)) {
        return (
          <div key={i} className="flex gap-2.5 text-sm text-foreground/85 leading-relaxed pl-2 py-0.5">
            <span className="text-primary shrink-0 mt-0.5">▸</span>
            <span>{para.replace(/^[•\-*]\s*/, "")}</span>
          </div>
        );
      }

      return (
        <p key={i} className="text-sm text-foreground/85 leading-relaxed mb-3">{para}</p>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* ─── Controls ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Language</span>
          <LanguageSwitcher active={lang} onChange={setLang} />
        </div>
        <DemoTextToSpeech
          key={lang}
          text={currentText}
          language={lang}
          audioUrl={audioUrlMap[lang]}
        />
      </div>

      {/* ─── Tabs ─── */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <div className="flex border-b border-border/60">
          {TABS.map((tab) => {
            const isActive = activeSection === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`relative flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-semibold transition-colors select-none ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"
                }`}
              >
                {isActive && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary rounded-full" />}
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div className="p-6 min-h-[180px]">
          <div key={`${lang}-${activeSection}`} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
            {renderParagraphs(sections[activeSection])}
          </div>
        </div>
      </div>

      {/* ─── Raw Text ─── */}
      {extractedText && (
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
          <button
            id="toggle-raw-text-btn"
            onClick={() => setShowRaw(!showRaw)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>OCR Extracted Text</span>
            </span>
            {showRaw ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showRaw && (
            <div className="border-t border-border/60 bg-muted/5">
              <pre className="m-5 text-[11px] text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed bg-background border border-border/60 rounded-xl p-4 max-h-64 overflow-y-auto shadow-inner">
                {extractedText}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
