import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reports, analysisJobs } from "@/db/schema";
import { processLabFile } from "@/lib/ocr";
import { eq } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/current-user";
import { createRequestId, getErrorMessage } from "@/lib/api-errors";
import { checkRateLimit, rateLimitExceeded } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const requestId = createRequestId();

  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateCheck = await checkRateLimit(user.id, "analyze");
    if (!rateCheck.allowed) {
      return rateLimitExceeded("analyze");
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

    return NextResponse.json({
      jobId: job.id,
      reportId: report.id,
      status: "queued",
    });
  } catch (error) {
    logger.error("Analyze API error", { requestId, error: getErrorMessage(error) });
    return NextResponse.json(
      { error: `Analysis could not start. Reference: ${requestId}` },
      { status: 500 }
    );
  }
}
