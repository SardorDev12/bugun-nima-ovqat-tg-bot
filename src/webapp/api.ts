import { eq } from "drizzle-orm";
import { meals, userMealInteractions } from "../db/schema.js";
import { getOrCreateUser, setUserPantry } from "../db/users.js";
import type { Db } from "../db/types.js";
import { rankMealsForUser } from "../engine/meals.js";
import { validateInitData } from "./auth.js";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function pickMeal(db: Db, userId: string, excludeMealId: string | undefined, ingredient?: string) {
  const ranked = await rankMealsForUser(db, userId);
  const match = ranked.find(
    (r) => r.meal.id !== excludeMealId && (!ingredient || r.meal.ingredients.includes(ingredient)),
  )?.meal;

  if (!match) return { meal: null };

  await db.insert(userMealInteractions).values({
    userId,
    mealId: match.id,
    interactionType: "viewed",
  });

  return { meal: match };
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export async function handleWebAppApiRequest(
  request: Request,
  botToken: string,
  db: Db,
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Not found", { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const initData = stringOrUndefined(body.initData);
  const tgUser = initData ? await validateInitData(initData, botToken) : null;
  if (!tgUser) {
    return json({ error: "Unauthorized" }, 401);
  }

  const user = await getOrCreateUser(db, tgUser.id, tgUser.username);
  const path = new URL(request.url).pathname;
  const excludeMealId = stringOrUndefined(body.excludeMealId);

  if (path === "/api/webapp/recommend") {
    return json(await pickMeal(db, user.id, excludeMealId));
  }

  if (path === "/api/webapp/search") {
    const ingredient = stringOrUndefined(body.ingredient)?.trim().toLowerCase();
    if (!ingredient) return json({ error: "Missing ingredient" }, 400);
    return json(await pickMeal(db, user.id, excludeMealId, ingredient));
  }

  if (path === "/api/webapp/recipe") {
    const mealId = stringOrUndefined(body.mealId);
    if (!mealId) return json({ error: "Missing mealId" }, 400);
    const meal = await db.query.meals.findFirst({ where: eq(meals.id, mealId) });
    if (!meal) return json({ error: "Meal not found" }, 404);
    return json({ meal, pantry: user.pantry });
  }

  if (path === "/api/webapp/pantry/get") {
    return json({ pantry: user.pantry });
  }

  if (path === "/api/webapp/pantry/set") {
    const pantry = Array.isArray(body.pantry)
      ? body.pantry.filter((item): item is string => typeof item === "string")
      : [];
    const updated = await setUserPantry(db, user.id, pantry);
    return json({ pantry: updated.pantry });
  }

  return new Response("Not found", { status: 404 });
}
