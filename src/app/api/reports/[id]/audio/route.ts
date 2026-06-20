import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { reports, ttsJobs } from "@/db/schema";
import { getCurrentDbUser } from "@/lib/current-user";
import { createRequestId, getErrorMessage } from "@/lib/api-errors";
import { randomUUID } from "crypto";

const languageConfig: Record<string, { textColumn: string; audioColumn: string }> = {
  yoruba: { textColumn: "yorubaResult", audioColumn: "yorubaAudioUrl" },
  hausa: { textColumn: "hausaResult", audioColumn: "hausaAudioUrl" },
  igbo: { textColumn: "igboResult", audioColumn: "igboAudioUrl" },
};

const TTS_API_URL = process.env.MMS_TTS_API_URL || "http://localhost:8001";
const PUBLIC_URL = process.env.PUBLIC_URL || "http://localhost:3000";

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
    const language = body.language as string;
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

    const jobId = randomUUID();

    await db.insert(ttsJobs).values({
      id: jobId,
      reportId: report.id,
      language: language as "yoruba" | "hausa",
      status: "pending",
    });

    const speechText = text
      .replace(/\*\*/g, "").replace(/\*/g, "")
      .replace(/#/g, "").replace(/^[-\s•▸]+/gm, "")
      .replace(/\n+/g, " ").replace(/\s+/g, " ").trim();

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const apiKey = process.env.TTS_API_KEY;
    if (apiKey) headers["x-api-key"] = apiKey;

    fetch(`${TTS_API_URL}/tts`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        text: speechText,
        language,
        job_id: jobId,
        callback_url: `${PUBLIC_URL}/api/tts-callback`,
      }),
    }).catch((err) => {
      console.error("Failed to dispatch TTS job:", err);
      db.update(ttsJobs)
        .set({ status: "failed", error: err.message, updatedAt: new Date() })
        .where(eq(ttsJobs.id, jobId))
        .catch(() => {});
    });

    return NextResponse.json({ jobId, status: "pending" });
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
