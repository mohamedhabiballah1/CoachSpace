# Branch: feat/nutrition-plans

## What this branch covers

Implements Nutrition Plans: a per-client macro target and meal plan builder, with a
visual macro ring and meal/food breakdown displayed in the ClientDetails Nutrition tab.

## Files to create or modify

### Backend
- `backend/models/NutritionPlan.model.js` — **create**: coach (ref), client (ref), dailyCalories (Number), protein (Number, grams), carbs (Number, grams), fat (Number, grams), meals array with nested `mealSchema: { name, time, foods: [{ name, amount, unit, calories, protein, carbs, fat }] }` — sub-schemas use `_id: false`; startDate, endDate
- `backend/controllers/nutrition.controller.js` — **create**: `createPlan`, `getClientPlan` (returns most recent plan by coach+client; 404 if none), `updatePlan`
- `backend/routes/nutrition.routes.js` — **create**: 3 routes mounted at `/api/nutrition`; all protected by `authMiddleware`

### Frontend
- `frontend/src/components/NutritionTab.js` — **create**:
  - `MacroRing` SVG component: circular donut chart showing protein/carbs/fat split with #c8f135, #4ade80, #f97316 colours
  - Displays daily calorie target and macro breakdown in grams
  - Meal list: each meal shows name, time, and food items with per-item macros
  - Edit mode: inline form to set calorie/macro targets and add/remove meals and foods
  - Saves via `PUT /api/nutrition/plans/:planId` or `POST /api/nutrition/plans` if no plan exists

## Dependencies to install

None.

## What "done" looks like

- `POST /api/nutrition/plans` creates a nutrition plan linked to a client
- `GET /api/nutrition/plans/:clientId` returns the most recent plan for that client
- `PUT /api/nutrition/plans/:planId` updates the plan (macros and meals)
- `NutritionTab` renders the MacroRing with correct proportional arc lengths
- Editing macros and saving updates the ring immediately (optimistic update)
- Adding a meal shows it in the meal list; adding foods to a meal shows per-food rows
- Empty state: "No nutrition plan yet. Create one!" with a Create button

## Dependencies (other branches)

- Consumed by: `feat/client-management` (NutritionTab used in ClientDetails "Nutrition" tab)
- Depends on: `fix/bugs-and-foundations` (api.js)
