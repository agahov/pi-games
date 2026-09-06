# Current State

> Volatile — what we're doing right now. Permanent rules & conventions live in [`AGENTS.md`](./AGENTS.md).

**Project:** `code-match-3` — ECS web game template (Vue 3 + PixiJS v8 + BiteCS 0.4)
**Tests:** 96/96 unit + 3 e2e, typecheck clean, build clean

---

## Active Feature

→ [`board`](./features/board/intent.md) — 8×8 centred grid of cells. **All automated
gates green** (96 unit / 3 e2e / typecheck / build).
Only remaining item: **Task 8 — manual `pnpm dev` glance** to visually confirm all 64
cells are centered + stay fitted on resize (automated proxies: `acceptance.test.ts`
stage 8 + `console-clean` are green).

---

## Feature Index

| Feature | Status | Link |
|---------|--------|------|
| platform | ✅ done | [intent](./features/platform/intent.md) · [plan](./features/platform/plan.md) · [acceptance](./features/platform/acceptance.md) |
| test-sweep | ✅ done | [intent](./features/test-sweep/intent.md) · [plan](./features/test-sweep/plan.md) |
| board | 🔄 in progress | [intent](./features/board/intent.md) · [plan](./features/board/plan.md) |

---

## Operating Rules

See [`AGENTS.md`](./AGENTS.md) — permanent rules and conventions for this project.
