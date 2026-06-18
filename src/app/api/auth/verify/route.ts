import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions } from "@/db/schema";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    if (!token) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const [session] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.token, token),
          gt(sessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!session) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({ valid: true }, { status: 200 });
  } catch {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
