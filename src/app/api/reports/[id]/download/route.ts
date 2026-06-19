import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reports } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { generateReportPdf } from "@/lib/pdf-generator";
import { format } from "date-fns";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, { params }: Props) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report = await db.query.reports.findFirst({
    where: and(eq(reports.id, id), eq(reports.userId, user.id)),
  });

  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    report.status !== "completed" ||
    !report.englishResult ||
    !report.yorubaResult ||
    !report.hausaResult ||
    !report.igboResult
  ) {
    return NextResponse.json({ error: "Report not ready" }, { status: 400 });
  }

  const pdfBytes = await generateReportPdf({
    userName: user.fullName || user.name || user.email,
    userEmail: user.email,
    reportName: report.fileName || "Lab Result",
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
      "Content-Disposition": `attachment; filename="${encodeURIComponent(user.fullName || user.name || user.email)}'s Clinical Report.pdf"`,
      "Content-Length": pdfBytes.length.toString(),
    },
  });
}
