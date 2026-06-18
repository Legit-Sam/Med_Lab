import "server-only";

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { UTApi, UTFile } from "uploadthing/server";

export type ElevenLabsLanguage = "yoruba" | "hausa" | "igbo";

const DEFAULT_MULTILINGUAL_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";

const languageLabel: Record<ElevenLabsLanguage, string> = {
  yoruba: "Yoruba",
  hausa: "Hausa",
  igbo: "Igbo",
};

export async function generateAndStoreSpeech({
  reportId,
  language,
  text,
}: {
  reportId: string;
  language: ElevenLabsLanguage;
  text: string;
}) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ELEVENLABS_API_KEY environment variable.");
  }

  const uploadthingToken = process.env.UPLOADTHING_TOKEN;
  if (!uploadthingToken) {
    throw new Error("Missing UPLOADTHING_TOKEN environment variable.");
  }

  const voiceId =
    process.env.ELEVENLABS_MULTILINGUAL_VOICE_ID || DEFAULT_MULTILINGUAL_VOICE_ID;

  const elevenlabs = new ElevenLabsClient({ apiKey });
  const audio = await elevenlabs.textToSpeech.convert(voiceId, {
    text: buildSpeechText(language, text),
    modelId: "eleven_v3",
    outputFormat: "mp3_44100_128",
  });

  const audioBuffer = await new Response(audio).arrayBuffer();
  const file = new UTFile(
    [audioBuffer],
    `lab-report-${reportId}-${language}-${Date.now()}.mp3`,
    { type: "audio/mpeg" }
  );

  const utapi = new UTApi({ token: uploadthingToken, logLevel: "Error" });
  const uploadResult = await utapi.uploadFiles(file, {
    acl: "public-read",
    contentDisposition: "inline",
  });

  if (uploadResult.error || !uploadResult.data?.ufsUrl) {
    throw new Error(uploadResult.error?.message || "Failed to store generated audio.");
  }

  return uploadResult.data.ufsUrl;
}

function buildSpeechText(language: ElevenLabsLanguage, text: string) {
  return `Read the following ${languageLabel[language]} clinical lab interpretation clearly and professionally. Preserve the section structure.\n\n${text}`;
}
