export const ADMIN_PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Nima ovqat? — Admin</title>
<style>
  :root {
    --bg: #0f1115;
    --panel: #171a21;
    --border: #2a2f3a;
    --text: #e6e8eb;
    --muted: #9aa3b2;
    --accent: #4f8cff;
    --danger: #e5534b;
    --radius: 8px;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: var(--bg);
    color: var(--text);
  }
  header {
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  header h1 { font-size: 18px; margin: 0; }
  nav { display: flex; gap: 4px; padding: 12px 24px 0; }
  nav button {
    background: none;
    border: none;
    color: var(--muted);
    padding: 10px 16px;
    border-radius: var(--radius) var(--radius) 0 0;
    cursor: pointer;
    font-size: 14px;
  }
  nav button.active { color: var(--text); background: var(--panel); }
  main { padding: 24px; max-width: 1100px; margin: 0 auto; }
  .panel { background: var(--panel); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; }
  .hidden { display: none !important; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--border); vertical-align: top; }
  th { color: var(--muted); font-weight: 600; }
  .actions { display: flex; gap: 8px; }
  button {
    font-family: inherit;
    font-size: 13px;
    cursor: pointer;
  }
  .btn {
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius);
    padding: 8px 14px;
  }
  .btn-danger { background: var(--danger); }
  .btn-secondary { background: transparent; border: 1px solid var(--border); color: var(--text); }
  .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .stat-cards { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
  .stat-card {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px 20px;
    min-width: 140px;
  }
  .stat-card .value { font-size: 28px; font-weight: 700; }
  .stat-card .label { color: var(--muted); font-size: 12px; margin-top: 4px; }
  .modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.6);
    display: flex; align-items: flex-start; justify-content: center;
    padding: 40px 16px; overflow-y: auto;
  }
  .modal {
    background: var(--panel); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 24px; width: 100%; max-width: 560px;
  }
  .modal h2 { margin-top: 0; font-size: 16px; }
  .field { margin-bottom: 14px; }
  .field label { display: block; font-size: 12px; color: var(--muted); margin-bottom: 4px; }
  .field input, .field select, .field textarea {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    padding: 8px 10px;
    font-size: 13px;
    font-family: inherit;
  }
  .field textarea { min-height: 70px; resize: vertical; }
  .field-row { display: flex; gap: 12px; }
  .field-row .field { flex: 1; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
  .error { color: var(--danger); font-size: 13px; margin-top: 8px; }
  .muted { color: var(--muted); }
</style>
</head>
<body>

<header>
  <h1>🍽 Nima ovqat? — Admin</h1>
</header>

<nav>
  <button class="tab-btn active" data-tab="meals">Meals</button>
  <button class="tab-btn" data-tab="stats">Stats</button>
  <button class="tab-btn" data-tab="users">Users</button>
</nav>

<main>
  <section id="tab-meals" class="panel">
    <div class="toolbar">
      <span class="muted" id="meals-count"></span>
      <button class="btn" id="add-meal-btn">+ Add meal</button>
    </div>
    <table>
      <thead>
        <tr><th>Name (uz)</th><th>Cuisine</th><th>Time</th><th>Servings</th><th>Budget</th><th></th></tr>
      </thead>
      <tbody id="meals-tbody"></tbody>
    </table>
  </section>

  <section id="tab-stats" class="panel hidden">
    <div class="stat-cards">
      <div class="stat-card"><div class="value" id="stat-users">–</div><div class="label">Users</div></div>
      <div class="stat-card"><div class="value" id="stat-meals">–</div><div class="label">Meals</div></div>
    </div>
    <h3>Interactions by type</h3>
    <table><thead><tr><th>Type</th><th>Count</th></tr></thead><tbody id="interactions-tbody"></tbody></table>
    <h3>Top meals (by views)</h3>
    <table><thead><tr><th>Meal</th><th>Views</th></tr></thead><tbody id="top-meals-tbody"></tbody></table>
  </section>

  <section id="tab-users" class="panel hidden">
    <table>
      <thead><tr><th>Username</th><th>Telegram ID</th><th>Language</th><th>Dietary prefs</th><th>Disliked</th><th>Joined</th></tr></thead>
      <tbody id="users-tbody"></tbody>
    </table>
  </section>
</main>

<div id="modal-root"></div>

<script>
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

async function api(path, opts) {
  const res = await fetch(path, Object.assign({ headers: { "Content-Type": "application/json" } }, opts || {}));
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data && data.error) || ("Request failed: " + res.status));
  return data;
}

