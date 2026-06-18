import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Language } from "@/types";
import { getCurrentDbUser } from "@/lib/current-user";

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!user.profileCompleted) {
      return NextResponse.json(
        { error: "Complete your profile before updating preferences." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { preferredLanguage } = body as { preferredLanguage: Language };

    if (!["english", "yoruba", "hausa", "igbo"].includes(preferredLanguage)) {
      return NextResponse.json(
        { error: "Invalid language" },
        { status: 400 }
      );
    }

    const [updatedUser] = await db
      .update(users)
      .set({ preferredLanguage })
      .where(eq(users.id, user.id))
      .returning();

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("User update API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("User API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
