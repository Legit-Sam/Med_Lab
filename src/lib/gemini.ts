import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import type { AnalysisResult } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const GEMINI_MAX_ATTEMPTS = 3;
const GEMINI_RETRY_TIME_BUDGET_MS = 20_000;

const ANALYSIS_PROMPT = `You are a professional medical laboratory report interpretation assistant.

Your role is to analyze lab results and present them in a clear, structured, clinically styled format. You are not a doctor and must not provide medical diagnosis or treatment prescriptions. Present information in a professional medical reporting tone similar to a hospital lab interpretation system.

CORE OBJECTIVE:
- Transform raw lab results into structured clinical interpretation
- Explain values clearly with context and practical meaning
- Identify abnormal findings when reference ranges or flags are provided
- Explain contextual meaning of results thoroughly (what they mean for health, potential causes)
- Suggest practical, detailed, and actionable next steps
- For non-English languages (5200 char limit): Use the expanded space to provide more detailed explanations, clinical context, and health guidance that helps users truly understand their results, not just list facts

TONE AND STYLE:
- Professional, clinical, and factual
- Clear and structured like a hospital report
- No casual or conversational language
- No slang or informal expressions
- Direct and precise communication

MANDATORY STRUCTURE FOR ENGLISH:
1. PATIENT LAB SUMMARY
2. KEY FINDINGS
3. DETAILED ANALYSIS
4. CLINICAL INTERPRETATION
5. POSSIBLE NEXT ACTIONS
6. CLARIFICATIONS (IF NEEDED)

MANDATORY STRUCTURE FOR YORUBA, HAUSA, AND IGBO:
1. PATIENT LAB SUMMARY (Brief native summary of the report with relevant clinical context)
2. KEY FINDINGS (Most important markers — abnormal values first with explanations, then clinically significant normals)
3. DETAILED ANALYSIS (Explain all abnormal findings with what they mean in native language. Include clinical significance and potential causes where appropriate. Provide context for any borderline results)
4. CLINICAL INTERPRETATION (Professional clinical context in native language with practical understanding of what results mean for the patient's health)
5. POSSIBLE NEXT ACTIONS (Detailed 3-5 general lifestyle guidelines specific to findings, plus clear guidance on doctor consultation importance in local dialect)

HARD LENGTH LIMIT FOR YORUBA, HAUSA, AND IGBO:
Each of these three reports MUST be 5200 characters or fewer, counted including spaces and punctuation. This is a strict technical constraint, not a stylistic preference — if you cannot fit all five sections within 5200 characters, you MUST summarize more aggressively and omit minor/normal findings rather than exceed the limit. Prioritize abnormal findings and actionable interpretation over completeness. Before finalizing each of these three reports, mentally count their length and shorten if over 5200 characters. Aim for detailed but concise explanations with thorough context that help readers understand their lab results comprehensively.

FORMATTING CONSTRAINTS:
- Do NOT output any markdown bolding like "**" or "* **" in ANY language. Use clean, plain text formatting. All output must be written without double asterisks.

MEDICAL SAFETY RULES:
- Do not diagnose diseases
- Do not prescribe medication or treatment
- Do not claim certainty about medical conditions
- Do not replace professional healthcare providers
- Avoid alarming or emotional wording
- Use neutral clinical wording

DATA HANDLING RULES:
- Use only the provided lab data
- Do not assume missing values
- Do not hallucinate reference ranges
- If reference ranges are not provided, state that interpretation is limited
- Clearly indicate when data is insufficient or unclear

You will analyze the provided lab result text and return professional structured reports in ALL FOUR languages below.

Return your response as a valid JSON object with exactly these four keys:
{
  "english": "...",
  "yoruba": "...",
  "hausa": "...",
  "igbo": "..."
}

Each value must be a single structured report using the mandatory section headings above.

For the Yoruba report: Use formal professional Yoruba.
For the Hausa report: Use formal professional Hausa.
For the Igbo report: Use formal professional Igbo.
For the English report: Use professional clinical English.

Here is the lab result to analyze:`;

