import DashboardShell from "@/components/DashboardShell";
import { getCurrentDbUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");
  if (!user.profileCompleted) redirect("/complete-profile");

  return (
    <DashboardShell user={{ fullName: user.fullName, email: user.email }}>
      {children}
    </DashboardShell>
  );
}
