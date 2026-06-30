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
  Shield,
  Clock,
  RefreshCw,
  Download,
} from "lucide-react";
import { format } from "date-fns";

export const metadata = {
  title: "Lab Report — WazobiaCare Nigeria",
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
    <div className="space-y-6 fade-in">
      {/* ─── Navigation ─── */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <Link
          href="/dashboard"
          id="back-to-dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
          Lab Report
        </span>
      </div>

      {/* ─── Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* ─── Main ─── */}
        <div className="lg:col-span-2 space-y-6">

          {/* ─── Header ─── */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  isPdf
                    ? "bg-destructive/8 text-destructive border-destructive/10"
                    : "bg-chart-2/8 text-chart-2 border-chart-2/10"
                }`}
              >
                {isPdf ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-foreground font-bold text-base truncate">
                  {report.fileName || "Lab Result"}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{format(new Date(report.createdAt), "MMM d, yyyy")}</span>
                  </span>
                  <span className="w-px h-3 bg-border" />
                  <span className="inline-flex items-center gap-1 text-[color:var(--success)] font-medium">
                    <CheckSquare className="w-3.5 h-3.5" />
                    Processed
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {report.status === "completed" && (
                  <a
                    href={`/api/reports/${report.id}/download`}
                    id="download-pdf-btn"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 bg-background/50 text-muted-foreground hover:text-foreground text-[10px] font-semibold hover:bg-muted/50 transition-all"
                  >
                    <Download className="w-3 h-3" />
                    <span className="hidden sm:inline">PDF</span>
                  </a>
                )}
                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="view-original-file"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 bg-background/50 text-muted-foreground hover:text-foreground text-[10px] font-semibold hover:bg-muted/50 transition-all"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="hidden sm:inline">Original</span>
                </a>
              </div>
            </div>
          </div>

          {/* ─── Result ─── */}
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
            <div className="rounded-2xl border border-border/60 bg-card p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-chart-4/10 text-chart-4 flex items-center justify-center mx-auto animate-pulse">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-chart-4 font-semibold text-sm">Processing your results...</p>
                <p className="text-muted-foreground text-xs">AI is analyzing your file. This page will update once complete.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-destructive/20 bg-card p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                <Info className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-destructive font-semibold text-sm">Analysis failed</p>
                <p className="text-muted-foreground text-xs max-w-sm mx-auto">The AI could not extract readable lab data from this file. Try uploading a clearer scan.</p>
              </div>
              <Link href="/upload" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all">
                <RefreshCw className="w-3.5 h-3.5" />
                Try Again
              </Link>
            </div>
          )}
        </div>

        {/* ─── Sidebar ─── */}
        <aside className="space-y-4">
          <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Care Guide
          </h2>

          <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-accent" />
              <span>Doctor Discussion Guide</span>
            </h3>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Take this report to your doctor and ask about:
            </p>

            <ul className="space-y-3">
              {[
                "Which values fall outside normal ranges, and what do they mean?",
                "What lifestyle or medication changes could improve my results?",
                "When should I schedule follow-up tests to track my progress?",
              ].map((q, i) => (
                <li key={i} className="flex gap-2.5 text-[11px] text-foreground/80 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t border-border/40">
              <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                WazobiaCare provides educational translations only. Always consult a qualified healthcare professional for medical decisions.
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-2">
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Quick Links</h3>
            <div className="space-y-1">
              <Link href="/history" className="block text-[11px] text-accent hover:text-accent/80 font-medium transition-colors">View all reports</Link>
              <Link href="/upload" className="block text-[11px] text-accent hover:text-accent/80 font-medium transition-colors">Upload new result</Link>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
