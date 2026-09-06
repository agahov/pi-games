# AGENTS.md — Working Guide for AI Agents

This file tells an AI agent **what to do next** and **how to do it** for the
`code-match-3` web game template. It is updated at the end of every slice.

---

## Operating Rules

1. **One slice at a time.** Each slice is a single, independently-shipable unit
   of work. Finish it completely (code + tests + review) before touching the next.
2. **Test after every slice.** Run `pnpm test:unit` and `pnpm typecheck`.
   All tests must pass. No new errors allowed.
3. **No regressions.** Existing passing tests must stay green.
4. **No `any`.** If a type is genuinely unknown, use `unknown` and narrow.
5. **No raw BiteCS outside `src/ecs/world.ts`.** The wrapper API is the boundary.
6. **No game logic in `src/pixi/`.** That folder is rendering + input routing only.
7. **Composition root is `src/main.ts`.** It is the only wiring file.
8. **When a step in `implementation-plan.md` is complete:** mark its tasks ✅ in
   the plan, move the status to DONE, and update the "Current Slice" section below.

---

## Project Overview

A **web game template** built with Vue 3 + PixiJS v8 + BiteCS 0.4.
Three layers, two channels:

```
Vue ←── events (outward) ──→ ECS
Vue ──→ commands (inward) ──→ ECS
Pixi ──→ commands (inward) ──→ ECS
```

Key docs:
- [`tech.md`](./tech.md) — architecture decisions, layout, BiteCS specifics
- [`implementation-plan.md`](./implementation-plan.md) — all 10 steps with tasks

---

## Project Status

### Completed

| Step | Description | Proof |
|------|-------------|-------|
| 1 | Project scaffold | 12 scaffold tests pass |
| 2 | ECS world + wrapper | `ecs/world.ts` + `ecs/components.ts`, 11 tests pass |
| 3 | EventBus + CommandQueue | `kernel/event-bus.ts` + `kernel/command-queue.ts` + `types.ts`, 21 tests pass |
| 4 | GameLoop | `kernel/game-loop.ts`, 7 tests pass |
| 5 | Pixi scene + input | `pixi/scene.ts` + `pixi/input.ts`, 8 tests pass |
| 6 | Render systems (sync + remove) | `ecs/systems/render-system.ts`, 5 render-system tests pass |
| 7 | GameModel (Vue bridge) | `ui/model.ts` + `ui/App.vue`, 7 acceptance tests pass |
| 8 | Composition root + PoC scene | `main.ts` wired, `pnpm dev` shows 3×3 grid |
| 9 | **shadcn-vue integration** | `Button` + `Card` in `ui/components/`, Tailwind CSS v4, `components.json` |
| — | Command queue: Control vs Gameplay split | `CONTROL_TYPES` in `types.ts`, no-clear pause |
| — | Logger | `kernel/logger.ts`, 7 logger tests pass |
| — | Acceptance pipeline tests | 7 stages in `acceptance.test.ts` |

### In Progress

(none)

### Not Started

| Step | Description |
|------|-------------|
| 10 | **Full test suite sweep** — confirm all tests clean, no warnings, no leaks |
| — | **GameModel test** — dedicated `game-model.test.ts` (currently covered by acceptance tests) |

---

## Current Slice: Step 10 — Full Test Suite Sweep

### Context

Steps 1–9 are complete. The codebase has 76 unit tests across 11 files.
Step 10 is the final sweep: confirm everything is green, no warnings, no leaks.

**Not yet done:**
- [ ] Dedicated `game-model.test.ts` (covered by acceptance stage 5, but should exist standalone)
- [ ] Full `pnpm test` (unit + e2e) pass
- [ ] No console warnings on `pnpm dev`
- [ ] No memory leaks (event listeners cleaned up in tests)

### Tasks (from `implementation-plan.md` Step 10)

| Task | Description |
|------|-------------|
| 10.1 | Dedicated `command-queue.test.ts` — full: order, pause, resume, clear |
| 10.2 | Dedicated `render-remove.test.ts` — create, mark removed, assert destroyed |
| 10.3 | Dedicated `game-model.test.ts` — event → ShallowRef |
| 10.4 | Dedicated `event-bus.test.ts` — on/off/emit, no leak |
| 10.5 | **Review**: all tests pass green, no console warnings, no memory leak |

### Done when

- [ ] All tests pass (unit + e2e)
- [ ] No uncleaned event listeners
- [ ] `pnpm test` clean
- [ ] `AGENTS.md` updated to DONE

---

## Slice History

| Date | Slice | Result |
|------|-------|--------|
| 2026-03-12 | Steps 1–5 | ✅ 58 tests pass |
| 2026-03-12 | Step 6 fix (render-system failing test) | ✅ 59/59 pass |
| 2026-03-12 | Render position fix (draw at origin, position via .x/.y) | ✅ 60/60 pass |
| 2026-03-12 | Command queue: Control vs Gameplay split, no-clear pause | ✅ 62/62 pass |
| 2026-03-12 | Logger (domain-scoped, runtime filter) | ✅ 69/69 pass |
| 2026-03-12 | Acceptance pipeline tests (7 stages) | ✅ 76/76 pass |
| 2026-03-12 | Step 7 + 8: GameModel + App.vue + main.ts composition root + PoC scene | ✅ 76/76, build clean |
| 2026-03-12 | Step 9 — shadcn-vue integration (Tailwind v4, Button, Card) | ✅ 76/76, build clean |
| (next) | Step 10 — Full test suite sweep | — |

---

## How to Continue After This Slice

When this slice is done, update this file:
1. Move "Current Slice" into "Slice History" table.
2. Create a new "Current Slice" section for **Step 10 — Full Test Suite Sweep**.
3. Keep operating rules the same.
