import "server-only";
import { UTApi, UTFile } from "uploadthing/server";

export type MmsLanguage = "yoruba" | "hausa" | "igbo";

const API_URL = process.env.MMS_TTS_API_URL || "http://localhost:8001";

export async function generateAndStoreSpeech({
  reportId,
  language,
  text,
}: {
  reportId: string;
  language: MmsLanguage;
  text: string;
}): Promise<string> {
  const token = process.env.UPLOADTHING_TOKEN;
  if (!token) throw new Error("Missing UPLOADTHING_TOKEN environment variable.");

  const speechText = text
    .replace(/\*\*/g, "").replace(/\*/g, "")
    .replace(/#/g, "").replace(/^[-\s•▸]+/gm, "")
    .replace(/\n+/g, " ").replace(/\s+/g, " ").trim();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 300_000);

  const res = await fetch(`${API_URL}/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: speechText, language }),
    signal: controller.signal,
  });
  clearTimeout(timeout);

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`MMS TTS server returned ${res.status}: ${errBody || res.statusText}`);
  }

  const audioBuffer = await res.arrayBuffer();
  const file = new UTFile(
    [audioBuffer],
    `lab-report-${reportId}-${language}-${Date.now()}.wav`,
    { type: "audio/wav" }
  );

  const utapi = new UTApi({ token, logLevel: "Error" });
  const result = await utapi.uploadFiles(file, {
    acl: "public-read",
    contentDisposition: "inline",
  });

  if (result.error || !result.data?.ufsUrl) {
    throw new Error(result.error?.message || "Failed to store generated audio.");
  }

  return result.data.ufsUrl;
}
