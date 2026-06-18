import "server-only";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

import { cookies } from "next/headers";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import type { SelectUser } from "@/db/schema";

const SESSION_COOKIE = "session_token";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function createSession(userId: string): Promise<string> {
  const { randomUUID } = await import("crypto");
  const token = randomUUID();

  await db.insert(sessions).values({
    userId,
    token,
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });

  return token;
}

export async function getCurrentUser(): Promise<SelectUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

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

  if (!session) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return user ?? null;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
    cookieStore.delete(SESSION_COOKIE);
  }
}

export async function requireUser(): Promise<SelectUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
