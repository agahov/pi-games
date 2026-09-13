# Current State

> Volatile — what we're doing right now. Permanent rules & conventions live in [`AGENTS.md`](./AGENTS.md).

**Project:** `code-match-3` — ECS web game template (Vue 3 + PixiJS v8 + BiteCS 0.4)
**Tests:** 100/100 unit + 3 e2e, typecheck clean, build clean

---

## Active Feature

→ **Next: awaiting a new feature.** The `selection` feature is complete — all
automated gates green. Two **human `pnpm dev` glances** remain (un-automatable
manual checks): `board` (Task 8) and `selection` (Task 7). Their automated proxies
are already green (`acceptance` stages 8 + 9, `console-clean` e2e).

The last completed feature — [`selection`](./features/selection/intent.md): a
**click selects a tile and it is visually highlighted** (gold stroke border). The
whole click → `selectEntity` pipeline already existed (acceptance stage 7); this
feature added the missing **render read** of the `Selected` flag via a pure
`resolveCellAppearance(visual, selected, style)` core + a highlight stroke in
`renderSyncSystem`. Single selection; clicking a new tile moves the highlight.

---

## Feature Index

| Feature | Status | Link |
|---------|--------|------|
| platform | ✅ done | [intent](./features/platform/intent.md) · [plan](./features/platform/plan.md) · [acceptance](./features/platform/acceptance.md) |
| test-sweep | ✅ done | [intent](./features/test-sweep/intent.md) · [plan](./features/test-sweep/plan.md) |
| board | ✅ done | [intent](./features/board/intent.md) · [plan](./features/board/plan.md) · [acceptance](./features/board/acceptance.md) |
| selection | ✅ done | [intent](./features/selection/intent.md) · [plan](./features/selection/plan.md) · [acceptance](./features/selection/acceptance.md) |

---

## Operating Rules

See [`AGENTS.md`](./AGENTS.md) — permanent rules and conventions for this project.
