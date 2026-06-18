import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reports } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/current-user";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!user.profileCompleted) {
      return NextResponse.json(
        { error: "Complete your profile before viewing reports." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const report = await db.query.reports.findFirst({
      where: and(eq(reports.id, id), eq(reports.userId, user.id)),
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ report }, { status: 200 });
  } catch (error) {
    console.error("Report detail API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!user.profileCompleted) {
      return NextResponse.json(
        { error: "Complete your profile before deleting reports." },
        { status: 403 }
      );
    }

    const { id } = await params;

    await db
      .delete(reports)
      .where(and(eq(reports.id, id), eq(reports.userId, user.id)));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete report API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
