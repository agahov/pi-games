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
`intent → plan (all tasks ✅) → tests → **review** → Current.md updated → next feature`.
See [`Current.md`](./Current.md) for the active feature and the feature index.

### Review (the checker)

Every feature passes the checklist in [`.pi/skills/review`](./.pi/skills/review/SKILL.md) — at
PLAN review and again at "done". Six items: automated gates · clear interface · test
coverage · low coupling · one-sentence functions · **general systems**. Item 6 runs the
[`.pi/skills/ecs-design`](./.pi/skills/ecs-design/SKILL.md) probe (reuse / extract / justified
one-off). A *too-small* framework surfaces as a **NEW feature**, not inline (one feature at a
time). Optional stronger-model pass: run the whole checklist via `spawnAgent(model: "gpt-5.6-sol")`
in a fresh context (that provider is reachable via the OpenAI login; it is NOT the default
ollama model), then fold its verdict back.

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

- **Review must pass:** the `.pi/skills/review` verdict is `READY TO DONE? yes` (items
   1–5 PASS, item 6 resolved), posted to the feature's `acceptance.md`.
- Mark all tasks ✅ in that feature's `plan.md`.
- Move it to ✅ **done** in the Feature Index in `Current.md`, set the next
  feature to 🔄 **in progress**, and update the test-count line.
- Operating rules in this file stay unchanged across features.
