CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'prefer_not_to_say');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('queued', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."language" AS ENUM('english', 'yoruba', 'hausa', 'igbo');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "analysis_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"status" "job_status" DEFAULT 'queued' NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"failed_at" timestamp,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"extracted_text" text,
	"english_result" text,
	"yoruba_result" text,
	"hausa_result" text,
	"igbo_result" text,
	"audio_url" text,
	"yoruba_audio_url" text,
	"hausa_audio_url" text,
	"igbo_audio_url" text,
	"status" "report_status" DEFAULT 'processing' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text,
	"full_name" text,
	"phone_number" text,
	"date_of_birth" date,
	"country" text,
	"state" text,
	"lga" text,
	"address" text,
	"gender" "gender",
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"occupation" text,
	"preferred_language" "language" DEFAULT 'english' NOT NULL,
	"profile_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "analysis_jobs" ADD CONSTRAINT "analysis_jobs_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;