import { db } from "@/db";
import { reports } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import ReportList from "@/components/ReportList";
import { getCurrentDbUser } from "@/lib/current-user";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Report History — WazobiaCare Nigeria",
};

export default async function HistoryPage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");
  if (!user.profileCompleted) redirect("/complete-profile");

  const userReports = await db.query.reports.findMany({
    where: eq(reports.userId, user.id),
    orderBy: [desc(reports.createdAt)],
  });

  return (
    <div className="space-y-6 fade-in text-foreground">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent text-primary flex items-center justify-center">
            <FileText className="w-4.5 h-4.5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Report History
          </h1>
        </div>
        <p className="text-xs text-muted-foreground">
          View, search, filter, or delete any of your past laboratory results.
        </p>
      </div>

      {/* Reports List */}
      <Card className="p-6">
        <ReportList
          reports={userReports.map((r) => ({
            ...r,
            fileName: r.fileName || "Lab Result",
          }))}
        />
      </Card>
    </div>
  );
}
