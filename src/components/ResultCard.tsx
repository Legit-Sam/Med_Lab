"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Activity, FileText, Clipboard, HeartHandshake, Eye } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import TextToSpeech from "./TextToSpeech";
import type { Language } from "@/types";

type Props = {
  reportId?: string;
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

export default function ResultCard({
  reportId,
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

  const contentMap: Record<Language, string> = {
    english,
    yoruba,
    hausa,
    igbo,
  };
  const audioUrlMap: Partial<Record<Language, string | null | undefined>> = {
    yoruba: yorubaAudioUrl,
    hausa: hausaAudioUrl,
    igbo: igboAudioUrl,
  };

  const currentText = contentMap[lang] || english;

  // Split and group the paragraphs into clinical sections
  const sections = useMemo(() => {
    const grouped: Record<SectionKey, string[]> = {
      summary: [],
      findings: [],
      interpretation: [],
    };

    const paragraphs = currentText
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);

    let currentSection: SectionKey = "summary";

    for (const para of paragraphs) {
      const upper = para.toUpperCase();
      if (
        upper.includes("1. PATIENT LAB SUMMARY") ||
        upper.includes("PATIENT LAB SUMMARY") ||
        (upper.includes("SUMMARY") && para.length < 50)
      ) {
        currentSection = "summary";
        grouped.summary.push(para);
        continue;
      } else if (
        upper.includes("2. KEY FINDINGS") ||
        upper.includes("KEY FINDINGS") ||
        upper.includes("3. DETAILED ANALYSIS") ||
        upper.includes("DETAILED ANALYSIS") ||
        (upper.includes("FINDINGS") && para.length < 50) ||
        (upper.includes("ANALYSIS") && para.length < 50)
      ) {
        currentSection = "findings";
        grouped.findings.push(para);
        continue;
      } else if (
        upper.includes("4. CLINICAL INTERPRETATION") ||
        upper.includes("CLINICAL INTERPRETATION") ||
        upper.includes("5. POSSIBLE NEXT ACTIONS") ||
        upper.includes("POSSIBLE NEXT ACTIONS") ||
        upper.includes("6. CLARIFICATIONS") ||
        upper.includes("CLARIFICATIONS") ||
        (upper.includes("INTERPRETATION") && para.length < 50) ||
        (upper.includes("ACTIONS") && para.length < 50)
      ) {
        currentSection = "interpretation";
        grouped.interpretation.push(para);
        continue;
      }

      grouped[currentSection].push(para);
    }

    // Fallback if some sections are empty
    if (grouped.summary.length === 0 && grouped.findings.length === 0 && grouped.interpretation.length === 0) {
      grouped.summary = paragraphs;
    }

    return grouped;
  }, [currentText]);

  const renderParagraphs = (paras: string[]) => {
    if (paras.length === 0) {
      return (
        <p className="text-muted-foreground text-xs italic">
          No additional details reported in this section.
        </p>
      );
    }

    return paras.map((para, i) => {
      // Heading detection
      const isHeader =
        para.length < 85 &&
        (para.endsWith(":") ||
          /^\d+\./.test(para) ||
          para.toUpperCase() === para ||
          (para.startsWith("•") === false && para.startsWith("-") === false && para.startsWith("*") === false && i === 0));

      if (isHeader) {
        return (
          <h3 key={i} className="text-xs font-extrabold text-primary uppercase tracking-wider mt-4 mb-2 first:mt-0">
            {para}
          </h3>
        );
      }

      if (para.startsWith("•") || para.startsWith("-") || para.startsWith("*")) {
        return (
          <div key={i} className="flex gap-2.5 text-xs text-foreground/80 leading-relaxed pl-2.5 py-0.5">
            <span className="text-primary font-bold shrink-0">▸</span>
            <span>{para.replace(/^[•\-*]\s*/, "")}</span>
          </div>
        );
      }

      return (
        <p key={i} className="text-xs text-foreground/80 leading-relaxed mb-3">
          {para}
        </p>
      );
    });
  };

  return (
    <div id="result-card" className="space-y-6 fade-in text-foreground">
      {/* Controls Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card shadow-sm">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Dialect Translation
          </span>
          <LanguageSwitcher active={lang} onChange={setLang} />
        </div>
        <div className="shrink-0">
          <TextToSpeech
            key={lang}
            reportId={reportId}
            text={currentText}
            language={lang}
            initialAudioUrl={audioUrlMap[lang]}
          />
        </div>
      </div>

      {/* Clinical Tabs Panel */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="flex border-b border-border bg-muted/30">
          {[
            { id: "summary", label: "Patient Summary", icon: FileText },
            { id: "findings", label: "Findings & Data", icon: Activity },
            { id: "interpretation", label: "Interpretation", icon: HeartHandshake },
          ].map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as SectionKey)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold transition border-b-2 outline-none select-none ${
                  isActive
                    ? "border-primary text-primary bg-background"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 min-h-[200px] prose prose-teal max-w-none">
          {renderParagraphs(sections[activeSection])}
        </div>
      </div>

      {/* Raw Extracted Text (Collapsible) */}
      {extractedText && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <button
            id="toggle-raw-text-btn"
            onClick={() => setShowRaw(!showRaw)}
            className="w-full flex items-center justify-between px-5 py-4 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition"
          >
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <span>Original OCR Extracted Text</span>
            </span>
            {showRaw ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showRaw && (
            <div className="px-5 pb-5 border-t border-border bg-muted/10">
              <pre className="mt-4 text-[10px] text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed bg-background border border-border rounded-xl p-4 max-h-64 overflow-y-auto shadow-inner">
                {extractedText}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
