ALTER TABLE "eternal_ai"."users" ALTER COLUMN "subscription_expire_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "eternal_ai"."users" ALTER COLUMN "subscription_expire_date" DROP NOT NULL;