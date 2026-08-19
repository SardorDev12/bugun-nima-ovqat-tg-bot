# Nima ovqat?
## Telegram Meal Recommendation Bot

**Version:** 2.1  
**Date:** August 2026  
**Platform:** Telegram  
**Primary Market:** Uzbekistan  
**Target Audience:** People living in Uzbekistan, regardless of nationality or preferred cuisine  
**Product Type:** Personalized meal decision assistant

---

# 1. Executive Summary

**Nima ovqat?** is a Telegram bot that helps individuals and groups decide what to cook.

The bot recommends meals based on:

- available ingredients;
- cooking time;
- household/group size;
- budget;
- cuisine preferences;
- dietary restrictions;
- previous meals;
- personal preferences;
- local ingredients;
- seasonality.

The product is **Uzbekistan-first but not Uzbek-cuisine-only**.

It should understand foods and ingredients commonly available in Uzbekistan while supporting Uzbek, Central Asian, Russian, European, Asian, and other cuisines.

The bot has two primary modes:

### Personal Mode

A user asks:

> “What should I cook today?”

The bot provides a personalized recommendation.

### Group Mode

The bot is added to a Telegram group, such as a family or household group.

Before the evening, the bot automatically posts:

> 🍽 **Bugun nima pishiramiz?**
>
> ⭐ Today's recommendation:
> **Qozonkabob**
>
> ⏱ 50 min  
> 👥 4–5 people  
> 💰 Affordable
>
> Based on the group's preferences and recent meals.
>
> [👨‍🍳 Recipe]  
> [🔄 Another option]  
> [👍 Let's cook this]  
> [👎 Not today]

The group can then collectively decide what to cook.

---

# 2. Core Problem

People frequently struggle to decide what to cook.

The problem becomes more difficult when cooking for a family or group because the decision involves multiple people.

A typical household conversation is:

> “Bugun nima ovqat?”

> “Bilmayman.”

> “Osh qilamizmi?”

> “Kecha guruch yegandik.”

> “Unda nima?”

The same decision happens repeatedly.

Nima ovqat? should remove this recurring decision.

---

# 3. Product Vision

Become the default answer to:

> **“Bugun nima ovqat?”**

For an individual:

> “What should I cook?”

For a family/group:

> “What should we cook tonight?”

The bot should transform an open-ended decision into a simple recommendation.

---

# 4. Target Customers

## 4.1 Primary

People living in Uzbekistan who regularly cook at home.

Including:

- families;
- couples;
- students;
- people living alone;
- young professionals;
- large households;
- shared apartments.

## 4.2 Group Mode Target

The strongest group use case is:

### Family Telegram groups

A family already has a Telegram group where members communicate.

Instead of asking:

> “What should we cook?”

the bot automatically initiates the discussion.

Other possible groups:

- roommates;
- couples;
- student groups;
- shared households;
- small communities.

---

# 5. Product Modes

## 5.1 Personal Mode

The user communicates directly with the bot.

Example:

> User: What should I cook today?

Bot:

> 🍗 Chicken with potatoes
>
> ⏱ 40 min  
> 👥 2 people  
> 💰 Affordable
>
> [Recipe] [Another] [Save]

---

# 6. Group Mode

Group Mode is designed around a shared cooking decision.

When the bot is added to a group, it should automatically become a **daily meal decision assistant**.

The default behavior:

1. Bot joins the group.
2. Group admin enables Group Mode.
3. Bot learns basic group preferences.
4. Bot determines the group's preferred recommendation time.
5. Before evening, the bot posts a meal recommendation.
6. Members can accept, reject, or request another meal.
7. The group eventually selects a meal.
8. The selected meal can be marked as cooked.
9. The bot learns from the group's behavior.

---

# 7. Daily Group Recommendation

## 7.1 Default Schedule

The bot should send the daily recommendation **before the evening meal preparation period**.

Default:

> **17:00 local time**

The default timezone should be:

> **Asia/Tashkent**

The exact time should be configurable by the group.

Examples:

- 16:00
- 17:00
- 18:00

The group administrator can change the schedule.

---

# 8. Daily Group Message

Example:

> 🍽 **Bugun nima ovqat?**
>
> Bugungi tavsiya:
>
> ## 🍲 Dimlama
>
> ⏱ 55 daqiqa  
> 👥 4–6 kishi  
> 💰 O'rtacha
>
> Nega aynan shu?
>
> ✓ Guruhingizga mos  
> ✓ Ko'pchilikka yetadi  
> ✓ Kecha tayyorlangan taom takrorlanmaydi  
> ✓ Asosiy mahsulotlari odatda mavjud
>
> **Bugun shuni qilamizmi?**
>
> [👍 Ha] [👎 Yo'q]  
> [🔄 Boshqa variant]  
> [👨‍🍳 Retsept]

The message should be short enough that it does not become annoying in an active group.

---

# 9. Group Voting

The group should be able to collectively respond to the recommendation.

Buttons:

- 👍 Let's cook this
- 👎 Not today
- 🔄 Another option
- 👨‍🍳 Recipe

The bot can display lightweight participation:

> 👍 4 members want this  
> 👎 1 member doesn't

Once enough members approve, the bot can mark the meal as:

> ✅ **Kelishdik! Bugun Dimlama.**

The exact voting threshold should be configurable.

---

# 10. Group Recommendation Logic

The group recommendation should not simply use one member's preferences.

The system should create a **group profile**.

Group profile may include:

- common dietary restrictions;
- disliked ingredients;
- preferred cuisines;
- typical household size;
- preferred cooking time;
- budget;
- recently cooked meals;
- accepted meals;
- rejected meals;
- group pantry;
- seasonal preferences.

---

# 11. Group Preferences

When Group Mode is first enabled, the bot should ask the group/admin:

### How many people normally eat together?

- 1–2
- 3–4
- 5–6
- 7+
- Variable

### What type of food do you usually want?

- 🇺🇿 Uzbek
- 🌎 International
- 🔀 Both
- ⚙️ Custom

### How much time do you normally have?

- ⚡ Under 15 min
- 🕐 15–30 min
- 🕑 30–60 min
- 🍳 Doesn't matter

### Budget

- 💰 Cheap
- 💵 Normal
- 💎 Doesn't matter

These settings should be editable later.

---

# 12. Member Preferences

Individual members should optionally be able to tell the bot:

> I don't eat beef.

> I don't like eggplant.

> I'm vegetarian.

> I prefer spicy food.

The bot should associate this information with the member.

However, group recommendations should respect **hard dietary restrictions** while treating ordinary preferences as weighted preferences.

For example:

If one member has a severe allergy to an ingredient, the bot should exclude meals containing that ingredient.

If one member simply dislikes the ingredient, the meal can still potentially be recommended depending on group preferences.

---

# 13. Group Pantry

Groups should eventually be able to maintain a shared pantry.

Example:

> We have:
> - 2kg potatoes
> - 1kg beef
> - onions
> - carrots
> - rice

The bot can then recommend meals using these products.

However, pantry tracking should be optional.

The bot must still work without a maintained pantry.

---

# 14. Group Recommendation Example

Group pantry:

```text id="1q2f9v"
Potatoes
Beef
Onions
Carrots
Tomatoes
```

Potential meals:

- Qozonkabob
- Dimlama
- Shurpa
- Meat stew
- Fried potatoes with meat

The bot chooses:

> ⭐ **Qozonkabob**

because:

- most ingredients are available;
- suitable for group size;
- affordable;
- not recently cooked;
- compatible with group preferences.

---

# 15. “Another Option”

If the group doesn't like the recommendation:

> 👎 Not today

The bot should immediately provide another option.

Example:

> No problem.
>
> 🔄 **Alternative: Mastava**
>
> ⏱ 45 min  
> 👥 5 people  
> 💰 Affordable
>
> [👍 This one] [🔄 Another]

The bot should avoid repeatedly suggesting rejected meals.

---

# 16. Daily Recommendation Frequency

The bot should send **one automatic recommendation per group per day** by default.

It should not continuously send messages.

Additional recommendations should only be triggered when:

- members request another option;
- the group rejects the recommendation;
- an administrator manually requests one.

This prevents the bot from becoming spammy.

---

# 17. Missed Recommendation

If nobody interacts with the recommendation, the bot should not repeatedly remind the group.

Instead, the next day it generates a new recommendation.

Potential future feature:

> “You haven't decided yet. Want another option?”

This should not be part of the MVP unless testing shows it increases engagement without annoying users.

---

# 18. Group Meal History

The bot should track meals selected by each group.

Example:

```text id="e0h51q"
This week:

Monday — Osh
Tuesday — Chicken Pasta
Wednesday — Dimlama
Thursday — Manti
Friday — Qozonkabob
```

The recommendation engine should use this history to avoid repetition.

Example rule:

> Do not recommend the same meal again within 7 days unless explicitly requested.

---

# 19. Group Feedback

After the selected meal:

> Did you actually cook this?

Buttons:

- ✅ Yes
- ❌ No

If yes:

> 👍 Great! We'll remember that your group liked this meal.

This provides stronger behavioral data than simply clicking a recommendation.

---

# 20. Personal + Group Interaction

A user can use both modes.

Example:

### In private chat

> What can I cook for myself?

The bot provides a personal recommendation.

### In family group

The same user participates in:

> What should we cook tonight?

The bot treats these as different contexts.

This distinction is important.

A person's personal preferences should not automatically override the entire group's preferences.

---

# 21. Group Commands

```text id="hby0jb"
/today
/another
/recipe
/vote
/pantry
/history
/preferences
/schedule
/help
```

The bot should also support natural language:

> Bugun nima pishiramiz?

> Boshqa variant ber.

> Tez tayyor bo'ladigan ovqat ayt.

> Go'shtsiz variant kerak.

---

# 22. Group Administration

Only authorized group administrators should be able to change group-level settings.

Admin actions:

- Enable/disable daily recommendations.
- Change recommendation time.
- Set group size.
- Set budget.
- Set cuisine preferences.
- Configure dietary restrictions.
- Enable/disable pantry.
- Reset group preferences.
- Remove the bot.

---

# 23. Group Settings

Example:

```text id="8mnbt7"
⚙️ Group Settings

Daily recommendations: ON

Recommendation time:
17:00

Cuisine:
🇺🇿 Uzbek + 🌎 International

Budget:
💵 Normal

Cooking time:
🕐 30–60 minutes

Group size:
5 people
```

---

# 24. Scheduling Requirements

The backend must support scheduled Telegram messages.

For each enabled group:

```text id="3v8e6u"
GroupSchedule
- id
- group_id
- timezone
- recommendation_time
- enabled
- created_at
- updated_at
```

The scheduler should trigger the recommendation at the configured local time.

Default timezone:

```text
Asia/Tashkent
```

Future international expansion should support other timezones.

---

# 25. Group Data Model

```text id="pxz9gl"
Group
- id
- telegram_chat_id
- name
- timezone
- household_size
- cuisine_preferences
- dietary_preferences
- disliked_ingredients
- cooking_time_preference
- budget_preference
- recommendation_enabled
- recommendation_time
- created_at
- updated_at
```

---

# 26. Group Member Model

```text id="q9v6ju"
GroupMember
- id
- group_id
- user_id
- role
- dietary_preferences
- disliked_ingredients
- joined_at
```

Possible roles:

- admin;
- member.

---

# 27. Group Meal Interaction

```text id="4u6w5r"
GroupMealInteraction
- id
- group_id
- meal_id
- user_id
- interaction_type
- created_at
```

Interaction types:

- viewed;
- accepted;
- rejected;
- requested_another;
- cooked;
- saved.

This allows the system to learn both **group-level** and **member-level** behavior.

---

# 28. Recommendation Engine Update

The recommendation score should support both individual and group contexts.

### Individual

```text id="2ksx8u"
Score =
    Ingredient Match
  + Personal Preference
  + Time Match
  + Budget Match
  + Cuisine Match
  + Variety
  + History
```

### Group

```text id="j6v1on"
Score =
    Group Preference Match
  + Ingredient Match
  + Household Size Match
  + Time Match
  + Budget Match
  + Cuisine Match
  + Seasonal Match
  + Meal Variety
  + Historical Acceptance
  + Member Compatibility
```

Hard restrictions should filter meals before scoring.

---

# 29. Notification Design Principle

The bot should feel like a **helpful household member**, not a notification service.

Good:

> 🍽 Bugun nima ovqat?
>
> Bugungi tavsiya: Dimlama.

Bad:

> 🔔 Reminder #1: You haven't selected dinner.

The bot should initiate the decision but should not aggressively chase the user.

---

# 30. Group Mode MVP

## Must Have

1. Add bot to Telegram group.
2. Enable Group Mode.
3. Configure group size.
4. Configure basic cuisine preference.
5. Configure recommendation time.
6. Daily scheduled recommendation.
7. One recommendation per day.
8. Another recommendation button.
9. Recipe button.
10. Basic voting.
11. Group meal history.
12. Group-level preferences.
13. Admin controls.
14. Uzbekistan timezone support.

## Should Have

- member preferences;
- group pantry;
- shopping list;
- cooking confirmation;
- rejection reasons.

## Later

- intelligent group consensus;
- personalized voting;
- meal budget tracking;
- grocery integrations;
- automatic weekly planning;
- family nutrition planning.

---

# 31. Example Full Group Experience

### 17:00

Bot:

> 🍽 **Bugun nima ovqat?**
>
> ⭐ Today's recommendation:
>
> **Chicken with potatoes**
>
> ⏱ 40 min  
> 👥 5 people  
> 💰 Affordable
>
> Most ingredients are commonly available and the group hasn't had this recently.
>
> [👍 Let's cook]  
> [👎 Not today]  
> [🔄 Another]  
> [👨‍🍳 Recipe]

### Members vote

> 👍 3  
> 👎 1

Bot:

> 🎉 **Kelishdik!**
>
> Bugun: **Chicken with potatoes**
>
> [👨‍🍳 Recipe] [🛒 Shopping List]

### After dinner

Bot:

> 🍽 Tayyor bo'ldimi?
>
> [✅ Ha, pishirdik] [❌ Yo'q]

If yes:

> ❤️ Great! I'll remember this for your group.

---

# 32. Business Value of Group Mode

Group Mode potentially creates stronger retention than personal recommendations.

Why?

Personal mode:

> One person has to remember to open the bot.

Group mode:

> The bot automatically appears every day.

This creates a recurring usage loop:

```text
Daily scheduled message
        ↓
Group discussion
        ↓
Meal selected
        ↓
Meal cooked
        ↓
Feedback
        ↓
Better future recommendation
        ↓
Next day's message
```

This is potentially one of the strongest retention mechanisms in the product.

However, this is a hypothesis that needs testing.

---

# 33. Important Risk: Notification Fatigue

Automatic daily messages could cause groups to:

- mute the bot;
- ignore it;
- remove it;
- perceive it as spam.

Therefore, the MVP should make scheduling:

- opt-in;
- configurable;
- easy to disable.

The bot should never assume that adding it to a group automatically gives permission to send daily recommendations.

Recommended flow:

> **Daily recommendations are currently OFF.**
>
> Would you like me to suggest a meal every day at 17:00?
>
> [✅ Enable] [⚙️ Configure]

---

# 34. Privacy Considerations

The bot should collect only information necessary for recommendations.

For groups:

- Telegram chat ID;
- group settings;
- member IDs;
- optional preferences;
- interaction history.

The product should clearly explain that member preferences can influence group recommendations.

Members should be able to remove their personal preferences from the bot.

---

# 35. Updated North Star Metric

For Personal Mode:

> **Meals actually cooked from bot recommendations per active user.**

For Group Mode:

> **Meals actually cooked from bot recommendations per active group per week.**

The combined company-level metric could eventually be:

> **Successful meals cooked through Nima ovqat? per week.**

---

# 36. Group-Specific Success Metrics

### Group activation

Percentage of groups that enable daily recommendations after adding the bot.

### Weekly active groups

Groups receiving/interacting with recommendations each week.

### Recommendation engagement

Percentage of daily recommendations receiving interaction.

### Acceptance rate

Percentage of recommendations accepted.

### Cook-through rate

Percentage of accepted meals actually cooked.

### Group retention

Percentage of groups still using the bot after:

- 7 days;
- 30 days;
- 90 days.

### Notification opt-out rate

Percentage of groups disabling scheduled recommendations.

This is particularly important because it measures whether the automated feature is perceived as useful or annoying.

---

# 37. Updated Critical Hypothesis

The product now has two major hypotheses.

### H1 — Personal

> People in Uzbekistan will repeatedly use Nima ovqat? to decide what to cook because local context and personalization make the recommendation more useful than generic recipe search.

### H2 — Group

> Families and households will add Nima ovqat? to their Telegram groups and allow it to automatically recommend a meal before evening because it reduces the recurring “what should we cook?” decision.

**H2 is particularly interesting because it creates an automatic recurring engagement loop.**

It should be validated separately from personal usage.

---

# 38. Validation Plan for Group Mode

Do not immediately build the complete group recommendation engine.

Run a concierge experiment.

### Step 1

Recruit approximately 10–20 family/household Telegram groups.

### Step 2

Add the bot.

### Step 3

At a fixed time, manually or semi-automatically send one recommendation.

### Step 4

Allow members to vote.

### Step 5

Record:

- whether people interacted;
- whether they accepted;
- whether another option was requested;
- whether the meal was actually cooked;
- whether the group wanted the recommendation again tomorrow.

### Step 6

After 1–2 weeks, measure retention.

The key question is:

> **Do groups voluntarily keep the daily recommendation enabled?**

That is much more valuable evidence than simply asking:

> “Would you use this bot?”

---

# 39. Updated MVP Architecture

```text
                         Telegram
                            │
             ┌──────────────┴──────────────┐
             │                             │
       Private Chat                    Group Chat
             │                             │
             ▼                             ▼
      Personal Mode                  Group Mode
             │                             │
             └──────────────┬──────────────┘
                            ▼
                  Recommendation Engine
                            │
             ┌──────────────┼──────────────┐
             │              │              │
          Users          Groups         Meals
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                       PostgreSQL
                            │
                     Scheduled Worker
                            │
                            ▼
                   Daily Group Messages
```

---

# 40. Recommended Development Priority

## Phase 1 — Validate Core Problem

Build:

- Telegram bot;
- meal database;
- ingredient understanding;
- basic recommendation;
- personal mode.

Goal:

**Prove people repeatedly want help deciding what to cook.**

## Phase 2 — Validate Group Mode

Add:

- Telegram group support;
- scheduled recommendations;
- group preferences;
- voting;
- group history.

Goal:

**Prove families/groups want an automated daily meal recommendation.**

## Phase 3 — Improve Intelligence

Add:

- pantry;
- member preferences;
- better recommendation ranking;
- seasonal intelligence;
- shopping lists.

## Phase 4 — Monetization

Test:

- premium group features;
- weekly meal planning;
- family plans;
- advanced personalization.

---

# 41. Final Product Definition

**Nima ovqat?** is a Telegram-based cooking decision assistant for people living in Uzbekistan.

It helps individuals answer:

> **“What should I cook today?”**

And helps families/groups answer:

> **“What should we cook tonight?”**

Its key product loop is:

```text
Individual:
Ask → Recommend → Cook → Learn

Group:
Schedule → Recommend → Vote → Cook → Learn
```

The product should be **Uzbekistan-first but cuisine-neutral**, using local ingredients, languages, household patterns, and food culture to produce recommendations that feel genuinely relevant.

The long-term objective is not to become another recipe database.

It is to become the **default decision layer between “What do we have?” and “What are we cooking tonight?”**