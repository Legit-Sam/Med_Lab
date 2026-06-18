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
} from "lucide-react";
import { getCurrentDbUser } from "@/lib/current-user";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Dashboard — LabExplain",
};

/* ─── Tiny SVG sparkline — token-colored, no deps ─── */
function Sparkline({
  data,
  className,
  color = "var(--accent)",
  height = 32,
}: {
  data: number[];
  className?: string;
  color?: string;
  height?: number;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 80;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${w},${height}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      className={cn("w-20", className)}
      fill="none"
      aria-hidden="true"
    >
      <path
        d={`M${areaPoints.replace(/,/g, " ").replace(/(\d+\.?\d*)\s/g, "$1,$1 ").replace(/,(\d+\.?\d*)\s/g, "L$1,")}`}
        fill={color}
        opacity={0.12}
      />
      <polyline
        points={points}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Metric card with optional sparkline ─── */
function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  sparkline,
  accent = "accent",
}: {
  label: string;
  value: string | number;
  description: string;
  icon: typeof Activity;
  sparkline?: number[];
  accent?: "accent" | "primary" | "chart-4";
}) {
  const iconColors = {
    accent: "bg-accent/12 text-accent",
    primary: "bg-primary/8 text-primary",
    "chart-4": "bg-chart-4/12 text-chart-4",
  };

  return (
    <div className="surface surface-hover flex flex-col sm:flex-row sm:items-center gap-4 p-5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="eyebrow">{label}</span>
        </div>
        <p className="text-2xl font-bold text-foreground tracking-tight">
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="flex items-center gap-4">
        {sparkline && (
          <Sparkline data={sparkline} color={`var(--${accent})`} />
        )}
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            iconColors[accent],
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

/* ─── Quick-action tile ─── */
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
      className="surface surface-hover flex items-center gap-4 p-4 group"
    >
      <div className="w-10 h-10 rounded-xl bg-accent/12 text-accent flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
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
  const completedReports = userReports.filter(
    (r) => r.status === "completed",
  ).length;
  const processingReports = userReports.filter(
    (r) => r.status === "processing",
  ).length;

  const displayName = user.fullName || user.email.split("@")[0];

  // Generate synthetic sparkline data from report timestamps (for visual demo)
  const activityData = [0];
  const now = Date.now();
  for (let i = 1; i <= 8; i++) {
    const cutoff = now - (8 - i) * 7 * 24 * 60 * 60 * 1000;
    activityData.push(
      userReports.filter((r) => new Date(r.createdAt).getTime() <= cutoff)
        .length,
    );
  }

  return (
    <div className="space-y-8 fade-in text-foreground">
      {/* ─── Welcome Banner ─── */}
      <section className="relative overflow-hidden rounded-2xl border border-border p-6 md:p-8 lg:p-10">
        {/* Navy gradient background — calm, no harsh color */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90 -z-10"
        />
        {/* Subtle accent glow */}
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20 blur-3xl -z-10"
          style={{ background: "var(--accent)" }}
        />

        <div className="relative z-10 max-w-xl space-y-4">
          <p className="eyebrow text-accent-foreground/70">
            Dashboard Overview
          </p>
          <h1
            className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-primary-foreground leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Welcome back, <span className="text-[color:var(--accent)]">{displayName}</span>
          </h1>
          <p className="text-primary-foreground/70 text-sm md:text-base leading-relaxed">
            Translate complex lab test values into Yoruba, Igbo, Hausa, or
            English instantly. Safe, secure, and educational.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/upload"
              id="dashboard-upload-btn"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[color:var(--accent)] text-[color:var(--accent-foreground)] font-semibold text-sm shadow-lg hover:opacity-90 transition-all"
            >
              <Upload className="w-4 h-4" />
              Upload Lab Result
            </Link>
            <Link
              href="/audio-reader"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary-foreground/15 text-primary-foreground font-semibold text-sm border border-primary-foreground/20 hover:bg-primary-foreground/25 transition-all"
            >
              <PlayCircle className="w-4 h-4" />
              Audio Reader
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Analytics Grid ─── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="Total Uploads"
          value={totalReports}
          description="Documents scanned"
          icon={Activity}
          sparkline={activityData}
          accent="accent"
        />
        <MetricCard
          label="Completed"
          value={completedReports}
          description="Analyses with translations"
          icon={CheckCircle}
          sparkline={
            processingReports > 0
              ? [
                  completedReports - 1,
                  completedReports - 1,
                  completedReports,
                ]
              : [completedReports - 2, completedReports - 1, completedReports]
          }
          accent="primary"
        />
        <MetricCard
          label="Languages"
          value="4"
          description="Yoruba, Igbo, Hausa, English"
          icon={Globe}
          accent="chart-4"
        />
      </section>

      {/* ─── Quick Actions ─── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <QuickAction
          href="/upload"
          label="Upload Result"
          subtitle="Scan a new lab report"
          icon={Upload}
        />
        <QuickAction
          href="/audio-reader"
          label="Audio Reader"
          subtitle="Listen to translations"
          icon={PlayCircle}
        />
        <QuickAction
          href="/history"
          label="View History"
          subtitle="Browse all reports"
          icon={BarChart3}
        />
      </section>

      {/* ─── Recent Reports ─── */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2
            className="text-xl font-semibold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Recent Lab Reports
          </h2>
          {userReports.length > 0 && (
            <Link
              href="/history"
              className="text-sm font-medium text-accent hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
        <ReportList
          reports={userReports.map((r) => ({
            ...r,
            fileName: r.fileName || "Lab Result",
          }))}
          compact
        />
      </section>
    </div>
  );
}
