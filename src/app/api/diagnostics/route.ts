import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { createRequestId, getErrorMessage } from "@/lib/api-errors";

export const dynamic = "force-dynamic";

const envChecks = [
  "DATABASE_URL",
  "GEMINI_API_KEY",
  "UPLOADTHING_TOKEN",
  "ELEVENLABS_API_KEY",
] as const;

export async function GET() {
  const requestId = createRequestId();

  const env = Object.fromEntries(
    envChecks.map((key) => [key, Boolean(process.env[key])])
  );

  let database:
    | { ok: true }
    | { ok: false; error: string };

  try {
    await db.execute(sql`select 1`);
    database = { ok: true };
  } catch (error) {
    database = { ok: false, error: getErrorMessage(error) };
  }

  return NextResponse.json({
    ok: Object.values(env).every(Boolean) && database.ok,
    requestId,
    runtime: process.env.NETLIFY ? "netlify" : "unknown",
    env,
    database,
  });
}
