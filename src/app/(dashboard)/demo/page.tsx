import { redirect } from "next/navigation";
import { getCurrentDbUser } from "@/lib/current-user";
import { getDemoReport } from "@/lib/demo-data";
import DemoResultCard from "@/components/DemoResultCard";
import Link from "next/link";
import { ArrowLeft, FileText, Calendar, CheckSquare, Shield, Download } from "lucide-react";
import { format } from "date-fns";

export const metadata = {
  title: "Demo Lab Report — WazobiaCare Nigeria",
};

export default async function DemoPage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");

  const demoReport = await getDemoReport();
  if (!demoReport) {
    return (
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-12 text-center space-y-4">
          <p className="text-muted-foreground text-sm">Demo report is not available. Contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
        <span className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
          Demo Report
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[9px] font-bold">Preview</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border bg-chart-2/8 text-chart-2 border-chart-2/10">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-foreground font-bold text-base truncate">{demoReport.fileName}</h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{format(new Date(demoReport.createdAt), "MMM d, yyyy")}</span>
                  </span>
                  <span className="w-px h-3 bg-border" />
                  <span className="inline-flex items-center gap-1 text-[color:var(--success)] font-medium">
                    <CheckSquare className="w-3.5 h-3.5" />
                    Demo
                  </span>
                </div>
              </div>
              <a
                href="/api/demo/download"
                id="demo-download-pdf"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 bg-background/50 text-muted-foreground hover:text-foreground text-[10px] font-semibold hover:bg-muted/50 transition-all shrink-0"
              >
                <Download className="w-3 h-3" />
                <span className="hidden sm:inline">PDF</span>
              </a>
            </div>
          </div>

          <DemoResultCard
            english={demoReport.englishResult}
            yoruba={demoReport.yorubaResult}
            hausa={demoReport.hausaResult}
            igbo={demoReport.igboResult}
            yorubaAudioUrl={demoReport.yorubaAudioUrl}
            hausaAudioUrl={demoReport.hausaAudioUrl}
            igboAudioUrl={demoReport.igboAudioUrl}
            extractedText={demoReport.extractedText ?? undefined}
            defaultLanguage={user.preferredLanguage}
          />
        </div>

        <aside className="space-y-4">
          <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">About This Demo</h2>
          <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-accent" />
              <span>Demo Mode</span>
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              A pre-loaded lab report showing how WazobiaCare translates results across all four supported languages.
            </p>
            <ul className="space-y-2 text-[11px] text-foreground/80">
              <li className="flex gap-2"><span className="text-accent">•</span><span>Switch between English, Yoruba, Hausa, Igbo</span></li>
              <li className="flex gap-2"><span className="text-accent">•</span><span>Browse Summary, Findings & Interpretation tabs</span></li>
              <li className="flex gap-2"><span className="text-accent">•</span><span>Listen to Yoruba & Hausa audio (real generated audio)</span></li>
              <li className="flex gap-2"><span className="text-accent">•</span><span>Download as PDF</span></li>
            </ul>
            <div className="pt-3 border-t border-border/40">
              <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                No API calls to Gemini. All data is from a real pre-loaded lab report.
              </p>
            </div>
          </div>
          <Link href="/upload" className="block text-center rounded-2xl border border-accent/30 bg-accent/5 p-4 text-xs font-semibold text-accent hover:bg-accent/10 transition-colors">
            Upload your own lab result →
          </Link>
        </aside>
      </div>
    </div>
  );
}
