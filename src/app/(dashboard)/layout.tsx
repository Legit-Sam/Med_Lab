import DashboardShell from "@/components/DashboardShell";
import { getCurrentDbUser } from "@/lib/current-user";
import { redirect } from "next/navigation";
import { loadAllTranslations } from "@/lib/translations";
import { LocaleProvider } from "@/lib/locale-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");
  if (!user.profileCompleted) redirect("/complete-profile");

  const translations = await loadAllTranslations();
  const preferredLanguage = user.preferredLanguage || "english";

  return (
    <LocaleProvider
      initialLocale={preferredLanguage as "english" | "yoruba" | "hausa" | "igbo"}
      translations={translations}
    >
      <DashboardShell user={{ fullName: user.fullName, email: user.email }}>
        {children}
      </DashboardShell>
    </LocaleProvider>
  );
}
