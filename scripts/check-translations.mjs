import { readFileSync } from "fs";
import { neon } from "@neondatabase/serverless";

try {
  const env = readFileSync(".env.local", "utf-8");
  for (const line of env.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
} catch {}

const sql = neon(process.env.DATABASE_URL);
const rows = await sql`SELECT language, COUNT(*)::int as cnt FROM ui_translations GROUP BY language ORDER BY language`;
console.log(JSON.stringify(rows, null, 2));
