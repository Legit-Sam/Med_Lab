import {
  boolean,
  date,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const languageEnum = pgEnum("language", [
  "english",
  "yoruba",
  "hausa",
  "igbo",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "processing",
  "completed",
  "failed",
]);

export const genderEnum = pgEnum("gender", [
  "male",
  "female",
  "prefer_not_to_say",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  fullName: text("full_name"),
  phoneNumber: text("phone_number"),
  dateOfBirth: date("date_of_birth"),
  country: text("country"),
  state: text("state"),
  lga: text("lga"),
  address: text("address"),
  gender: genderEnum("gender"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  occupation: text("occupation"),
  preferredLanguage: languageEnum("preferred_language").default("english").notNull(),
  profileCompleted: boolean("profile_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  extractedText: text("extracted_text"),
  englishResult: text("english_result"),
  yorubaResult: text("yoruba_result"),
  hausaResult: text("hausa_result"),
  igboResult: text("igbo_result"),
  audioUrl: text("audio_url"),
  yorubaAudioUrl: text("yoruba_audio_url"),
  hausaAudioUrl: text("hausa_audio_url"),
  igboAudioUrl: text("igbo_audio_url"),
  status: reportStatusEnum("status").default("processing").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
export type SelectReport = typeof reports.$inferSelect;
