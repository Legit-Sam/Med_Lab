import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { reports, ttsJobs } from "@/db/schema";

type CallbackBody = {
  job_id: string;
  status: "ready" | "failed";
  audio_url?: string;
  error?: string;
};

const audioColumnMap: Record<string, string> = {
  yoruba: "yorubaAudioUrl",
  hausa: "hausaAudioUrl",
  igbo: "igboAudioUrl",
};

export async function POST(req: NextRequest) {
  try {
    const body: CallbackBody = await req.json();
    const { job_id, status, audio_url, error } = body;

    if (!job_id) {
      return NextResponse.json({ error: "Missing job_id" }, { status: 400 });
    }

    const job = await db.query.ttsJobs.findFirst({
      where: eq(ttsJobs.id, job_id),
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (status === "ready" && audio_url) {
      await db
        .update(ttsJobs)
        .set({ status: "ready", audioUrl: audio_url, updatedAt: new Date() })
        .where(eq(ttsJobs.id, job_id));

      const column = audioColumnMap[job.language];
      if (column) {
        await db
          .update(reports)
          .set({ [column]: audio_url })
          .where(eq(reports.id, job.reportId));
      }

      return NextResponse.json({ status: "ready" });
    }

    if (status === "failed") {
      await db
        .update(ttsJobs)
        .set({ status: "failed", error: error || "Unknown error", updatedAt: new Date() })
        .where(eq(ttsJobs.id, job_id));

      return NextResponse.json({ status: "failed" });
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (err) {
    console.error("TTS callback error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
