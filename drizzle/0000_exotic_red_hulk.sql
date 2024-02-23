CREATE SCHEMA "eternal_ai";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "eternal_ai"."chats" (
	"chat_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"famous_person_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "eternal_ai"."famous_people" (
	"famous_person_id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" varchar DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "eternal_ai"."messages" (
	"message_id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer NOT NULL,
	"from_user" boolean NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "eternal_ai"."users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar NOT NULL,
	"name" varchar,
	"phone" varchar,
	"subscription_id" integer DEFAULT 0 NOT NULL,
	"subscription_expire_date" timestamp DEFAULT localtimestamp NOT NULL,
	"questions_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chats_user_id_idx" ON "eternal_ai"."chats" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "chats_famous_person_id_idx" ON "eternal_ai"."chats" ("famous_person_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "famous_people_name_idx" ON "eternal_ai"."famous_people" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_chat_id_idx" ON "eternal_ai"."messages" ("chat_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "eternal_ai"."messages" ADD CONSTRAINT "messages_chat_id_chats_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "eternal_ai"."chats"("chat_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
