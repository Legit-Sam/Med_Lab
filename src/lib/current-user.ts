import "server-only";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function getCurrentDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses.find(
      (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId
    )?.emailAddress;

  if (!email) {
    throw new Error("Authenticated Clerk user does not have a primary email.");
  }

  const [user] = await db
    .insert(users)
    .values({
      clerkId: clerkUser.id,
      email,
      preferredLanguage: "english",
      profileCompleted: false,
    })
    .onConflictDoUpdate({
      target: users.clerkId,
      set: { email },
    })
    .returning();

  return user;
}

export async function findCurrentDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  return db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });
}
