CREATE TABLE "tts_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"report_id" uuid NOT NULL,
	"language" "language" NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"audio_url" text,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tts_jobs" ADD CONSTRAINT "tts_jobs_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;