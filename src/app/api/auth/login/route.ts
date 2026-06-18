import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/password";
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
    console.error("Login error:", { requestId, error });
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? "Login failed. Please try again."
            : getErrorMessage(error),
        requestId,
      },
      { status: 500 }
    );
  }
}