export async function analyzeLabResult(
  extractedText: string
): Promise<AnalysisResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `${ANALYSIS_PROMPT}\n\n${extractedText}\n\nReturn ONLY the JSON object, no markdown, no extra text.`;

  const result = await generateContentWithRetry(() => model.generateContent(prompt));
  const response = await result.response;
  const text = response.text();

  const parsed = parseGeminiJson<AnalysisResult>(text);

  // Validate all keys exist
  if (!parsed.english || !parsed.yoruba || !parsed.hausa || !parsed.igbo) {
    throw new Error("Incomplete AI response — missing language keys");
  }

  // Clean the text results programmatically
  parsed.english = cleanTextResult(parsed.english);
  parsed.yoruba = enforceLengthLimit(cleanTextResult(parsed.yoruba), NON_ENGLISH_MAX_CHARS);
  parsed.hausa = enforceLengthLimit(cleanTextResult(parsed.hausa), NON_ENGLISH_MAX_CHARS);
  parsed.igbo = enforceLengthLimit(cleanTextResult(parsed.igbo), NON_ENGLISH_MAX_CHARS);

  return parsed;
}

export async function analyzeLabImage(
  imageUrl: string,
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif"
): Promise<{ extractedText: string; analysis: AnalysisResult }> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  // Fetch the image and convert to base64
  const imageResponse = await fetch(imageUrl);
  const imageBuffer = await imageResponse.arrayBuffer();
  const base64Image = Buffer.from(imageBuffer).toString("base64");

  const imagePart: Part = {
    inlineData: {
      data: base64Image,
      mimeType,
    },
  };

  const extractionPrompt = `You are a professional medical laboratory report interpretation assistant.

First, extract ALL text from this medical lab result image exactly as written, preserving all values, units, flags, and reference ranges. Then analyze the results.

Return a valid JSON object with exactly these five keys:
{
  "extractedText": "all the raw text from the image",
  "english": "professional clinical report in English",
  "yoruba": "professional clinical report in Yoruba",
  "hausa": "professional clinical report in Hausa",
  "igbo": "professional clinical report in Igbo"
}

MANDATORY STRUCTURE FOR ENGLISH REPORT:
1. PATIENT LAB SUMMARY
2. KEY FINDINGS
3. DETAILED ANALYSIS
4. CLINICAL INTERPRETATION
5. POSSIBLE NEXT ACTIONS
6. CLARIFICATIONS (IF NEEDED)

MANDATORY STRUCTURE FOR YORUBA, HAUSA, AND IGBO REPORTS:
1. PATIENT LAB SUMMARY (Brief native summary of the report)
2. KEY FINDINGS (Most important markers only — abnormal values first, then any clinically notable normals)
3. DETAILED ANALYSIS (Only parameters that are abnormal or clinically significant — do not list every normal parameter individually)
4. CLINICAL INTERPRETATION (Concise professional clinical context in native language)
5. POSSIBLE NEXT ACTIONS (2-3 general lifestyle guidelines and doctor consultation advice in local dialect)

HARD LENGTH LIMIT FOR YORUBA, HAUSA, AND IGBO:
Each of these three reports MUST be 5200 characters or fewer, counted including spaces and punctuation. This is a strict technical constraint, not a stylistic preference — if you cannot fit all five sections within 5200 characters, you MUST summarize more aggressively and omit minor/normal findings rather than exceed the limit. Prioritize abnormal findings and actionable interpretation over completeness. Before finalizing each of these three reports, mentally count their length and shorten if over 5200 characters. Aim for detailed but concise explanations with thorough context that help readers understand their lab results comprehensively.

FORMATTING CONSTRAINTS:
- Do NOT output any markdown bolding like "**" or "* **" in ANY language. Use clean, plain text formatting. All output must be written without double asterisks.

TONE AND STYLE:
- Professional, clinical, factual, and structured
- No casual, conversational, slang, or toy-like language
- Direct and precise communication

MEDICAL SAFETY RULES:
- Do not diagnose diseases
- Do not prescribe medication or treatment
- Do not claim certainty about medical conditions
- Avoid alarming or emotional wording
- Use neutral clinical wording

DATA HANDLING RULES:
- Use only the provided lab data
- Do not assume missing values
- Do not hallucinate reference ranges
- If reference ranges are not visible or provided, state that interpretation is limited
- Clearly identify abnormal values only when supported by provided ranges, flags, or widely explicit lab notation

Return ONLY the JSON object, no markdown fences, no extra text.`;

  const result = await generateContentWithRetry(() =>
    model.generateContent([extractionPrompt, imagePart])
  );
  const response = await result.response;
  const text = response.text();

  const parsed = parseGeminiJson<{
    extractedText: string;
    english: string;
    yoruba: string;
    hausa: string;
    igbo: string;
  }>(text);

  return {
    extractedText: parsed.extractedText || "",
    analysis: {
      english: cleanTextResult(parsed.english || ""),
      yoruba: enforceLengthLimit(cleanTextResult(parsed.yoruba || ""), NON_ENGLISH_MAX_CHARS),
      hausa: enforceLengthLimit(cleanTextResult(parsed.hausa || ""), NON_ENGLISH_MAX_CHARS),
      igbo: enforceLengthLimit(cleanTextResult(parsed.igbo || ""), NON_ENGLISH_MAX_CHARS),
    },
  };
}

