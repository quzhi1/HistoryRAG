DO $$
BEGIN
	CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION
	WHEN duplicate_object OR unique_violation THEN
		NULL;
END $$;

CREATE TABLE IF NOT EXISTS "resources" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
