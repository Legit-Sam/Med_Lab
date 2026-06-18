"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentDbUser } from "@/lib/current-user";
import {
  ProfileFormErrors,
  validateProfileForm,
} from "@/lib/profile-validation";

export type CompleteProfileState = {
  errors?: ProfileFormErrors;
  message?: string;
};

export async function completeProfile(
  _state: CompleteProfileState,
  formData: FormData
): Promise<CompleteProfileState> {
  const user = await getCurrentDbUser();
  if (!user) {
    return { message: "Sign in before completing your profile." };
  }

  if (user.profileCompleted) {
    redirect("/dashboard");
  }

  const result = validateProfileForm(formData);
  if (!result.success) {
    return { errors: result.errors };
  }

  await db
    .update(users)
    .set({
      fullName: result.data.fullName,
      name: result.data.fullName,
      phoneNumber: result.data.phoneNumber,
      dateOfBirth: result.data.dateOfBirth,
      country: result.data.country,
      state: result.data.state,
      lga: result.data.lga,
      address: result.data.address,
      gender: result.data.gender,
      occupation: result.data.occupation,
      preferredLanguage: result.data.preferredLanguage,
      profileCompleted: true,
    })
    .where(eq(users.id, user.id));

  redirect("/dashboard");
}
