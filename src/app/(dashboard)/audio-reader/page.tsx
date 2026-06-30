import { db } from "@/db";
import { reports } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/current-user";
import { redirect } from "next/navigation";
import AudioReaderDashboard from "@/components/AudioReaderDashboard";

export const metadata = {
  title: "Audio Reader — WazobiaCare Nigeria",
  description: "Listen to your medical laboratory results translated in local dialects.",
};

type Props = {
  searchParams: Promise<{ reportId?: string }>;
};

export default async function AudioReaderPage({ searchParams }: Props) {
  const { reportId } = await searchParams;
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");
  if (!user.profileCompleted) redirect("/complete-profile");

  const completedReports = await db.query.reports.findMany({
    where: and(eq(reports.userId, user.id), eq(reports.status, "completed")),
    orderBy: [desc(reports.createdAt)],
  });

  const activeReport = reportId
    ? completedReports.find((r) => r.id === reportId)
    : completedReports[0];

  return (
    <div className="space-y-6 fade-in text-foreground">
      <AudioReaderDashboard
        reports={completedReports.map((r) => ({
          id: r.id,
          fileName: r.fileName,
          createdAt: r.createdAt.toISOString(),
          englishResult: r.englishResult || "",
          yorubaResult: r.yorubaResult || "",
          hausaResult: r.hausaResult || "",
          igboResult: r.igboResult || "",
          yorubaAudioUrl: r.yorubaAudioUrl,
          hausaAudioUrl: r.hausaAudioUrl,
          igboAudioUrl: r.igboAudioUrl,
        }))}
        defaultReportId={activeReport?.id}
        preferredLanguage={user.preferredLanguage}
      />
    </div>
  );
}
