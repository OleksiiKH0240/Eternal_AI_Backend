ALTER TABLE "eternal_ai"."famous_people" ALTER COLUMN "name" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "eternal_ai"."famous_people" ALTER COLUMN "description" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "eternal_ai"."users" ALTER COLUMN "email" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "eternal_ai"."users" ALTER COLUMN "password" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "eternal_ai"."users" ALTER COLUMN "name" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "eternal_ai"."users" ALTER COLUMN "phone" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "eternal_ai"."users" ADD COLUMN "stripe_customer_id" varchar(256);