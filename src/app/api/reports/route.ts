import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reports } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/current-user";

export async function GET(req: NextRequest) {
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

    const userReports = await db.query.reports.findMany({
      where: eq(reports.userId, user.id),
      orderBy: [desc(reports.createdAt)],
      columns: {
        id: true,
        fileName: true,
        fileType: true,
        fileUrl: true,
        status: true,
        createdAt: true,
        englishResult: true,
        yorubaResult: true,
        hausaResult: true,
        igboResult: true,
        yorubaAudioUrl: true,
        hausaAudioUrl: true,
        igboAudioUrl: true,
      },
    });

    return NextResponse.json({ reports: userReports }, { status: 200 });
  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
