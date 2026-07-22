#!/usr/bin/env node
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { createInterface } from "readline";

// Load .env.local
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

const sql = neon(process.env.DATABASE_URL!);
const rl = createInterface({ input: process.stdin, output: process.stdout });

async function prompt() {
  rl.question("db> ", async (input) => {
    const q = input.trim();
    if (!q) return prompt();
    if (q === ".exit" || q === ".quit") return rl.close();
    if (q === ".tables") {
      const rows = await sql`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' ORDER BY table_name
      `;
      console.log(rows.map((r) => `  ${r.table_name}`).join("\n"));
      return prompt();
    }

    try {
      const rows = await sql.unsafe(q);
      console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
    }
    prompt();
  });
}

console.log("Drizzle DB shell — connected to Neon.");
console.log("Commands: .tables  .exit\n");
prompt();