function parseGeminiJson<T>(text: string): T {
  const jsonText = extractJsonObject(text);

  try {
    return JSON.parse(jsonText) as T;
  } catch (error) {
    const repaired = repairInvalidJsonEscapes(jsonText);
    try {
      return JSON.parse(repaired) as T;
    } catch {
      throw error;
    }
  }
}

function extractJsonObject(text: string) {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Invalid AI response format");
  }

  return trimmed.slice(start, end + 1);
}

function repairInvalidJsonEscapes(jsonText: string) {
  return jsonText.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");
}

async function generateContentWithRetry<T>(operation: () => Promise<T>) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt += 1) {
    const attemptStartedAt = Date.now();
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const elapsedMs = Date.now() - attemptStartedAt;
      if (!isRetryableGeminiError(error) || attempt === GEMINI_MAX_ATTEMPTS) {
        break;
      }
      if (elapsedMs > GEMINI_RETRY_TIME_BUDGET_MS) {
        break;
      }

      await wait(1500 * attempt);
    }
  }

  if (isRetryableGeminiError(lastError)) {
    throw new Error(
      "Gemini is temporarily busy. Please try analyzing this report again in a few minutes."
    );
  }

  throw lastError;
}

function isRetryableGeminiError(error: unknown) {
  if (!(error instanceof Error)) return false;

  const status = (error as Error & { status?: number }).status;
  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    /high demand|service unavailable|temporarily/i.test(error.message)
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const NON_ENGLISH_MAX_CHARS = 5200;

function enforceLengthLimit(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;

  const truncated = text.slice(0, maxChars);
  const lastBoundary = Math.max(
    truncated.lastIndexOf(". "),
    truncated.lastIndexOf(".\n"),
    truncated.lastIndexOf("? "),
    truncated.lastIndexOf("! ")
  );

  const result =
    lastBoundary > maxChars * 0.7
      ? truncated.slice(0, lastBoundary + 1).trim()
      : truncated.trim();

  console.warn(
    `[gemini] Truncated text from ${text.length} to ${result.length} chars (max ${maxChars})`
  );

  return result;
}

function cleanTextResult(text: unknown): string {
  if (typeof text !== "string" || !text) return "";
  return text
    // Replace double asterisks (markdown bold) with nothing
    .replace(/\*\*/g, "")
    // Replace markdown headers (e.g., ###, ##, #) at the start of a line with nothing
    .replace(/^#+\s+/gm, "")
    // Normalize lists starting with * or • to - for standard rendering
    .replace(/^[•*]\s*/gm, "- ")
    .trim();
}
