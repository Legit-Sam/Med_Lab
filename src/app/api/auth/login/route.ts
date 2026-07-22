import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";
import { createRequestId, getErrorMessage } from "@/lib/api-errors";
import { checkRateLimit, rateLimitExceeded } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const requestId = createRequestId();

  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rateCheck = await checkRateLimit(`login:${ip}`, "login");
    if (!rateCheck.allowed) {
      return rateLimitExceeded("login");
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    await createSession(user.id);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          profileCompleted: user.profileCompleted,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", requestId, getErrorMessage(error));
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
