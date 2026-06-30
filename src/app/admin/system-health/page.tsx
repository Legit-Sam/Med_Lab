import { sql, eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { reports, analysisJobs, users } from "@/db/schema";
import { createRequestId } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

type HealthData = {
  uptime: string;
  database: { ok: boolean; error?: string };
  users: { total: number };
  reports: {
    total: number;
    processing: number;
    completed: number;
    failed: number;
  };
  jobs: {
    total: number;
    queued: number;
    processing: number;
    completed: number;
    failed: number;
  };
};

async function getHealthData(): Promise<HealthData> {
  let database: { ok: boolean; error?: string } = { ok: true };
  try {
    await db.execute(sql`select 1`);
  } catch (error) {
    database = { ok: false, error: String(error) };
  }

  const [userCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);

  const [reportCounts] = await db
    .select({
      total: sql<number>`count(*)`,
      processing: sql<number>`count(*) filter (where ${reports.status} = 'processing')`,
      completed: sql<number>`count(*) filter (where ${reports.status} = 'completed')`,
      failed: sql<number>`count(*) filter (where ${reports.status} = 'failed')`,
    })
    .from(reports);

  const [jobCounts] = await db
    .select({
      total: sql<number>`count(*)`,
      queued: sql<number>`count(*) filter (where ${analysisJobs.status} = 'queued')`,
      processing: sql<number>`count(*) filter (where ${analysisJobs.status} = 'processing')`,
      completed: sql<number>`count(*) filter (where ${analysisJobs.status} = 'completed')`,
      failed: sql<number>`count(*) filter (where ${analysisJobs.status} = 'failed')`,
    })
    .from(analysisJobs);

  return {
    uptime: process.uptime().toFixed(0) + "s",
    database,
    users: { total: Number(userCount.count) },
    reports: {
      total: Number(reportCounts.total),
      processing: Number(reportCounts.processing),
      completed: Number(reportCounts.completed),
      failed: Number(reportCounts.failed),
    },
    jobs: {
      total: Number(jobCounts.total),
      queued: Number(jobCounts.queued),
      processing: Number(jobCounts.processing),
      completed: Number(jobCounts.completed),
      failed: Number(jobCounts.failed),
    },
  };
}

export default async function SystemHealthPage() {
  let data: HealthData | null = null;
  let error: string | null = null;

  try {
    data = await getHealthData();
  } catch (e) {
    error = String(e);
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            System Health
          </h1>
          <p className="text-sm text-muted-foreground">Observability dashboard for WazobiaCare</p>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Failed to load health data: {error}
          </div>
        )}

        {data && (
          <div className="space-y-4">
            <StatCard title="Database" status={data.database.ok ? "healthy" : "unhealthy"}>
              <StatRow label="Status" value={data.database.ok ? "Connected" : data.database.error || "Unknown"} />
              <StatRow label="Uptime" value={data.uptime} />
            </StatCard>

            <StatCard title="Users">
              <StatRow label="Total" value={String(data.users.total)} />
            </StatCard>

            <StatCard title="Reports">
              <StatRow label="Total" value={String(data.reports.total)} />
              <StatRow label="Processing" value={String(data.reports.processing)} />
              <StatRow label="Completed" value={String(data.reports.completed)} />
              <StatRow label="Failed" value={String(data.reports.failed)} />
            </StatCard>

            <StatCard title="Analysis Jobs">
              <StatRow label="Total" value={String(data.jobs.total)} />
              <StatRow label="Queued" value={String(data.jobs.queued)} />
              <StatRow label="Processing" value={String(data.jobs.processing)} />
              <StatRow label="Completed" value={String(data.jobs.completed)} />
              <StatRow label="Failed" value={String(data.jobs.failed)} />
            </StatCard>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, children, status }: { title: string; children: React.ReactNode; status?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        {status && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            status === "healthy" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          }`}>
            {status}
          </span>
        )}
      </div>
      <div className="divide-y divide-border/60">{children}</div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}
