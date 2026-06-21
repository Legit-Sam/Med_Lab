#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { neon } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── 1. Load env ────────────────────────────────────────────────────────
try {
  const envPath = resolve(__dirname, "..", ".env.local");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {}

const DATABASE_URL = process.env.DATABASE_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!DATABASE_URL || !GEMINI_API_KEY) {
  console.error("Both DATABASE_URL and GEMINI_API_KEY required.");
  process.exit(1);
}

const shouldWrite = process.argv.includes("--confirm");

// ─── 2. Load English strings ────────────────────────────────────────────
const enPath = resolve(__dirname, "ui-strings-en.json");
const enSource = JSON.parse(readFileSync(enPath, "utf-8"));

function flatten(obj, prefix = "") {
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    const k = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === "object" && !Array.isArray(val)) {
      Object.assign(result, flatten(val, k));
    } else {
      result[k] = String(val);
    }
  }
  return result;
}

const flatEnglish = flatten(enSource);
const englishEntries = Object.entries(flatEnglish);
console.log(`\nLoaded ${englishEntries.length} English UI strings.\n`);

// ─── 3. Gemini translation ──────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function translateViaGemini(language, flatObj) {
  const keys = Object.keys(flatObj);
  const prompt = `You are translating UI labels for a medical platform. Translate the following English UI strings into formal, professional ${language}.

This is original creative translation work for a software user interface.

IMPORTANT RULES:
- Preserve ALL key names exactly — never change a key.
- Preserve placeholder tokens like {name}, {count}, {year}, {language}, {requestId}, {fileType}, {statusText}, {current}, {total} — leave them exactly as-is.
- Use formal, respectful, professional ${language} appropriate for a healthcare platform.
- Translate the meaning, not word-for-word.
- If a term doesn't have a direct ${language} equivalent, use a clear descriptive phrase.
- Return a valid JSON object with the EXACT same keys.

Here are the keys and English values to translate:

${JSON.stringify(flatObj, null, 2)}`;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
  });

  const text = result.response.text();
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed = JSON.parse(cleaned);

  const missing = keys.filter((k) => !(k in parsed));
  if (missing.length > 0) {
    console.warn(`  Missing ${missing.length} keys in ${language}, falling back to English.`);
    for (const k of missing) {
      parsed[k] = flatObj[k];
    }
  }

  return parsed;
}

// ─── 4. Upsert helpers ──────────────────────────────────────────────────
const sql = neon(DATABASE_URL);

async function upsertLanguage(lang, entries) {
  let upserted = 0;
  let errors = 0;
  for (const [key, value] of Object.entries(entries)) {
    try {
      const existing = await sql`
        SELECT id FROM ui_translations WHERE language = ${lang} AND key = ${key} LIMIT 1
      `;
      if (existing.length > 0) {
        await sql`
          UPDATE ui_translations SET value = ${value}, updated_at = NOW()
          WHERE language = ${lang} AND key = ${key}
        `;
      } else {
        await sql`
          INSERT INTO ui_translations (language, key, value) VALUES (${lang}, ${key}, ${value})
        `;
      }
      upserted++;
    } catch (err) {
      console.error(`  Failed to upsert ${lang}.${key}: ${err.message}`);
      errors++;
    }
  }
  return { upserted, errors };
}

// ─── 5. Translate + save each language immediately ──────────────────────
const languages = ["yoruba", "hausa", "igbo"];
const results = {}; // track for dry-run diff

for (const lang of languages) {
  process.stdout.write(`\nTranslating to ${lang}...`);
  let result;
  try {
    result = await translateViaGemini(lang, flatEnglish);
  } catch (err) {
    console.log(` FAILED`);
    console.error(`  ${err.message}`);
    if (shouldWrite) {
      console.log(`  Skipping ${lang} — previously saved languages are already in DB.`);
    }
    results[lang] = null;
    continue;
  }

  console.log(` done (${Object.keys(result).length} strings).`);

  if (shouldWrite) {
    const { upserted, errors } = await upsertLanguage(lang, result);
    console.log(`  DB: ${upserted} rows written, ${errors} errors.`);
  }

  results[lang] = result;
}

// ─── 6. Print diff summary for successfully translated languages ────────
const hasAny = Object.values(results).some(Boolean);
if (hasAny) {
  console.log("\n" + "=".repeat(100));
  console.log("DIFF SUMMARY");
  console.log("=".repeat(100));
  for (const [key, enVal] of englishEntries) {
    const yor = results.yoruba?.[key];
    const hau = results.hausa?.[key];
    const igb = results.igbo?.[key];
    if (yor || hau || igb) {
      console.log(`\n  ${key}`);
      console.log(`    EN:  ${enVal}`);
      if (yor) console.log(`    YO:  ${yor}`);
      if (hau) console.log(`    HA:  ${hau}`);
      if (igb) console.log(`    IG:  ${igb}`);
    }
  }
  console.log("\n" + "=".repeat(100));
}

if (!shouldWrite) {
  console.log(`\nDry-run complete. No data written.`);
  console.log(`Run with --confirm to save to DB: node scripts/translate-ui.mjs --confirm\n`);
} else {
  const failed = Object.entries(results).filter(([, v]) => !v).map(([k]) => k);
  if (failed.length > 0) {
    console.log(`\nTranslations saved except: ${failed.join(", ")} (Gemini blocked).`);
    console.log(`You can re-run the script — already-saved languages will be skipped (upsert is idempotent).`);
  } else {
    console.log(`\nAll translations saved successfully.`);
  }
}
process.exit(0);
