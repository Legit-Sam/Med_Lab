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
  Eye,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { getCurrentDbUser } from "@/lib/current-user";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Dashboard — WazobiCare",
};

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
      {/* ═══ WELCOME HEADER ═══ */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <p className="text-xs font-semibold text-accent">Welcome back</p>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Hello, {displayName} 👋
            </h1>
            <p className="text-base text-muted-foreground max-w-xl">
              You can now understand your lab results in Yoruba, Igbo, Hausa, or English.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/upload">
              <Button className="gap-2 shadow-lg shadow-accent/30">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload Lab Result</span>
                <span className="sm:hidden">Upload</span>
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" className="gap-2">
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Try Demo</span>
                <span className="sm:hidden">Demo</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ STATS GRID ═══ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Reports */}
        <Card size="sm" className="group hover:border-accent/40 hover:shadow-lg transition-all duration-300">
          <CardContent className="flex items-start justify-between p-4 sm:p-5">
            <div className="space-y-2 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Total Reports</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalReports}</p>
              {totalReports > 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-accent" /> This month
                </p>
              )}
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card size="sm" className="group hover:border-accent/40 hover:shadow-lg transition-all duration-300">
          <CardContent className="flex items-start justify-between p-4 sm:p-5">
            <div className="space-y-2 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{completedReports}</p>
              {totalReports > 0 && (
                <p className="text-xs text-muted-foreground">
                  {Math.round((completedReports / totalReports) * 100)}% done
                </p>
              )}
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[color:var(--success)]/10 text-[color:var(--success)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Processing */}
        <Card size="sm" className="group hover:border-accent/40 hover:shadow-lg transition-all duration-300">
          <CardContent className="flex items-start justify-between p-4 sm:p-5">
            <div className="space-y-2 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">In Progress</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{processingReports}</p>
              <p className="text-xs text-muted-foreground">
                {processingReports > 0 ? "Check back soon" : "All done"}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[color:var(--warning)]/10 text-[color:var(--warning)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Languages */}
        <Card size="sm" className="group hover:border-accent/40 hover:shadow-lg transition-all duration-300">
          <CardContent className="flex items-start justify-between p-4 sm:p-5">
            <div className="space-y-2 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Languages</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">4</p>
              <p className="text-xs text-muted-foreground">Always available</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ═══ QUICK ACTIONS ═══ */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/upload"
          className="group flex flex-col items-start gap-4 rounded-2xl border border-border/50 p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-1 w-full">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
              Upload Lab Result
            </h3>
            <p className="text-xs text-muted-foreground">
              Scan or upload a new medical report
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0 self-end" />
        </Link>

        <Link
          href="/audio-reader"
          className="group flex flex-col items-start gap-4 rounded-2xl border border-border/50 p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-1 w-full">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
              Audio Reader
            </h3>
            <p className="text-xs text-muted-foreground">
              Listen to translations aloud
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0 self-end" />
        </Link>

        <Link
          href="/history"
          className="group flex flex-col items-start gap-4 rounded-2xl border border-border/50 p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-1 w-full">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
              View All Reports
            </h3>
            <p className="text-xs text-muted-foreground">
              Browse your complete history
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0 self-end" />
        </Link>
      </section>

      {/* ═══ RECENT REPORTS ═══ */}
      <section className="border-t border-border/40 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Recent Lab Reports</h2>
            <p className="text-xs text-muted-foreground">
              {userReports.length} report{userReports.length !== 1 ? "s" : ""} uploaded
            </p>
          </div>
          {userReports.length > 0 && (
            <Link
              href="/history"
              className="text-xs font-semibold text-accent hover:text-accent/80 flex items-center gap-2 transition-colors px-3 py-1.5 rounded-lg hover:bg-accent/10"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
        {userReports.length > 0 ? (
          <ReportList
            reports={userReports.map((r) => ({ ...r, fileName: r.fileName || "Lab Result" }))}
            compact
          />
        ) : (
          <div className="rounded-2xl border border-border/50 p-12 text-center space-y-4 bg-card/40">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">No reports yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Upload your first medical lab result to get started
              </p>
            </div>
            <Link href="/upload">
              <Button className="mt-4">
                <Upload className="w-4 h-4 mr-2" />
                Upload First Report
              </Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
