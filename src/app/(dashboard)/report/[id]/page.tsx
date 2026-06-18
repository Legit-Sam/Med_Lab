import { db } from "@/db";
import { reports } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import ResultCard from "@/components/ResultCard";
import Link from "next/link";
import { getCurrentDbUser } from "@/lib/current-user";
import {
  ArrowLeft,
  FileText,
  ImageIcon,
  Calendar,
  ExternalLink,
  Info,
  CheckSquare,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export const metadata = {
  title: "Lab Report — WazobiCare Nigeria",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ReportPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");
  if (!user.profileCompleted) redirect("/complete-profile");

  const report = await db.query.reports.findFirst({
    where: and(eq(reports.id, id), eq(reports.userId, user.id)),
  });

  if (!report) notFound();

  const isPdf =
    report.fileType?.includes("pdf") ||
    report.fileName?.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-6 fade-in text-foreground max-w-5xl mx-auto">
      
      {/* Navigation Top bar */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <Link
          href="/dashboard"
          id="back-to-dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Clinical Interpretation Report
        </span>
      </div>

      {/* Grid Layout: Left Main Report, Right Info Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Main interpretation pane */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Clinical Header Card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isPdf
                    ? "bg-rose-500/10 dark:bg-rose-500/20 text-rose-500"
                    : "bg-teal-500/10 dark:bg-teal-500/20 text-teal-500"
                }`}
              >
                {isPdf ? (
                  <FileText className="w-6 h-6" />
                ) : (
                  <ImageIcon className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-foreground font-bold text-base truncate">
                  {report.fileName || "Lab Result"}
                </h1>
                <div className="flex flex-wrap items-center gap-3.5 mt-1 font-medium text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Uploaded {format(new Date(report.createdAt), "MMM d, yyyy")}</span>
                  </span>
                  <span className="h-3.5 w-px bg-border" />
                  <span className="text-teal-600 dark:text-teal-400">
                    Processed successfully
                  </span>
                </div>
              </div>
              <a
                href={report.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="view-original-file"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground text-[10px] font-bold transition shrink-0"
              >
                <span>Original File</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Result Card Output */}
          {report.status === "completed" &&
          report.englishResult &&
          report.yorubaResult &&
          report.hausaResult &&
          report.igboResult ? (
            <ResultCard
              reportId={report.id}
              english={report.englishResult}
              yoruba={report.yorubaResult}
              hausa={report.hausaResult}
              igbo={report.igboResult}
              yorubaAudioUrl={report.yorubaAudioUrl}
              hausaAudioUrl={report.hausaAudioUrl}
              igboAudioUrl={report.igboAudioUrl}
              extractedText={report.extractedText ?? undefined}
              defaultLanguage={user.preferredLanguage}
            />
          ) : report.status === "processing" ? (
            <div className="glass-card p-12 text-center border border-dashed border-border space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto animate-pulse">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-amber-600 dark:text-amber-400 font-bold text-sm">Still processing result…</p>
                <p className="text-muted-foreground text-xs">
                  We are reading your results and preparing native audio. Please reload this page in a few moments.
                </p>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center border border-rose-500/20 space-y-4">
              <p className="text-rose-500 font-bold text-sm">Analysis failed</p>
              <p className="text-muted-foreground text-xs max-w-sm mx-auto">
                Our AI failed to extract legible laboratory metrics from this file. Please ensure the scan is clear and re-upload.
              </p>
              <Link href="/upload" className="btn-primary mt-2 inline-flex">
                Try Again
              </Link>
            </div>
          )}
        </div>

        {/* Right Sidebar Checklist Panel */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
            Care Recommendations
          </h2>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-primary" />
              <span>Doctor Discussion Guide</span>
            </h3>
            
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Use this report as a starting point to align with your clinical physician. Consider asking these questions:
            </p>

            <ul className="space-y-3 pt-1">
              {[
                "Which values in this report are outside the normal reference ranges?",
                "Are there any changes in diet, hydration, or medicine that could improve these markers?",
                "When should I repeat these laboratory blood tests to check my progress?",
              ].map((q, idx) => (
                <li key={idx} className="flex gap-2 text-[10px] text-foreground/80 leading-relaxed items-start">
                  <span className="font-bold text-primary shrink-0 mt-0.5">•</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2 border-t border-border/60">
              <p className="text-[9px] text-muted-foreground italic leading-relaxed">
                Disclaimer: WazobiCare analyses do not replace clinical laboratory diagnosis reports.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
