import "server-only";
import { db } from "@/db";
import { users, reports } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export type DemoReport = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  englishResult: string;
  yorubaResult: string;
  hausaResult: string;
  igboResult: string;
  extractedText: string | null;
  yorubaAudioUrl: string | null;
  hausaAudioUrl: string | null;
  igboAudioUrl: string | null;
  createdAt: Date;
};

export async function getDemoReport(): Promise<DemoReport | null> {
  const demoUser = await db.query.users.findFirst({
    where: eq(users.email, "clintone2167@gmail.com"),
  });

  if (!demoUser) return null;

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
    return null;
  }

  return {
    id: report.id,
    fileName: report.fileName || "Demo Lab Report",
    fileUrl: report.fileUrl,
    fileType: report.fileType,
    englishResult: report.englishResult,
    yorubaResult: report.yorubaResult,
    hausaResult: report.hausaResult,
    igboResult: report.igboResult,
    extractedText: report.extractedText,
    yorubaAudioUrl: report.yorubaAudioUrl,
    hausaAudioUrl: report.hausaAudioUrl,
    igboAudioUrl: report.igboAudioUrl,
    createdAt: report.createdAt,
  };
}
