import {
  pgTable,
  uuid,
  text,
  integer,
  bigint,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  telegramUserId: bigint("telegram_user_id", { mode: "number" })
    .notNull()
    .unique(),
  username: text("username"), // Telegram @handle — optional, not every user sets one
  language: text("language").notNull().default("uz"),
  dietaryPreferences: text("dietary_preferences").array().notNull().default([]),
  dislikedIngredients: text("disliked_ingredients").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const meals = pgTable("meals", {
  id: uuid("id").defaultRandom().primaryKey(),
  nameUz: text("name_uz").notNull(),
  nameEn: text("name_en"),
  cuisine: text("cuisine").notNull(),
  ingredients: text("ingredients").array().notNull(),
  // Same ingredients as above, formatted with quantities for display, e.g. "Guruch — 800 gramm".
  ingredientDetails: text("ingredient_details").array().notNull(),
  cookTimeMinutes: integer("cook_time_minutes").notNull(),
  servingsMin: integer("servings_min").notNull(),
  servingsMax: integer("servings_max").notNull(),
  budgetTier: text("budget_tier").notNull(), // cheap | normal | any
  dietaryTags: text("dietary_tags").array().notNull().default([]),
  recipeSteps: text("recipe_steps").array().notNull(),
});

// Individual mode equivalent of the PRD's GroupMealInteraction (§27),
// used for personal-mode variety/history scoring.
export const userMealInteractions = pgTable("user_meal_interactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  mealId: uuid("meal_id")
    .notNull()
    .references(() => meals.id),
  interactionType: text("interaction_type").notNull(), // viewed | accepted | rejected | requested_another | saved | cooked
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
