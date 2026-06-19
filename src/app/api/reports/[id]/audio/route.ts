import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { reports } from "@/db/schema";
import { getCurrentDbUser } from "@/lib/current-user";
import {
  MmsLanguage,
  generateAndStoreSpeech,
} from "@/lib/mms-tts";
import { createRequestId, getErrorMessage } from "@/lib/api-errors";

const languageConfig: Record<string, { textColumn: string; audioColumn: string }> = {
  yoruba: { textColumn: "yorubaResult", audioColumn: "yorubaAudioUrl" },
  hausa: { textColumn: "hausaResult", audioColumn: "hausaAudioUrl" },
  igbo: { textColumn: "igboResult", audioColumn: "igboAudioUrl" },
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = createRequestId();

  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!user.profileCompleted) {
      return NextResponse.json(
        { error: "Complete your profile before generating audio." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = (await req.json()) as { language?: string };
    const language = body.language as MmsLanguage;
    const config = languageConfig[language];

    if (!config) {
      return NextResponse.json(
        { error: "Audio is only available for Yoruba, Hausa, and Igbo." },
        { status: 400 }
      );
    }

    if (language === "igbo") {
      return NextResponse.json(
        { error: "Igbo audio is not available yet." },
        { status: 400 }
      );
    }

    const report = await db.query.reports.findFirst({
      where: and(eq(reports.id, id), eq(reports.userId, user.id)),
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const existingUrl = report[config.audioColumn as keyof typeof report];
    if (existingUrl) {
      return NextResponse.json({ audioUrl: existingUrl }, { status: 200 });
    }

    const text = report[config.textColumn as keyof typeof report] as string | null;
    if (!text) {
      return NextResponse.json(
        { error: `No ${language} interpretation is available for this report.` },
        { status: 400 }
      );
    }

    const audioUrl = await generateAndStoreSpeech({
      reportId: report.id,
      language,
      text,
    });

    await db
      .update(reports)
      .set({ [config.audioColumn]: audioUrl })
      .where(and(eq(reports.id, report.id), eq(reports.userId, user.id)));

    return NextResponse.json({ audioUrl }, { status: 200 });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Report audio API error:", { requestId, message, error });
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? `Failed to generate report audio. Reference: ${requestId}`
            : message,
        requestId,
      },
      { status: 500 }
    );
  }
}
