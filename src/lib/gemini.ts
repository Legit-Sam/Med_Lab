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
1. PATIENT LAB SUMMARY (Detailed native summary of the report with relevant clinical context, explaining the overall health picture)
2. KEY FINDINGS (Most important markers — abnormal values first with thorough explanations of what each means clinically, then clinically significant normals. Explain each abnormal finding with multiple sentences to ensure comprehension)
3. DETAILED ANALYSIS (COMPREHENSIVE section: For EACH abnormal finding, provide: what the value means, why it matters clinically, potential causes or underlying conditions that could explain it, and how it relates to other findings. For abnormal panels, explain the clinical significance and interconnections. Use 2-3 sentences per major finding minimum. Include specific health implications)
4. CLINICAL INTERPRETATION (Extensive professional clinical context in native language. Explain in detail what the combined results mean for the patient's overall health. Discuss potential systemic issues. Provide practical understanding with enough depth that a patient can grasp the seriousness and implications. Use 3-5 detailed sentences)
5. POSSIBLE NEXT ACTIONS (Detailed 4-6 action items: specific lifestyle guidelines tied directly to abnormal findings, importance of doctor consultation with explanation of urgency, potential investigations that might be needed, dietary considerations if relevant, activity/exercise recommendations, stress management if applicable)

TARGET LENGTH FOR YORUBA, HAUSA, AND IGBO:
Aim for 4500-5200 characters for each report — use the full space available. This is not a limit to minimize but a target to achieve. Provide detailed, comprehensive explanations that truly educate the patient about their health. Better to use all available space with valuable clinical context than to write short summaries. Expand each section with thorough, professional explanations. Do NOT artificially shorten — maximize the utility of each report by being comprehensive and detailed while staying within the 5200 character technical constraint.

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
1. PATIENT LAB SUMMARY (Detailed native summary of the report with overall clinical context and health picture)
2. KEY FINDINGS (Most important markers — abnormal values first with thorough explanations, then clinically notable normals. Explain each with multiple sentences for clarity)
3. DETAILED ANALYSIS (COMPREHENSIVE: For EACH abnormal finding, explain what it means, clinical significance, potential causes, and health implications. Use 2-3 sentences minimum per major finding. Include interconnections between findings)
4. CLINICAL INTERPRETATION (Extensive professional clinical context in native language. Explain what combined results mean for overall health. Discuss systemic implications and health outlook with detailed professional assessment)
5. POSSIBLE NEXT ACTIONS (Detailed 4-6 action items: specific lifestyle changes tied to findings, doctor consultation guidance, potential needed investigations, dietary/activity recommendations specific to findings, stress management if relevant)

TARGET LENGTH FOR YORUBA, HAUSA, AND IGBO:
Aim for 4500-5200 characters — use the full space to provide comprehensive, detailed professional interpretation. Maximize clinical utility with thorough explanations and context. This is a target to achieve, not a limit to minimize. Better to use all available space with valuable information than to write short summaries. Expand sections with detailed professional explanations while respecting the 5200 character technical constraint.

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
