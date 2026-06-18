import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import type { AnalysisResult } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const GEMINI_MAX_ATTEMPTS = 3;
const GEMINI_RETRY_TIME_BUDGET_MS = 20_000;

const ANALYSIS_PROMPT = `You are a professional medical laboratory report interpretation assistant.

Your role is to analyze lab results and present them in a clear, structured, clinically styled format. You are not a doctor and must not provide medical diagnosis or treatment prescriptions. Present information in a professional medical reporting tone similar to a hospital lab interpretation system.

CORE OBJECTIVE:
- Transform raw lab results into structured clinical interpretation
- Explain values clearly
- Identify abnormal findings when reference ranges or flags are provided
- Explain contextual meaning of results
- Suggest practical, general next actions

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
1. PATIENT LAB SUMMARY (Simplified native summary)
2. KEY FINDINGS (Explain abnormal/critical markers only, omit normal ranges and lists of normal parameters to optimize text length)
3. POSSIBLE NEXT ACTIONS (General lifestyle guidelines and doctor consultation advice in local dialect)

FORMATTING CONSTRAINTS:
- Do NOT output any markdown bolding like "**" or "* **" in ANY language. Use clean, plain text formatting. All output must be written without double asterisks.
- Omit "DETAILED ANALYSIS" in Yoruba, Hausa, and Igbo to keep character counts minimal for text-to-speech engine cost.
- For Yoruba, Hausa, and Igbo, provide a highly condensed, high-level summary only. Omit all detailed parameter lists, reference ranges, and normal findings. Keep the translation extremely brief and summary-oriented (under 100-150 words total). Focus ONLY on the overall status and critical/abnormal findings. Absolutely DO NOT include lists of normal values, details of normal metrics, or long explanations of normal parameters. Keep the language natural but highly concise so that text-to-speech character usage is minimized.

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
  parsed.yoruba = cleanTextResult(parsed.yoruba);
  parsed.hausa = cleanTextResult(parsed.hausa);
  parsed.igbo = cleanTextResult(parsed.igbo);

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
1. PATIENT LAB SUMMARY (Simplified native summary)
2. KEY FINDINGS (Explain abnormal/critical markers only, omit normal ranges and lists of normal parameters to optimize text length)
3. POSSIBLE NEXT ACTIONS (General lifestyle guidelines and doctor consultation advice in local dialect)

FORMATTING CONSTRAINTS:
- Do NOT output any markdown bolding like "**" or "* **" in ANY language. Use clean, plain text formatting. All output must be written without double asterisks.
- Omit "DETAILED ANALYSIS" in Yoruba, Hausa, and Igbo to keep character counts minimal for text-to-speech engine cost.
- For Yoruba, Hausa, and Igbo, provide a highly condensed, high-level summary only. Omit all detailed parameter lists, reference ranges, and normal findings. Keep the translation extremely brief and summary-oriented (under 100-150 words total). Focus ONLY on the overall status and critical/abnormal findings. Absolutely DO NOT include lists of normal values, details of normal metrics, or long explanations of normal parameters. Keep the language natural but highly concise so that text-to-speech character usage is minimized.

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
      yoruba: cleanTextResult(parsed.yoruba || ""),
      hausa: cleanTextResult(parsed.hausa || ""),
      igbo: cleanTextResult(parsed.igbo || ""),
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

function cleanTextResult(text: string): string {
  if (!text) return "";
  return text
    // Replace double asterisks (markdown bold) with nothing
    .replace(/\*\*/g, "")
    // Replace markdown headers (e.g., ###, ##, #) at the start of a line with nothing
    .replace(/^#+\s+/gm, "")
    // Normalize lists starting with * or • to - for standard rendering
    .replace(/^[•*]\s*/gm, "- ")
    .trim();
}
