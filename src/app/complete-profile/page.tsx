import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import { getCurrentDbUser } from "@/lib/current-user";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Complete Profile - WazobiaCare Nigeria",
};

export default async function CompleteProfilePage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");
  if (user.profileCompleted) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-accent">Profile required</p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">
            Complete your medical profile
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            This helps personalize explanations, language preferences, and regional health context before you use the medical AI system.
          </p>
        </div>

        <Card className="p-4 sm:p-6">
          <ProfileForm />
        </Card>
      </div>
    </main>
  );
}
