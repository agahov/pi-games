# AGENTS.md — How to Work on `code-match-3`

Permanent operating rules and conventions for this project. Read this first.
For **what we're doing right now** (active feature, status, test counts), see
[`Current.md`](./Current.md).

---

## Operating Rules

1. **One feature at a time.** Finish a feature's `intent` + `plan` + tests
   before starting the next.
2. **Verify after every change.** Run `pnpm test:unit` and `pnpm typecheck`.
   All green, no new errors.
3. **No regressions.** Existing passing tests stay green.
4. **No `any`.** If a type is genuinely unknown, use `unknown` and narrow.
5. **No raw BiteCS outside `src/ecs/world.ts`.** The wrapper is the boundary.
6. **No game logic in `src/pixi/`.** That folder is rendering + input routing only.
7. **`src/main.ts` is the only wiring file.** Composition root, nothing else.

---

## Conventions

### Feature workflow

Each feature lives in `features/<name>/`:

- `intent.md` — *why*, *scope*, *done when* (the contract).
- `plan.md` — task checklist with status.
- `acceptance.md` — acceptance criteria + proof (where useful).

Drive a feature to completion top to bottom:
`intent → plan (all tasks ✅) → tests → Current.md updated → next feature`.
See [`Current.md`](./Current.md) for the active feature and the feature index.

### Commands

| Task | Command |
|------|---------|
| Run dev server | `pnpm dev` |
| Unit tests | `pnpm test:unit` |
| E2E tests | `pnpm test:e2e` |
| Full test sweep | `pnpm test` |
| Type-check | `pnpm typecheck` |
| Build | `pnpm build` |

### Architecture

Web game template: **Vue 3 + PixiJS v8 + BiteCS 0.4**.
Three layers, two channels:

```
Vue ←── events (outward) ──→ ECS
Vue ──→ commands (inward) ──→ ECS
Pixi ──→ commands (inward) ──→ ECS
```

- `src/ecs/` — ECS world + wrapper (BiteCS boundary lives in `src/ecs/world.ts`).
- `src/kernel/` — game loop, event bus, command queue, logger.
- `src/pixi/` — rendering + input routing **only** (no game logic).
- `src/ui/` — Vue layer; `src/ui/model.ts` is the Vue↔ECS bridge.
- `src/main.ts` — composition root (the only wiring file).

---

## When a Feature Is Done

- Mark all tasks ✅ in that feature's `plan.md`.
- Move it to ✅ **done** in the Feature Index in `Current.md`, set the next
  feature to 🔄 **in progress**, and update the test-count line.
- Operating rules in this file stay unchanged across features.
