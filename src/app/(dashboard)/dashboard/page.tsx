import { db } from "@/db";
import { reports } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import ReportList from "@/components/ReportList";
import Link from "next/link";
import {
  Upload,
  Activity,
  CheckCircle,
  Globe,
  PlayCircle,
  ArrowRight,
  BarChart3,
  Clock,
  TrendingUp,
} from "lucide-react";
import { getCurrentDbUser } from "@/lib/current-user";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Dashboard — WazobiCare",
};

function Sparkline({
  data,
  color = "var(--accent)",
}: {
  data: number[];
  color?: string;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 80;
  const h = 32;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-20 shrink-0" fill="none" aria-hidden="true">
      <path d={`M0,${h} ${points.replace(/,/g, " ")} ${w},${h}`} fill={color} opacity={0.1} />
      <polyline points={points} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  trend,
  accent = "accent",
}: {
  label: string;
  value: string | number;
  description: string;
  icon: typeof Activity;
  trend?: "up" | "down" | "neutral";
  accent?: "accent" | "primary" | "chart-4";
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 hover:shadow-md hover:border-border transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
          accent === "accent" && "bg-accent/10 text-accent",
          accent === "primary" && "bg-primary/8 text-primary",
          accent === "chart-4" && "bg-chart-4/10 text-chart-4",
        )}>
          <Icon className="w-[18px] h-[18px]" />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground tracking-tight mb-0.5">{value}</p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{description}</span>
        {trend === "up" && <TrendingUp className="w-3 h-3 text-[color:var(--success)]" />}
        {trend === "down" && <TrendingUp className="w-3 h-3 text-destructive rotate-180" />}
      </div>
    </div>
  );
}

function QuickAction({
  href,
  label,
  icon: Icon,
  subtitle,
}: {
  href: string;
  label: string;
  icon: typeof Upload;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 hover:shadow-md hover:border-accent/30 transition-all duration-200"
    >
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 group-hover:bg-accent/20 group-hover:scale-105 transition-all duration-200">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");
  if (!user.profileCompleted) redirect("/complete-profile");

  const userReports = await db.query.reports.findMany({
    where: eq(reports.userId, user.id),
    orderBy: [desc(reports.createdAt)],
  });

  const totalReports = userReports.length;
  const completedReports = userReports.filter((r) => r.status === "completed").length;
  const processingReports = userReports.filter((r) => r.status === "processing").length;
  const displayName = user.fullName || user.email.split("@")[0];

  return (
    <div className="space-y-8 fade-in">
      {/* ─── Welcome Banner ─── */}
      <section className="relative overflow-hidden rounded-2xl border border-border/60 p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90 -z-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-15 blur-3xl -z-10" style={{ background: "var(--accent)" }} />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-10 blur-3xl -z-10" style={{ background: "var(--accent)" }} />

        <div className="relative z-10 max-w-xl space-y-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-accent/80 uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            Dashboard Overview
          </span>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-primary-foreground leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            Welcome back, <span className="text-accent">{displayName}</span>
          </h1>
          <p className="text-primary-foreground/70 text-sm md:text-base leading-relaxed max-w-lg">
            Translate complex lab test values into Yoruba, Igbo, Hausa, or English instantly. Safe, secure, and educational.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/upload"
              id="dashboard-upload-btn"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-accent text-accent-foreground font-semibold text-sm shadow-lg hover:shadow-xl hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <Upload className="w-4 h-4" />
              Upload Lab Result
            </Link>
            <Link
              href="/audio-reader"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary-foreground/10 text-primary-foreground font-semibold text-sm border border-primary-foreground/20 hover:bg-primary-foreground/20 active:scale-[0.98] transition-all"
            >
              <PlayCircle className="w-4 h-4" />
              Audio Reader
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats Grid ─── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Reports" value={totalReports} description="Uploaded documents" icon={BarChart3} accent="accent" />
        <MetricCard label="Completed" value={completedReports} description="Ready for review" icon={CheckCircle} trend={completedReports > 0 ? "up" : undefined} accent="primary" />
        <MetricCard label="Processing" value={processingReports} description="In progress" icon={Clock} trend={processingReports > 0 ? "neutral" : undefined} accent="chart-4" />
        <MetricCard label="Languages" value="4" description="Yoruba, Igbo, Hausa, English" icon={Globe} accent="accent" />
      </section>

      {/* ─── Quick Actions ─── */}
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickAction href="/upload" label="Upload Result" subtitle="Scan a new lab report" icon={Upload} />
          <QuickAction href="/audio-reader" label="Audio Reader" subtitle="Listen to translations" icon={PlayCircle} />
          <QuickAction href="/history" label="View History" subtitle="Browse all reports" icon={BarChart3} />
        </div>
      </section>

      {/* ─── Recent Reports ─── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Recent Lab Reports</h2>
          {userReports.length > 0 && (
            <Link href="/history" className="text-xs font-medium text-accent hover:text-accent/80 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
        <ReportList
          reports={userReports.map((r) => ({ ...r, fileName: r.fileName || "Lab Result" }))}
          compact
        />
      </section>
    </div>
  );
}
