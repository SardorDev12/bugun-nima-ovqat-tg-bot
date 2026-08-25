import { asc, eq } from "drizzle-orm";
import { meals, userMealInteractions } from "../../db/schema.js";
import type { Db } from "../../db/types.js";

export interface MealInput {
  nameUz: string;
  nameEn: string | null;
  cuisine: string;
  ingredients: string[];
  ingredientDetails: string[];
  cookTimeMinutes: number;
  servingsMin: number;
  servingsMax: number;
  budgetTier: string;
  dietaryTags: string[];
  recipeSteps: string[];
}

export class ValidationError extends Error {}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ValidationError(`${field} is required`);
  }
  return value.trim();
}

function requireStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
    throw new ValidationError(`${field} must be an array of strings`);
  }
  const cleaned = value.map((v) => v.trim()).filter((v) => v.length > 0);
  if (cleaned.length === 0) {
    throw new ValidationError(`${field} must have at least one item`);
  }
  return cleaned;
}

function requirePositiveInt(value: unknown, field: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new ValidationError(`${field} must be a positive integer`);
  }
  return n;
}

export function parseMealInput(body: unknown): MealInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be a JSON object");
  }
  const b = body as Record<string, unknown>;

  const nameEn = b.nameEn == null || b.nameEn === "" ? null : requireString(b.nameEn, "nameEn");

  return {
    nameUz: requireString(b.nameUz, "nameUz"),
    nameEn,
    cuisine: requireString(b.cuisine, "cuisine"),
    ingredients: requireStringArray(b.ingredients, "ingredients"),
    ingredientDetails: requireStringArray(b.ingredientDetails, "ingredientDetails"),
    cookTimeMinutes: requirePositiveInt(b.cookTimeMinutes, "cookTimeMinutes"),
    servingsMin: requirePositiveInt(b.servingsMin, "servingsMin"),
    servingsMax: requirePositiveInt(b.servingsMax, "servingsMax"),
    budgetTier: requireString(b.budgetTier, "budgetTier"),
    dietaryTags: Array.isArray(b.dietaryTags)
      ? b.dietaryTags.filter((v): v is string => typeof v === "string" && v.trim() !== "")
      : [],
    recipeSteps: requireStringArray(b.recipeSteps, "recipeSteps"),
  };
}

export async function listMeals(db: Db) {
  return db.select().from(meals).orderBy(asc(meals.nameUz));
}

export async function createMeal(db: Db, input: MealInput) {
  const [created] = await db.insert(meals).values(input).returning();
  return created;
}

export async function updateMeal(db: Db, id: string, input: MealInput) {
  const [updated] = await db
    .update(meals)
    .set(input)
    .where(eq(meals.id, id))
    .returning();
  return updated;
}

export async function deleteMeal(db: Db, id: string): Promise<void> {
  // Interactions reference meals via a foreign key with no cascade —
  // clear those first so the delete doesn't fail on old history.
  await db.delete(userMealInteractions).where(eq(userMealInteractions.mealId, id));
  await db.delete(meals).where(eq(meals.id, id));
}
