import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { uiTranslations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { readFileSync } from "fs";
import { join } from "path";
import type { Language } from "@/types";

const TTL_MS = 10 * 60 * 1000; // 10 minutes

type TranslationMap = Record<string, string>;

let cache: {
  data: Record<string, TranslationMap> | null;
  fetchedAt: number;
} = { data: null, fetchedAt: 0 };

function makeSql() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql, { schema: { uiTranslations } });
}

export async function loadAllTranslations(): Promise<Record<string, TranslationMap>> {
  const now = Date.now();
  if (cache.data && now - cache.fetchedAt < TTL_MS) {
    return cache.data;
  }

  const db = makeSql();
  const rows = await db.select().from(uiTranslations);

  if (rows.length === 0) {
    const fallback = loadFallbackEnglish();
    cache = { data: { english: fallback, yoruba: {}, hausa: {}, igbo: {} }, fetchedAt: now };
    return cache.data!;
  }

  const grouped: Record<string, TranslationMap> = {
    english: {},
    yoruba: {},
    hausa: {},
    igbo: {},
  };

  for (const row of rows) {
    const lang = row.language as string;
    if (!grouped[lang]) grouped[lang] = {};
    grouped[lang][row.key] = row.value;
  }

  cache = { data: grouped, fetchedAt: now };
  return cache.data!;
}

export function invalidateTranslationCache() {
  cache = { data: null, fetchedAt: 0 };
}

function loadFallbackEnglish(): TranslationMap {
  function flatten(obj: Record<string, unknown>, prefix = ""): TranslationMap {
    const result: TranslationMap = {};
    for (const [key, val] of Object.entries(obj)) {
      const k = prefix ? `${prefix}.${key}` : key;
      if (val && typeof val === "object" && !Array.isArray(val)) {
        Object.assign(result, flatten(val as Record<string, unknown>, k));
      } else {
        result[k] = String(val);
      }
    }
    return result;
  }

  try {
    const raw = JSON.parse(readFileSync(join(process.cwd(), "scripts", "ui-strings-en.json"), "utf-8"));
    return flatten(raw);
  } catch {
    return {};
  }
}
