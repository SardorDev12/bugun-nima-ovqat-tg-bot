ALTER TABLE "meals" ADD COLUMN "ingredient_details" text[] DEFAULT '{}' NOT NULL;
--> statement-breakpoint
ALTER TABLE "meals" ADD COLUMN "recipe_steps" text[] DEFAULT '{}' NOT NULL;
--> statement-breakpoint
ALTER TABLE "meals" ALTER COLUMN "ingredient_details" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "meals" ALTER COLUMN "recipe_steps" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "meals" DROP COLUMN "recipe_text";
