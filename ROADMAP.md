# CoachSpace — Implementation Roadmap

## Branch Overview

| # | Branch | Status | Description |
|---|--------|--------|-------------|
| 1 | `fix/bugs-and-foundations` | [ ] Not Started | Fix all pre-existing bugs; shared foundation for all other branches |
| 2 | `feat/auth-and-profile` | [ ] Not Started | Register page, Profile page, getProfile/updateProfile/changePassword endpoints |
| 3 | `feat/client-management` | [ ] Not Started | Clients list, ClientDetail, Dashboard sidebar, AddClient/UpdateMeasurement modals |
| 4 | `feat/payments` | [ ] Not Started | Subscription & Payment models, revenue endpoint, Payments page UI |
| 5 | `feat/scheduling` | [ ] Not Started | Session model, CRUD endpoints, weekly calendar Schedule page |
| 6 | `feat/dashboard` | [ ] Not Started | Smart Dashboard: KPI cards, today's sessions, expiring subs, inactive clients |
| 7 | `feat/progress-charts` | [ ] Not Started | Recharts line/bar charts for body measurements in ClientDetails |
| 8 | `feat/photo-progress` | [ ] Not Started | Photo upload per measurement, PhotoTimeline component, multer backend |
| 9 | `feat/workout-plans` | [ ] Not Started | Exercise library, WorkoutPlan builder, assign-to-client, Workouts page |
| 10 | `feat/nutrition-plans` | [ ] Not Started | NutritionPlan model, macro ring SVG, meal builder, NutritionTab component |
| 11 | `feat/pdf-report` | [ ] Not Started | pdfkit server-side PDF generation, Export PDF button in ClientDetails |
| 12 | `feat/whatsapp-actions` | [ ] Not Started | WhatsAppButton component with 3 message templates, wa.me deep links |
| 13 | `feat/global-polish` | [ ] Not Started | Pagination, toasts, loading skeletons, empty states, mobile, form validation |

---

## Recommended Implementation Order

Branches must be implemented in this order due to inter-branch dependencies:

```
1. fix/bugs-and-foundations      ← Start here. Unblocks everything else.
2. feat/auth-and-profile         ← Requires: fix/bugs-and-foundations
3. feat/whatsapp-actions         ← Requires: fix/bugs-and-foundations (no backend deps)
4. feat/progress-charts          ← Requires: fix/bugs-and-foundations (standalone component)
5. feat/photo-progress           ← Requires: fix/bugs-and-foundations
6. feat/nutrition-plans          ← Requires: fix/bugs-and-foundations
7. feat/pdf-report               ← Requires: fix/bugs-and-foundations
8. feat/payments                 ← Requires: fix/bugs-and-foundations
9. feat/scheduling               ← Requires: fix/bugs-and-foundations
10. feat/workout-plans           ← Requires: fix/bugs-and-foundations
11. feat/client-management       ← Requires: 3, 4, 5, 6, 7 (consumes all components)
12. feat/dashboard               ← Requires: 8, 9, 11 (needs sessions, payments, client views)
13. feat/global-polish           ← Requires: ALL — merge last
```

**Branches 3–10 can be implemented in parallel** once `fix/bugs-and-foundations` is merged into `main`.

---

## PR Instructions

1. Always branch off the **latest `main`** — pull before creating your branch
2. Keep each PR focused on its branch scope — do not include work from other branches
3. Open a PR to `main` using: `gh pr create --base main --head <branch-name>`
4. PR title format: `feat: <short description>` or `fix: <short description>`
5. Include a test checklist in the PR body matching the "done" criteria in each `BRANCH_README.md`
6. Do NOT merge `feat/global-polish` until all other 12 branches are merged

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| `[ ] Not Started` | Work has not begun |
| `[~] In Progress` | Actively being implemented |
| `[x] Complete` | Merged into main |
| `[!] Blocked` | Waiting on a dependency |
