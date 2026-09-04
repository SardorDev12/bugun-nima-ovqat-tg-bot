export const WEBAPP_PAGE_HTML = `<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Nima ovqat?</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>
  :root {
    --tg-bg: #ffffff;
    --tg-secondary-bg: #f0f0f0;
    --tg-text: #1c1c1e;
    --tg-hint: #7d7d80;
    --tg-link: #2481cc;
    --tg-button: #2481cc;
    --tg-button-text: #ffffff;
    --border: rgba(0, 0, 0, 0.1);
    --radius: 12px;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: var(--tg-bg);
    color: var(--tg-text);
    padding-bottom: 24px;
  }
  header {
    padding: 16px 16px 4px;
  }
  header h1 { font-size: 20px; margin: 0 0 12px; }
  nav {
    display: flex;
    gap: 4px;
    padding: 0 16px;
    border-bottom: 1px solid var(--border);
  }
  nav button {
    flex: 1;
    background: none;
    border: none;
    color: var(--tg-hint);
    padding: 10px 4px;
    font-size: 14px;
    cursor: pointer;
    border-bottom: 2px solid transparent;
  }
  nav button.active { color: var(--tg-link); border-bottom-color: var(--tg-link); font-weight: 600; }
  main { padding: 16px; max-width: 480px; margin: 0 auto; }
  .panel.hidden { display: none; }
  .muted { color: var(--tg-hint); font-size: 14px; }
  .field { margin-bottom: 12px; }
  textarea, input[type="text"] {
    width: 100%;
    font-family: inherit;
    font-size: 15px;
    padding: 10px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--tg-secondary-bg);
    color: var(--tg-text);
  }
  textarea { min-height: 80px; resize: vertical; }
  .btn {
    display: inline-block;
    background: var(--tg-button);
    color: var(--tg-button-text);
    border: none;
    border-radius: var(--radius);
    padding: 11px 16px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
  }
  .btn.secondary {
    background: var(--tg-secondary-bg);
    color: var(--tg-text);
  }
  .btn.block { width: 100%; }
  .row { display: flex; gap: 8px; }
  .row .btn { flex: 1; }
  .card {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    margin-top: 12px;
    background: var(--tg-secondary-bg);
  }
  .card h3 { margin: 0 0 6px; font-size: 17px; }
  .card .meta { font-size: 13px; color: var(--tg-hint); margin-bottom: 12px; }
  .card .actions { display: flex; gap: 8px; }
  .recipe { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); }
  .recipe.hidden { display: none; }
  .recipe h4 { font-size: 14px; margin: 0 0 6px; }
  .recipe ul, .recipe ol { margin: 0 0 14px; padding-left: 20px; font-size: 14px; }
  .recipe ul { list-style: none; padding-left: 0; }
  .recipe li { margin-bottom: 4px; }
  .recipe li.have { color: var(--tg-link); font-weight: 500; }
  .status { font-size: 13px; color: var(--tg-link); margin-top: 8px; min-height: 16px; }
  .blocked { padding: 32px 16px; text-align: center; color: var(--tg-hint); }
</style>
</head>
<body>

<div id="blocked" class="blocked hidden">
  Bu ilova faqat Telegram bot ichida ochiladi.
</div>

<div id="app">
  <header>
    <h1>🍽 Nima ovqat?</h1>
  </header>
  <nav>
    <button data-tab="bugun" class="active">Bugun</button>
    <button data-tab="mahsulotlar">Mahsulotlar</button>
    <button data-tab="qidir">Qidir</button>
  </nav>
  <main>
    <section id="bugun" class="panel">
      <p class="muted">Sizga mos taom tavsiya qilamiz.</p>
      <button id="bugun-fetch" class="btn block">🍽 Taom tanlash</button>
      <div id="bugun-result"></div>
    </section>

    <section id="mahsulotlar" class="panel hidden">
      <p class="muted">Uyingizda mavjud mahsulotlarni vergul bilan ajratib yozing — shunga mos taomlarni ustuvor tavsiya qilamiz.</p>
      <div class="field">
        <textarea id="pantry-textarea" placeholder="guruch, piyoz, kartoshka, sabzi"></textarea>
      </div>
      <div class="row">
        <button id="pantry-save" class="btn">Saqlash</button>
        <button id="pantry-clear" class="btn secondary">Tozalash</button>
      </div>
      <div id="pantry-status" class="status"></div>
    </section>

    <section id="qidir" class="panel hidden">
      <p class="muted">Bitta mahsulot nomini yozing — shu mahsulot bilan tayyorlanadigan taomni topamiz.</p>
      <form id="qidir-form" class="field">
        <input id="qidir-input" type="text" placeholder="masalan: tovuq go'shti">
      </form>
      <button id="qidir-submit" class="btn block">Qidirish</button>
      <div id="qidir-result"></div>
    </section>
  </main>
</div>

<script>
(function () {
  const tg = window.Telegram && window.Telegram.WebApp;

  if (!tg || !tg.initData) {
    document.getElementById("app").classList.add("hidden");
    document.getElementById("blocked").classList.remove("hidden");
    return;
  }

  tg.ready();
  tg.expand();

  function applyTheme() {
    const p = tg.themeParams || {};
    const root = document.documentElement.style;
    if (p.bg_color) root.setProperty("--tg-bg", p.bg_color);
    if (p.secondary_bg_color) root.setProperty("--tg-secondary-bg", p.secondary_bg_color);
    if (p.text_color) root.setProperty("--tg-text", p.text_color);
    if (p.hint_color) root.setProperty("--tg-hint", p.hint_color);
    if (p.link_color) root.setProperty("--tg-link", p.link_color);
    if (p.button_color) root.setProperty("--tg-button", p.button_color);
    if (p.button_text_color) root.setProperty("--tg-button-text", p.button_text_color);
  }
  applyTheme();
  tg.onEvent("themeChanged", applyTheme);

  const BUDGET_LABEL = { cheap: "Arzon", normal: "O'rtacha", any: "Farqi yo'q" };

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  async function callApi(path, extra) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ initData: tg.initData }, extra || {})),
    });
    return res.json();
  }

  function renderMealCard(meal) {
    const budget = BUDGET_LABEL[meal.budgetTier] || meal.budgetTier;
    return (
      '<div class="card" data-meal-id="' + meal.id + '">' +
      "<h3>" + escapeHtml(meal.nameUz) + "</h3>" +
      '<div class="meta">⏱ ' + meal.cookTimeMinutes + " daqiqa · 👥 " + meal.servingsMin + "–" + meal.servingsMax +
      " kishi · 💰 " + escapeHtml(budget) + "</div>" +
      '<div class="actions">' +
      '<button class="btn secondary" data-action="recipe">👨‍🍳 Retsept</button>' +
      '<button class="btn secondary" data-action="another">🔄 Boshqa variant</button>' +
      "</div>" +
      '<div class="recipe hidden"></div>' +
      "</div>"
    );
  }

  function renderRecipe(meal, pantry) {
    const ingredientLines = meal.ingredientDetails
      .map((line, i) => {
        const have = pantry.indexOf(meal.ingredients[i]) !== -1;
        return '<li class="' + (have ? "have" : "") + '">' + (have ? "✅" : "•") + " " + escapeHtml(line) + "</li>";
      })
      .join("");
    const stepLines = meal.recipeSteps.map((step) => "<li>" + escapeHtml(step) + "</li>").join("");
    return (
      "<h4>Kerakli mahsulotlar</h4><ul>" + ingredientLines + "</ul>" +
      "<h4>Tayyorlash tartibi</h4><ol>" + stepLines + "</ol>"
    );
  }

  function mountMealCard(container, data, context) {
    if (!data.meal) {
      container.innerHTML = '<p class="muted">Taom topilmadi.</p>';
      return;
    }

    const meal = data.meal;
    container.innerHTML = renderMealCard(meal);
    const card = container.querySelector(".card");
    const recipeBox = card.querySelector(".recipe");

    card.querySelector('[data-action="recipe"]').addEventListener("click", async () => {
      if (!recipeBox.classList.contains("hidden")) {
        recipeBox.classList.add("hidden");
        return;
      }
      recipeBox.innerHTML = '<p class="muted">Yuklanmoqda...</p>';
      recipeBox.classList.remove("hidden");
      const r = await callApi("/api/webapp/recipe", { mealId: meal.id });
      if (r.error) {
        recipeBox.innerHTML = '<p class="muted">' + escapeHtml(r.error) + "</p>";
        return;
      }
      recipeBox.innerHTML = renderRecipe(r.meal, r.pantry || []);
    });

    card.querySelector('[data-action="another"]').addEventListener("click", async () => {
      const extra = { excludeMealId: meal.id };
      if (context.ingredient) extra.ingredient = context.ingredient;
      const r = await callApi(context.ingredient ? "/api/webapp/search" : "/api/webapp/recommend", extra);
      mountMealCard(container, r, context);
    });
  }

  document.getElementById("bugun-fetch").addEventListener("click", async () => {
    const container = document.getElementById("bugun-result");
    container.innerHTML = '<p class="muted">Yuklanmoqda...</p>';
    const r = await callApi("/api/webapp/recommend", {});
    mountMealCard(container, r, {});
  });

  function submitSearch(e) {
    if (e) e.preventDefault();
    const ingredient = document.getElementById("qidir-input").value.trim().toLowerCase();
    if (!ingredient) return;
    const container = document.getElementById("qidir-result");
    container.innerHTML = '<p class="muted">Qidirilmoqda...</p>';
    callApi("/api/webapp/search", { ingredient }).then((r) => mountMealCard(container, r, { ingredient }));
  }
  document.getElementById("qidir-form").addEventListener("submit", submitSearch);
  document.getElementById("qidir-submit").addEventListener("click", submitSearch);

  let pantryLoaded = false;
  async function loadPantry() {
    const r = await callApi("/api/webapp/pantry/get", {});
    document.getElementById("pantry-textarea").value = (r.pantry || []).join(", ");
  }

  function showPantryStatus(text) {
    const el = document.getElementById("pantry-status");
    el.textContent = text;
    setTimeout(() => { el.textContent = ""; }, 2500);
  }

  document.getElementById("pantry-save").addEventListener("click", async () => {
    const raw = document.getElementById("pantry-textarea").value;
    const pantry = raw.split(/[,\\n]/).map((s) => s.trim().toLowerCase()).filter(Boolean);
    const r = await callApi("/api/webapp/pantry/set", { pantry });
    document.getElementById("pantry-textarea").value = (r.pantry || []).join(", ");
    showPantryStatus("✅ Saqlandi");
  });

  document.getElementById("pantry-clear").addEventListener("click", async () => {
    await callApi("/api/webapp/pantry/set", { pantry: [] });
    document.getElementById("pantry-textarea").value = "";
    showPantryStatus("🗑 Tozalandi");
  });

  const tabButtons = document.querySelectorAll("nav button");
  const panels = document.querySelectorAll(".panel");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      panels.forEach((p) => p.classList.add("hidden"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.remove("hidden");
      if (btn.dataset.tab === "mahsulotlar" && !pantryLoaded) {
        pantryLoaded = true;
        loadPantry();
      }
    });
  });
})();
</script>
</body>
</html>
`;
