import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reports, analysisJobs } from "@/db/schema";
import { processLabFile } from "@/lib/ocr";
import { eq } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/current-user";
import { createRequestId, getErrorMessage } from "@/lib/api-errors";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const requestId = createRequestId();

  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!user.profileCompleted) {
      return NextResponse.json(
        { error: "Complete your profile before analyzing reports." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { fileUrl, fileName, fileType } = body as {
      fileUrl: string;
      fileName: string;
      fileType: string;
    };

    if (!fileUrl || !fileType) {
      return NextResponse.json(
        { error: "fileUrl and fileType are required" },
        { status: 400 }
      );
    }

    const [report] = await db
      .insert(reports)
      .values({
        userId: user.id,
        fileUrl,
        fileName: fileName || "lab-result",
        fileType,
        status: "processing",
      })
      .returning();

    const [job] = await db
      .insert(analysisJobs)
      .values({
        reportId: report.id,
        status: "queued",
      })
      .returning();

    await db
      .update(analysisJobs)
      .set({ status: "processing", startedAt: new Date() })
      .where(eq(analysisJobs.id, job.id));

    try {
      const { extractedText, analysis } = await processLabFile(fileUrl, fileType);

      const [updatedReport] = await db
        .update(reports)
        .set({
          extractedText,
          englishResult: analysis.english,
          yorubaResult: analysis.yoruba,
          hausaResult: analysis.hausa,
          igboResult: analysis.igbo,
          status: "completed",
        })
        .where(eq(reports.id, report.id))
        .returning();

      await db
        .update(analysisJobs)
        .set({
          status: "completed",
          completedAt: new Date(),
        })
        .where(eq(analysisJobs.id, job.id));

      logger.info("Analysis completed successfully", {
        requestId,
        metadata: { reportId: report.id, jobId: job.id },
      });

      return NextResponse.json({ report: updatedReport }, { status: 200 });
    } catch (processingError) {
      await db
        .update(reports)
        .set({ status: "failed" })
        .where(eq(reports.id, report.id));

      const message = getErrorMessage(processingError);

      await db
        .update(analysisJobs)
        .set({
          status: "failed",
          failedAt: new Date(),
          errorMessage: message,
          retryCount: 1,
        })
        .where(eq(analysisJobs.id, job.id));

      logger.error("Analysis processing failed", {
        requestId,
        error: processingError,
        metadata: { reportId: report.id, jobId: job.id },
      });

      const isTemporaryAiError = /temporarily busy|service unavailable|high demand/i.test(
        message
      );

      return NextResponse.json(
        {
          error: "Unable to analyze report. Please try again.",
          reportId: report.id,
          requestId,
        },
        { status: isTemporaryAiError ? 503 : 422 }
      );
    }
  } catch (error) {
    const message = getErrorMessage(error);
    logger.error("Analyze API error", {
      requestId,
      error,
    });
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? `Analysis could not start. Reference: ${requestId}`
            : message,
        requestId,
      },
      { status: 500 }
    );
  }
}
