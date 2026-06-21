"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Volume2,
  FileText,
  PlayCircle,
  ChevronRight,
  Info,
  ExternalLink,
} from "lucide-react";
import TextToSpeech from "./TextToSpeech";
import LanguageSwitcher from "./LanguageSwitcher";
import type { Language } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type ReportItem = {
  id: string;
  fileName: string;
  createdAt: string;
  englishResult: string;
  yorubaResult: string;
  hausaResult: string;
  igboResult: string;
  yorubaAudioUrl?: string | null;
  hausaAudioUrl?: string | null;
  igboAudioUrl?: string | null;
};

type Props = {
  reports: ReportItem[];
  defaultReportId?: string;
  preferredLanguage?: Language;
};

export default function AudioReaderDashboard({
  reports,
  defaultReportId,
  preferredLanguage = "english",
}: Props) {
  const [selectedId, setSelectedId] = useState<string | undefined>(
    defaultReportId || reports[0]?.id
  );
  const [lang, setLang] = useState<Language>(preferredLanguage);

  const activeReport = useMemo(() => {
    return reports.find((r) => r.id === selectedId);
  }, [reports, selectedId]);

  const contentMap = useMemo(() => {
    if (!activeReport) return null;
    return {
      english: activeReport.englishResult,
      yoruba: activeReport.yorubaResult,
      hausa: activeReport.hausaResult,
      igbo: activeReport.igboResult,
    };
  }, [activeReport]);

  const audioUrlMap = useMemo(() => {
    if (!activeReport) return null;
    return {
      yoruba: activeReport.yorubaAudioUrl,
      hausa: activeReport.hausaAudioUrl,
      igbo: activeReport.igboAudioUrl,
    };
  }, [activeReport]);

  const rawText = contentMap ? contentMap[lang] || contentMap.english : "";
  const currentText = useMemo(() => {
    if (!rawText) return "";
    return rawText
      .replace(/\*\*/g, "")
      .replace(/^#+\s+/gm, "")
      .trim();
  }, [rawText]);

  const paragraphs = useMemo(() => {
    return currentText
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);
  }, [currentText]);

  if (reports.length === 0) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center gap-5 text-center max-w-xl mx-auto border-dashed mt-10">
        <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center">
          <Volume2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold">No reports available to read</h3>
          <p className="text-xs text-muted-foreground">
            You can listen to laboratory results in Yoruba, Igbo, Hausa, or English once a report analysis has been completed successfully.
          </p>
        </div>
        <Link href="/upload">
          <Button variant="accent">Upload Result & Analyze</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Reports Sidebar Selector */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">
          Select Lab Report
        </h2>
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {reports.map((report) => {
            const isActive = report.id === selectedId;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedId(report.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isActive
                    ? "bg-accent/30 border-primary text-primary shadow-sm"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${isActive ? "text-foreground" : ""}`}>
                      {report.fileName || "Lab Result"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                      {format(new Date(report.createdAt), "MMM d, yyyy • h:mm a")}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Audio Dashboard Pane */}
      {activeReport ? (
        <div className="lg:col-span-2 space-y-6">
          {/* Card Header & Player */}
          <Card className="p-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <h1 className="text-lg font-semibold truncate max-w-md">
                  {activeReport.fileName}
                </h1>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Understand results by listening in your native dialect.
                </p>
              </div>
              <Link
                href={`/report/${activeReport.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
              >
                <span>Report Details</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Language controls & TextToSpeech */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-border/60">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Select Language
                </span>
                <LanguageSwitcher active={lang} onChange={setLang} />
              </div>
              <div className="shrink-0">
                <TextToSpeech
                  key={`${activeReport.id}-${lang}`}
                  reportId={activeReport.id}
                  text={currentText}
                  language={lang}
                  initialAudioUrl={audioUrlMap ? audioUrlMap[lang as keyof typeof audioUrlMap] : null}
                />
              </div>
            </div>
          </Card>

          {/* Read Along Text Block */}
          <Card className="p-6 space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border/40 pb-3">
              <PlayCircle className="w-4 h-4 text-accent" />
              <span>Read Along Translation</span>
            </h3>

            <div className="prose prose-teal max-w-none space-y-4 text-foreground/90 select-none">
              {paragraphs.map((para, i) => {
                const isHeader =
                  para.length < 85 &&
                  (para.endsWith(":") || /^\d+\./.test(para) || (para.startsWith("•") === false && para.startsWith("-") === false && para.startsWith("*") === false && i === 0));

                if (isHeader && i === 0) {
                  return (
                    <h2 key={i} className="text-base font-bold text-primary mb-3">
                      {para}
                    </h2>
                  );
                }

                if (para.startsWith("•") || para.startsWith("-") || para.startsWith("*")) {
                  return (
                    <div key={i} className="flex gap-2.5 text-sm leading-relaxed pl-3 py-0.5">
                      <span className="text-primary font-bold shrink-0">▸</span>
                      <span>{para.replace(/^[•\-*]\s*/, "")}</span>
                    </div>
                  );
                }

                return (
                  <p key={i} className="text-sm leading-relaxed text-foreground/80">
                    {para}
                  </p>
                );
              })}
            </div>

            {/* Educational disclaimer banner */}
            <div className="flex items-start gap-3 bg-accent/30 border border-primary/10 rounded-xl p-4 mt-6">
              <Info className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-foreground">Important Health Education</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Translations are optimized for dialect comprehension. This is not a diagnosis. Discuss all health readings and summaries with a clinical provider.
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
