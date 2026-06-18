import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";
import { createRequestId, getErrorMessage } from "@/lib/api-errors";

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existing = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const [user] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        preferredLanguage: "english",
        profileCompleted: false,
      })
      .returning();

    await createSession(user.id);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          profileCompleted: user.profileCompleted,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", { requestId, error });
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? "Registration failed. Please try again."
            : getErrorMessage(error),
        requestId,
      },
      { status: 500 }
    );
  }
}
