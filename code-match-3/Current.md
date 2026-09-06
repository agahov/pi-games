# Current State

**Project:** `code-match-3` — ECS web game template (Vue 3 + PixiJS v8 + BiteCS 0.4)
**Tests:** 76/76 unit, typecheck clean, build clean

---

## Active Feature

→ [`test-sweep`](./features/test-sweep/intent.md) — full test suite sweep

---

## Feature Index

| Feature | Status | Link |
|---------|--------|------|
| platform | ✅ done | [intent](./features/platform/intent.md) · [plan](./features/platform/plan.md) · [acceptance](./features/platform/acceptance.md) |
| test-sweep | 🔄 in progress | [intent](./features/test-sweep/intent.md) · [plan](./features/test-sweep/plan.md) |

---

## Operating Rules

1. One feature at a time. Finish intent + plan + tests before moving on.
2. `pnpm test:unit` + `pnpm typecheck` after every change.
3. No regressions — existing tests stay green.
4. No `any` — use `unknown` and narrow.
5. No raw BiteCS outside `src/ecs/world.ts`.
6. No game logic in `src/pixi/`.
7. `src/main.ts` is the only wiring file.
