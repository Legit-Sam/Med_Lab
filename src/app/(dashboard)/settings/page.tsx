import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/current-user";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Settings, CheckCircle2 } from "lucide-react";
import SettingsForm from "@/components/SettingsForm";

export const metadata = {
  title: "Settings — WazobiCare Nigeria",
};

export default async function SettingsPage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");
  if (!user.profileCompleted) redirect("/complete-profile");

  async function updateSettings(preferredLanguage: "english" | "yoruba" | "hausa" | "igbo") {
    "use server";
    const user = await getCurrentDbUser();
    if (!user) return;

    await db
      .update(users)
      .set({ preferredLanguage })
      .where(eq(users.id, user.id));

    revalidatePath("/settings");
    revalidatePath("/dashboard");
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto fade-in text-foreground">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent text-primary flex items-center justify-center">
            <Settings className="w-4.5 h-4.5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Account Settings
          </h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Configure translation options, audio settings, and language preferences.
        </p>
      </div>

      {/* Settings Options Box */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <SettingsForm
          initialLanguage={user.preferredLanguage}
          onSave={updateSettings}
        />
      </div>
    </div>
  );
}
