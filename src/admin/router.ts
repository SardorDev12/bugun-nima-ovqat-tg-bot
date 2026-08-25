import type { Env } from "../bot/context.js";
import type { Db } from "../db/types.js";
import { isAuthorized, unauthorizedResponse } from "./auth.js";
import {
  createMeal,
  deleteMeal,
  listMeals,
  parseMealInput,
  updateMeal,
  ValidationError,
} from "./api/meals.js";
import { getStats } from "./api/stats.js";
import { listUsers } from "./api/users.js";
import { ADMIN_PAGE_HTML } from "./page.js";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleAdminRequest(request: Request, env: Env, db: Db): Promise<Response> {
  if (!isAuthorized(request, env.ADMIN_PASSWORD)) {
    return unauthorizedResponse();
  }

  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (method === "GET" && path === "/admin") {
    return new Response(ADMIN_PAGE_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  if (method === "GET" && path === "/admin/api/stats") {
    return json(await getStats(db));
  }

  if (method === "GET" && path === "/admin/api/users") {
    return json(await listUsers(db));
  }

  if (method === "GET" && path === "/admin/api/meals") {
    return json(await listMeals(db));
  }

  if (method === "POST" && path === "/admin/api/meals") {
    try {
      const input = parseMealInput(await request.json());
      return json(await createMeal(db, input), 201);
    } catch (err) {
      if (err instanceof ValidationError) return json({ error: err.message }, 400);
      throw err;
    }
  }

  const mealIdMatch = path.match(/^\/admin\/api\/meals\/([^/]+)$/);
  if (mealIdMatch) {
    const id = mealIdMatch[1];

    if (method === "PUT") {
      try {
        const input = parseMealInput(await request.json());
        const updated = await updateMeal(db, id, input);
        if (!updated) return json({ error: "Meal not found" }, 404);
        return json(updated);
      } catch (err) {
        if (err instanceof ValidationError) return json({ error: err.message }, 400);
        throw err;
      }
    }

    if (method === "DELETE") {
      await deleteMeal(db, id);
      return new Response(null, { status: 204 });
    }
  }

  return new Response("Not found", { status: 404 });
}
