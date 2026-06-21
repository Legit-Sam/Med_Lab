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
} from "lucide-react";
import { getCurrentDbUser } from "@/lib/current-user";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
    <div className="space-y-6 fade-in">
      {/* ─── Welcome ─── */}
      <section className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {displayName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Translate lab reports into Yoruba, Igbo, Hausa, or English
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/upload">
            <Button variant="accent" size="sm">
              <Upload className="w-4 h-4" />
              Upload
            </Button>
          </Link>
          <Link href="/demo">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4" />
              Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card size="sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <BarChart3 className="w-[18px] h-[18px]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Reports</p>
              <p className="text-xl font-bold">{totalReports}</p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-lg bg-[color:var(--success)]/10 text-[color:var(--success)] flex items-center justify-center shrink-0">
              <CheckCircle className="w-[18px] h-[18px]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-xl font-bold">{completedReports}</p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-lg bg-[color:var(--warning)]/10 text-[color:var(--warning)] flex items-center justify-center shrink-0">
              <Clock className="w-[18px] h-[18px]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Processing</p>
              <p className="text-xl font-bold">{processingReports}</p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <Globe className="w-[18px] h-[18px]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Languages</p>
              <p className="text-xl font-bold">4</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ─── Quick Actions ─── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/upload"
          className="group flex items-center gap-4 rounded-xl border p-4 bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold group-hover:text-accent transition-colors">Upload Result</p>
            <p className="text-xs text-muted-foreground mt-0.5">Scan a new lab report</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </Link>
        <Link
          href="/audio-reader"
          className="group flex items-center gap-4 rounded-xl border p-4 bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <PlayCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold group-hover:text-accent transition-colors">Audio Reader</p>
            <p className="text-xs text-muted-foreground mt-0.5">Listen to translations</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </Link>
        <Link
          href="/history"
          className="group flex items-center gap-4 rounded-xl border p-4 bg-card hover:bg-muted/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold group-hover:text-accent transition-colors">View History</p>
            <p className="text-xs text-muted-foreground mt-0.5">Browse all reports</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </Link>
      </section>

      {/* ─── Recent Reports ─── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Recent Lab Reports</h2>
          {userReports.length > 0 && (
            <Link
              href="/history"
              className="text-xs font-medium text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
            >
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