function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

// ---- Tabs ----
$$(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$(".tab-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    ["meals", "stats", "users"].forEach((name) => {
      $("#tab-" + name).classList.toggle("hidden", name !== btn.dataset.tab);
    });
    if (btn.dataset.tab === "stats") loadStats();
    if (btn.dataset.tab === "users") loadUsers();
  });
});

// ---- Meals ----
let mealsCache = [];

async function loadMeals() {
  mealsCache = await api("/admin/api/meals");
  $("#meals-count").textContent = mealsCache.length + " meals";
  $("#meals-tbody").innerHTML = mealsCache.map((m) => \`
    <tr>
      <td>\${escapeHtml(m.nameUz)}</td>
      <td>\${escapeHtml(m.cuisine)}</td>
      <td>\${m.cookTimeMinutes} min</td>
      <td>\${m.servingsMin}–\${m.servingsMax}</td>
      <td>\${escapeHtml(m.budgetTier)}</td>
      <td class="actions">
        <button class="btn-secondary" data-edit="\${m.id}">Edit</button>
        <button class="btn-danger" data-delete="\${m.id}">Delete</button>
      </td>
    </tr>
  \`).join("");

  $$("[data-edit]").forEach((b) => b.addEventListener("click", () => openMealModal(mealsCache.find((m) => m.id === b.dataset.edit))));
  $$("[data-delete]").forEach((b) => b.addEventListener("click", () => deleteMeal(b.dataset.delete)));
}

async function deleteMeal(id) {
  if (!confirm("Delete this meal? This also removes its interaction history.")) return;
  await api("/admin/api/meals/" + id, { method: "DELETE" });
  loadMeals();
}

function linesToArray(text) {
  return text.split("\\n").map((s) => s.trim()).filter(Boolean);
}

function openMealModal(meal) {
  const isEdit = Boolean(meal);
  const m = meal || {
    nameUz: "", nameEn: "", cuisine: "", ingredients: [], ingredientDetails: [],
    cookTimeMinutes: 30, servingsMin: 2, servingsMax: 4, budgetTier: "normal",
    dietaryTags: [], recipeSteps: [],
  };

  const root = $("#modal-root");
  root.innerHTML = \`
    <div class="modal-backdrop">
      <div class="modal">
        <h2>\${isEdit ? "Edit meal" : "Add meal"}</h2>
        <div class="field-row">
          <div class="field"><label>Name (Uzbek)</label><input id="f-nameUz" value="\${escapeHtml(m.nameUz)}"></div>
          <div class="field"><label>Name (English, optional)</label><input id="f-nameEn" value="\${escapeHtml(m.nameEn || "")}"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Cuisine</label><input id="f-cuisine" value="\${escapeHtml(m.cuisine)}" placeholder="uzbek, central_asian, russian, ..."></div>
          <div class="field"><label>Budget tier</label>
            <select id="f-budgetTier">
              <option value="cheap"\${m.budgetTier === "cheap" ? " selected" : ""}>cheap</option>
              <option value="normal"\${m.budgetTier === "normal" ? " selected" : ""}>normal</option>
              <option value="any"\${m.budgetTier === "any" ? " selected" : ""}>any</option>
            </select>
          </div>
        </div>
        <div class="field-row">
          <div class="field"><label>Cook time (minutes)</label><input id="f-cookTimeMinutes" type="number" min="1" value="\${m.cookTimeMinutes}"></div>
          <div class="field"><label>Servings min</label><input id="f-servingsMin" type="number" min="1" value="\${m.servingsMin}"></div>
          <div class="field"><label>Servings max</label><input id="f-servingsMax" type="number" min="1" value="\${m.servingsMax}"></div>
        </div>
        <div class="field"><label>Ingredients (bare names, for filtering — one per line)</label><textarea id="f-ingredients">\${escapeHtml((m.ingredients || []).join("\\n"))}</textarea></div>
        <div class="field"><label>Ingredient details (with quantities, for display — one per line)</label><textarea id="f-ingredientDetails">\${escapeHtml((m.ingredientDetails || []).join("\\n"))}</textarea></div>
        <div class="field"><label>Recipe steps (in order — one per line)</label><textarea id="f-recipeSteps">\${escapeHtml((m.recipeSteps || []).join("\\n"))}</textarea></div>
        <div class="field"><label>Dietary tags (comma-separated, optional)</label><input id="f-dietaryTags" value="\${escapeHtml((m.dietaryTags || []).join(", "))}"></div>
        <div class="error hidden" id="modal-error"></div>
        <div class="modal-actions">
          <button class="btn-secondary" id="modal-cancel">Cancel</button>
          <button class="btn" id="modal-save">\${isEdit ? "Save" : "Create"}</button>
        </div>
      </div>
    </div>
  \`;

  $("#modal-cancel").addEventListener("click", () => (root.innerHTML = ""));
  $("#modal-save").addEventListener("click", async () => {
    const payload = {
      nameUz: $("#f-nameUz").value.trim(),
      nameEn: $("#f-nameEn").value.trim() || null,
      cuisine: $("#f-cuisine").value.trim(),
      budgetTier: $("#f-budgetTier").value,
      cookTimeMinutes: Number($("#f-cookTimeMinutes").value),
      servingsMin: Number($("#f-servingsMin").value),
      servingsMax: Number($("#f-servingsMax").value),
      ingredients: linesToArray($("#f-ingredients").value),
      ingredientDetails: linesToArray($("#f-ingredientDetails").value),
      recipeSteps: linesToArray($("#f-recipeSteps").value),
      dietaryTags: $("#f-dietaryTags").value.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (isEdit) {
        await api("/admin/api/meals/" + m.id, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await api("/admin/api/meals", { method: "POST", body: JSON.stringify(payload) });
      }
      root.innerHTML = "";
      loadMeals();
    } catch (err) {
      const el = $("#modal-error");
      el.textContent = err.message;
      el.classList.remove("hidden");
    }
  });
}

$("#add-meal-btn").addEventListener("click", () => openMealModal(null));

// ---- Stats ----
async function loadStats() {
  const s = await api("/admin/api/stats");
  $("#stat-users").textContent = s.userCount;
  $("#stat-meals").textContent = s.mealCount;
  $("#interactions-tbody").innerHTML = s.interactionCounts.map((r) =>
    \`<tr><td>\${escapeHtml(r.interactionType)}</td><td>\${r.count}</td></tr>\`
  ).join("") || '<tr><td class="muted" colspan="2">No interactions yet</td></tr>';
  $("#top-meals-tbody").innerHTML = s.topMeals.map((r) =>
    \`<tr><td>\${escapeHtml(r.nameUz)}</td><td>\${r.count}</td></tr>\`
  ).join("") || '<tr><td class="muted" colspan="2">No views yet</td></tr>';
}

// ---- Users ----
async function loadUsers() {
  const list = await api("/admin/api/users");
  $("#users-tbody").innerHTML = list.map((u) => \`
    <tr>
      <td>\${u.username ? "@" + escapeHtml(u.username) : '<span class="muted">–</span>'}</td>
      <td>\${u.telegramUserId}</td>
      <td>\${escapeHtml(u.language)}</td>
      <td>\${escapeHtml((u.dietaryPreferences || []).join(", ")) || "–"}</td>
      <td>\${escapeHtml((u.dislikedIngredients || []).join(", ")) || "–"}</td>
      <td>\${new Date(u.createdAt).toLocaleDateString()}</td>
    </tr>
  \`).join("") || '<tr><td class="muted" colspan="6">No users yet</td></tr>';
}

loadMeals();
</script>
</body>
</html>
`;
