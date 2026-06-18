import { cleanOcrText } from "./cleanOcr";
import { analyzeLabImage, analyzeLabResult } from "./gemini";
import type { AnalysisResult } from "@/types";

type OcrResult = {
  extractedText: string;
  analysis: AnalysisResult;
};

const IMAGE_MIME_TYPES: Record<
  string,
  "image/jpeg" | "image/png" | "image/webp" | "image/gif"
> = {
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp",
  "image/gif": "image/gif",
};

export async function processLabFile(
  fileUrl: string,
  fileType: string
): Promise<OcrResult> {
  const lowerType = fileType.toLowerCase();

  // Handle PDF files
  if (lowerType === "application/pdf" || lowerType.endsWith(".pdf")) {
    return await processPdf(fileUrl);
  }

  // Handle image files
  const mimeType = IMAGE_MIME_TYPES[lowerType];
  if (mimeType) {
    return await processImage(fileUrl, mimeType);
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}

async function processPdf(fileUrl: string): Promise<OcrResult> {
  // Download PDF
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const pdfBuffer = Buffer.from(buffer);

  // pdf-parse v2 is a CJS module — require it directly
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse") as (
    buffer: Buffer
  ) => Promise<{ text: string; numpages: number }>;
  const data = await pdfParse(pdfBuffer);

  const rawText = data.text;

  if (!rawText || rawText.trim().length < 10) {
    // PDF might be image-based (scanned), fall back to Gemini vision
    // We'll treat the PDF URL as an image via Gemini
    throw new Error(
      "PDF appears to be image-based. Please upload as an image (JPG/PNG) instead."
    );
  }

  const extractedText = cleanOcrText(rawText);
  const analysis = await analyzeLabResult(extractedText);

  return { extractedText, analysis };
}

async function processImage(
  fileUrl: string,
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif"
): Promise<OcrResult> {
  const result = await analyzeLabImage(fileUrl, mimeType);
  result.extractedText = cleanOcrText(result.extractedText);
  return result;
}
