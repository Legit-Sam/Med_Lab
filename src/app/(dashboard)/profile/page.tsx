import { db } from "@/db";
import { users, languageEnum, genderEnum } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/current-user";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  User,
  MapPin,
  PhoneCall,
  Save,
  CheckCircle,
  Activity,
  Award,
} from "lucide-react";
import ProfileEditForm from "@/components/ProfileEditForm";

export const metadata = {
  title: "User Profile — WazobiCare Nigeria",
};

export default async function ProfilePage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");
  if (!user.profileCompleted) redirect("/complete-profile");

  // Server Action to update profile
  async function updateProfile(formData: FormData) {
    "use server";
    const user = await getCurrentDbUser();
    if (!user) return;

    const fullName = formData.get("fullName") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const gender = formData.get("gender") as "male" | "female" | "prefer_not_to_say" | null;
    const country = formData.get("country") as string;
    const state = formData.get("state") as string;
    const lga = formData.get("lga") as string;
    const address = formData.get("address") as string;
    const occupation = formData.get("occupation") as string;
    const preferredLanguage = formData.get("preferredLanguage") as "english" | "yoruba" | "hausa" | "igbo" | null;

    await db
      .update(users)
      .set({
        fullName,
        name: fullName,
        phoneNumber,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        country,
        state,
        lga,
        address,
        occupation,
        preferredLanguage: preferredLanguage || "english",
      })
      .where(eq(users.id, user.id));

    revalidatePath("/profile");
    revalidatePath("/dashboard");
  }

  const displayName = user.fullName || user.email.split("@")[0];

  return (
    <div className="space-y-6 fade-in text-foreground">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent text-primary flex items-center justify-center">
            <User className="w-4.5 h-4.5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            User Profile
          </h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Manage your personal medical profile, location settings, and contact information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Card: Overview Card */}
        <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-accent text-primary border border-primary/20 flex items-center justify-center font-bold text-2xl uppercase shadow-sm">
              {displayName.slice(0, 2)}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-foreground">{displayName}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-[10px] font-semibold">
              <Award className="w-3.5 h-3.5" />
              Verified Patient
            </div>
          </div>

          <div className="border-t border-border/60 pt-4 text-left space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4.5 h-4.5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Location
                </p>
                <p className="text-xs font-semibold text-foreground">
                  {user.lga}, {user.state}, {user.country}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <PhoneCall className="w-4.5 h-4.5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Phone Number
                </p>
                <p className="text-xs font-semibold text-foreground">
                  {user.phoneNumber || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Activity className="w-4.5 h-4.5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Preferred Dialect
                </p>
                <p className="text-xs font-semibold text-foreground capitalize">
                  {user.preferredLanguage}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Edit Profile Form */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <ProfileEditForm user={user} onSave={updateProfile} />
        </div>
      </div>
    </div>
  );
}
