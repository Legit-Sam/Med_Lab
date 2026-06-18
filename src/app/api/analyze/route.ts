import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reports } from "@/db/schema";
import { processLabFile } from "@/lib/ocr";
import { eq } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/current-user";
import { createRequestId, getErrorMessage } from "@/lib/api-errors";

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

    // Create a processing report entry first
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

    // Process file asynchronously (OCR + AI)
    try {
      const { extractedText, analysis } = await processLabFile(fileUrl, fileType);

      // Update report with results
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

      return NextResponse.json({ report: updatedReport }, { status: 200 });
    } catch (processingError) {
      // Mark report as failed
      await db
        .update(reports)
        .set({ status: "failed" })
        .where(eq(reports.id, report.id));

      const message = getErrorMessage(processingError);
      console.error("Processing error:", { requestId, message, processingError });
      const isTemporaryAiError = /temporarily busy|service unavailable|high demand/i.test(
        message
      );

      return NextResponse.json(
        {
          error: message,
          reportId: report.id,
          requestId,
        },
        { status: isTemporaryAiError ? 503 : 422 }
      );
    }
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Analyze API error:", { requestId, message, error });
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
