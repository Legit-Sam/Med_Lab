import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reports, analysisJobs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/current-user";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const report = await db.query.reports.findFirst({
      where: eq(reports.id, id),
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (report.status !== "failed") {
      return NextResponse.json(
        { error: "Only failed reports can be retried." },
        { status: 400 }
      );
    }

    await db
      .update(reports)
      .set({
        status: "processing",
        englishResult: null,
        yorubaResult: null,
        hausaResult: null,
        igboResult: null,
        extractedText: null,
      })
      .where(eq(reports.id, report.id));

    const [job] = await db
      .insert(analysisJobs)
      .values({
        reportId: report.id,
        status: "queued",
        retryCount: 1,
      })
      .returning();

    return NextResponse.json({
      jobId: job.id,
      reportId: report.id,
      status: "queued",
    });
  } catch (error) {
    console.error("Retry error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Failed to retry analysis." },
      { status: 500 }
    );
  }
}
