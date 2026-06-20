import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { reports, ttsJobs } from "@/db/schema";
import { UTApi, UTFile } from "uploadthing/server";

const audioColumnMap: Record<string, string> = {
  yoruba: "yorubaAudioUrl",
  hausa: "hausaAudioUrl",
  igbo: "igboAudioUrl",
};

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const jobId = formData.get("job_id") as string;
      const audioFile = formData.get("audio") as File | null;

      if (!jobId || !audioFile) {
        return NextResponse.json(
          { error: "Missing job_id or audio file" },
          { status: 400 }
        );
      }

      const job = await db.query.ttsJobs.findFirst({
        where: eq(ttsJobs.id, jobId),
      });

      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      const token = process.env.UPLOADTHING_TOKEN;
      if (!token) {
        return NextResponse.json(
          { error: "UploadThing not configured" },
          { status: 500 }
        );
      }

      const arrayBuffer = await audioFile.arrayBuffer();
      const utapi = new UTApi({ token, logLevel: "Error" });
      const result = await utapi.uploadFiles(
        new UTFile([arrayBuffer], `tts-${jobId}.wav`, { type: "audio/wav" }),
        { acl: "public-read", contentDisposition: "inline" }
      );

      if (result.error || !result.data?.ufsUrl) {
        throw new Error(result.error?.message || "UploadThing upload failed");
      }

      const audioUrl = result.data.ufsUrl;

      await db.update(ttsJobs)
        .set({ status: "ready", audioUrl, updatedAt: new Date() })
        .where(eq(ttsJobs.id, jobId));

      const column = audioColumnMap[job.language];
      if (column) {
        await db.update(reports)
          .set({ [column]: audioUrl })
          .where(eq(reports.id, job.reportId));
      }

      return NextResponse.json({ status: "ready", audioUrl });
    }

    const body = await req.json();
    const { job_id, status, error } = body as {
      job_id: string;
      status: string;
      error?: string;
    };

    if (!job_id) {
      return NextResponse.json({ error: "Missing job_id" }, { status: 400 });
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
