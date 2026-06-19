import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, reports } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/current-user";
import { generateReportPdf } from "@/lib/pdf-generator";
import { format } from "date-fns";

export async function GET() {
  const user = await getCurrentDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const demoUser = await db.query.users.findFirst({
    where: eq(users.email, "clintone2167@gmail.com"),
  });
  if (!demoUser) {
    return NextResponse.json({ error: "Demo report not found" }, { status: 404 });
  }

  const report = await db.query.reports.findFirst({
    where: eq(reports.userId, demoUser.id),
    orderBy: [desc(reports.createdAt)],
  });

  if (
    !report ||
    report.status !== "completed" ||
    !report.englishResult ||
    !report.yorubaResult ||
    !report.hausaResult ||
    !report.igboResult
  ) {
    return NextResponse.json({ error: "Demo report not ready" }, { status: 400 });
  }

  const pdfBytes = await generateReportPdf({
    userName: "Demo Patient",
    userEmail: user.email,
    reportName: report.fileName || "Demo Lab Report",
    reportDate: format(new Date(report.createdAt), "MMMM d, yyyy"),
    english: report.englishResult,
    yoruba: report.yorubaResult,
    hausa: report.hausaResult,
    igbo: report.igboResult,
    extractedText: report.extractedText ?? undefined,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(user.fullName || user.name || user.email)}'s Demo Clinical Report.pdf"`,
      "Content-Length": pdfBytes.length.toString(),
    },
  });
}
