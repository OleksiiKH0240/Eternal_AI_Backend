ALTER TABLE "eternal_ai"."unauth_users" DROP CONSTRAINT "unique_constraint";--> statement-breakpoint
ALTER TABLE "eternal_ai"."unauth_users" ADD CONSTRAINT "unique_constraint" UNIQUE("ip_v4","user_agent");