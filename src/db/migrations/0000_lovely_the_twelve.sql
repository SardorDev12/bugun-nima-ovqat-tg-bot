CREATE TABLE IF NOT EXISTS "meals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_uz" text NOT NULL,
	"name_en" text,
	"cuisine" text NOT NULL,
	"ingredients" text[] NOT NULL,
	"cook_time_minutes" integer NOT NULL,
	"servings_min" integer NOT NULL,
	"servings_max" integer NOT NULL,
	"budget_tier" text NOT NULL,
	"dietary_tags" text[] DEFAULT '{}' NOT NULL,
	"recipe_text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_meal_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"meal_id" uuid NOT NULL,
	"interaction_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"telegram_user_id" bigint NOT NULL,
	"language" text DEFAULT 'uz' NOT NULL,
	"dietary_preferences" text[] DEFAULT '{}' NOT NULL,
	"disliked_ingredients" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_telegram_user_id_unique" UNIQUE("telegram_user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_meal_interactions" ADD CONSTRAINT "user_meal_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_meal_interactions" ADD CONSTRAINT "user_meal_interactions_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
