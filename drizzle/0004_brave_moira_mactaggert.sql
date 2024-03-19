CREATE TABLE IF NOT EXISTS "eternal_ai"."unauth_users" (
	"ip_v4" varchar(256) NOT NULL,
	"user_agent" varchar(256) NOT NULL,
	"question_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "unique_constraint" UNIQUE("ip_v4","user_agent")
);
