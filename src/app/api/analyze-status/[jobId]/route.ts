import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reports, analysisJobs } from "@/db/schema";
import { processLabFile } from "@/lib/ocr";
import { eq } from "drizzle-orm";
import { getErrorMessage } from "@/lib/api-errors";
import { logger } from "@/lib/logger";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const job = await db.query.analysisJobs.findFirst({
      where: eq(analysisJobs.id, jobId),
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status === "queued") {
      await db
        .update(analysisJobs)
        .set({ status: "processing", startedAt: new Date() })
        .where(eq(analysisJobs.id, job.id));

      try {
        const report = await db.query.reports.findFirst({
          where: eq(reports.id, job.reportId),
        });

        if (!report) throw new Error("Report not found");

        const { extractedText, analysis } = await processLabFile(
          report.fileUrl,
          report.fileType
        );

        await db
          .update(reports)
          .set({
            extractedText,
            englishResult: analysis.english,
            yorubaResult: analysis.yoruba,
            hausaResult: analysis.hausa,
            igboResult: analysis.igbo,
            status: "completed",
          })
          .where(eq(reports.id, report.id));

        await db
          .update(analysisJobs)
          .set({ status: "completed", completedAt: new Date() })
          .where(eq(analysisJobs.id, job.id));

        logger.info("Analysis completed", {
          metadata: { reportId: report.id, jobId: job.id },
        });

        return NextResponse.json({
          status: "completed",
          reportId: report.id,
        });
      } catch (processingError) {
        const message = getErrorMessage(processingError);

        await db
          .update(reports)
          .set({ status: "failed" })
          .where(eq(reports.id, job.reportId));

        await db
          .update(analysisJobs)
          .set({ status: "failed", failedAt: new Date(), errorMessage: message })
          .where(eq(analysisJobs.id, job.id));

        logger.error("Analysis failed", { error: processingError });

        return NextResponse.json({ status: "failed", error: message });
      }
    }

    if (job.status === "completed") {
      return NextResponse.json({
        status: "completed",
        reportId: job.reportId,
      });
    }

    if (job.status === "failed") {
      return NextResponse.json({
        status: "failed",
        error: job.errorMessage || "Analysis failed",
      });
    }

    return NextResponse.json({ status: job.status });
  } catch (error) {
    const message = getErrorMessage(error);
    logger.error("Analyze status error", { error });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
