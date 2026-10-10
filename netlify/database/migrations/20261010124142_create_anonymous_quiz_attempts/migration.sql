CREATE TABLE "quiz_attempts" (
	"id" text PRIMARY KEY,
	"device_hash" text NOT NULL,
	"course_code" text NOT NULL,
	"result" jsonb NOT NULL,
	"completed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "quiz_attempts_device_idx" ON "quiz_attempts" ("device_hash");