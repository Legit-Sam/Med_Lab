import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

type RateLimitConfig = {
  maxRequests: number;
  windowSeconds: number;
};

const DEFAULTS: Record<string, RateLimitConfig> = {
  analyze: { maxRequests: 20, windowSeconds: 3600 },
  login: { maxRequests: 5, windowSeconds: 300 },
  register: { maxRequests: 3, windowSeconds: 3600 },
};

export async function checkRateLimit(
  identifier: string,
  action: string
): Promise<{ allowed: boolean }> {
  const config = DEFAULTS[action] || { maxRequests: 20, windowSeconds: 3600 };
  const sql = neon(process.env.DATABASE_URL!);

  await sql`
    CREATE TABLE IF NOT EXISTS rate_limits (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      identifier text NOT NULL,
      action text NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL
    )
  `;

  await sql`
    DELETE FROM rate_limits WHERE created_at < now() - interval '1 day'
  `;

  const cutoff = new Date(Date.now() - config.windowSeconds * 1000).toISOString();

  const [row] = await sql`
    SELECT COUNT(*)::int as count
    FROM rate_limits
    WHERE identifier = ${identifier}
      AND action = ${action}
      AND created_at > ${cutoff}::timestamptz
  `;

  if (row.count >= config.maxRequests) {
    return { allowed: false };
  }

  await sql`
    INSERT INTO rate_limits (identifier, action) VALUES (${identifier}, ${action})
  `;

  return { allowed: true };
}

export function rateLimitExceeded(action: string) {
  return NextResponse.json(
    {
      error: `Too many requests. Please try again later.`,
      action,
    },
    { status: 429 }
  );
}
