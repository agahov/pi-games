# Feature: general-system

**Status: intent-only — scaffolded, NOT started.** Created as the direct consequence of
the `.pi/skills/ecs-design` probe + demo. Honoring "one feature at a time," it is **queued
behind `board`** (which still has its manual `pnpm dev` glance open). Do not implement
under another feature.

## Why

The demo of a throwaway `MovementSystem` (a per-frame animation driver we wanted to reuse
for **cell-slide transitions**, **particle fade-out VFX**, and **cell spawn-in**) reached
`READY TO DONE? no` — but the decisive finding was **item 4 (coupling), not item 6
(generalize)**. The review sharpened the concept:

> The blocker is not "we lack a `System` type." It is a **harness gap**: today you cannot
> even *write* a generic per-frame, parameterised, time-driven system, because the
> primitives it needs don't exist.

Three concrete gaps, each verified against the current code:

| # | Gap | Evidence in today's code |
|---|-----|--------------------------|
| H1 | **No time (`dt`)** | `game-loop.ts` `addSystem(fn: () => void, phase?)` passes nothing; the `Ticker` interface has no `delta`; `tick()` runs a bare `arr[i]()`. A system cannot compute `t += dt / duration`. |
| H2 | **No generic component add/remove / data** | `EcsModule` (world.ts) hardcodes `positions`/`visuals` + bespoke `addPosition`/`addVisual`/`markRemoved`; there is no generic `addComponent(id, Component, data)` / `removeComponent(id, Component)` + per-component data registry — so a new `Animated` component has nowhere to live and a way to be removed. |
| H3 | **`Position` is write-once** | `addPosition` *creates*; there is no `setPosition(id, x, y)` to lerp an existing position each frame. |

Fix the **harness first** (H1–H3). Then `MovementSystem` — *one* parameterised system —
becomes its **first consumer**, and "transitions + VFX + spawn-in are one system, not
three" stops being aspirational and becomes true by construction.

> This is the "extended General System" the `ecs-design` skill flagged. It is recorded here,
> as a feature, not bolted inline onto `board` or `movement`.

## Scope

**In scope (the enabling harness):**
- **H1 — time-aware loop.** `Ticker` gains a frame `delta`; `tick()` computes `dt` and
    passes it to time-ordered phases (`UPDATE`, `AFTER_UPDATE`). Existing
    `addSystem(fn: () => void, ...)` keeps working (a `() => void` is still `(dt) => void`).
- **H2 — generic component API on `EcsModule`.** Add/remove any registered component + a
    per-component data registry, so components beyond `Position`/`Visual` get
    add/inspect/remove without new bespoke accessors. (BiteCS `add/remove` already exist in
    the wrapper — the gap is the *external data* registry + a clean generic surface.)
- **H3 — `Position` setter.** A `setPosition(id, x, y)` that updates an existing `Position`.
- **First consumer, to prove reuse** — a single parameterised
    `MovementSystem(ecs, { duration, ease?, drive?, onDone? })` driving
    `[Animated, Position]` entities in `Phase.UPDATE`, exercised by **≥2 different configs**
    (e.g. a cell slide **and** a scale/alpha-in) so "one system, two features" is asserted
    by a test, not by a comment.

**Out of scope (separate features — record, don't build here):**
- A named `System { name, lifecycle, phase, apply(ecs, config, ctx) }` abstraction +
    registry. *(Open scoping question, below.)*
- Any concrete gameplay (matching / gravity / scoring / the `Cell{col,row}` component).
- The Pixi/render side of VFX beyond what a single `MovementSystem` + `renderSyncSystem`
    already cover.

## Architecture

No layer/channel change — the two channels and three layers stand. The deltas live in the
existing seams:

```
   main.ts (composition root)  ── registers MovementSystem per-frame, per config
        │  (first consumer)
        ▼
   MovementSystem(ecs, config)   NEW  src/ecs/systems/   ── UPDATE phase, pure
        │  uses
        ▼
   EcsModule  H2 generic add/remove + data registry + H3 setPosition   (src/ecs/world.ts)
        ▲
        │  dt
   GameLoop tick(dt)  H1  Ticker.delta   (src/kernel/game-loop.ts + Ticker)
        │
   renderSyncSystem (unchanged) ── turns the mutated Position/Visual into Graphics
```

- **`MovementSystem` is ECS logic (`src/ecs/systems/`); the renderer is untouched** —
   `renderSyncSystem` already turns whatever `Position`/`Visual` the world holds into
   Graphics. This respects "no game logic in `src/pixi/`."
- **One `MovementSystem`, N configs.** A *slide* and a *fade-in* differ only by config
    (`drive` selects the fields; `fade`/`scale` animate `Visual`, `slide` animates
    `Position`). That difference in config — not a new function — is the acceptance of
    "general systems, features use them with special params."

## File layout (delta from `board`)

```
src/
  kernel/game-loop.ts   EDIT  Ticker gains `delta`; tick() computes dt; time-ordered phases
                             receive dt; () => void remains valid.
  kernel/ticker.ts (if split) / Pixi adapter  EDIT  adapter supplies Pixi's delta.
  ecs/world.ts         EDIT  (H2) generic addComponent/removeComponent + per-component data
                             registry; (H3) setPosition(id,x,y). No raw BiteCS leaks out.
  ecs/components.ts    ADD   Animated { t, /* + config-driven target fields */ } as a
                             registered data component.
  ecs/systems/movement.ts  NEW  MovementSystem(ecs, { duration, ease?, drive?, onDone? }).
src/__tests__/
  movement.test.ts     NEW  dt-invariance; onDone fires exactly once at t≥1; t clamps;
                             [slide config] AND [fade/scale config] both pass (reuse proof).
  acceptance.test.ts   EDIT a stage: MovementSystem(config) → advance ticks → assert final
                             Position/Visual + onDone.
features/general-system/
  intent.md / plan.md   (this)
```

## Systems this feature instantiates / introduces (`ecs-design` requires this on record)

| System | Param surface (`config`) | Lifecycle | Phase | Reuse |
|--------|--------------------------|-----------|-------|-------|
| `MovementSystem` | `{ duration, ease?: (t)=>number, drive?, onDone? }` | per-frame | `UPDATE` | slide / fade / spawn-in (the proof case) |
| `Animated` (component) | `{ t, target, ease?, onDone? }` on `[Animated, Position\|Visual]` | — | driven by `MovementSystem` | shared data carrier |

**Won't-generalize note:** none of H1–H3 / `MovementSystem` is a one-off — each must be
generic by design, because the whole point is a *second* consumer. If any task ends up
feature-specific, it is out of scope for this feature.

## Key design decisions

- **Fix the harness, not a `System` type (yet).** The probe found the *first* blocker is
   H1–H3; a typed `System` abstraction is recorded in the out-of-scope list, not invented
   here. Smaller, testable, and it de-risks the real change.
- **Backward-compatible `dt`.** `addSystem(fn: () => void, phase)` keeps compiling: a
   `() => void` is a subtype of `(dt: number) => void`. Existing systems need no edits
   except gaining access to `dt` where they want it.
- **Generic, not bespoke, component storage.** H2 replaces "a Map per known component"
   with "a registry keyed by component" — so `Animated` (and future components) need no
   bespoke accessor. `Position`/`Visual` are the first, not special, entries.
- **Reuse, asserted by test.** The acceptance that this feature *succeeded* is: **one**
   `MovementSystem` passes **two** configs that differ only by `drive`/target — a slide
   and a fade — proving the generalization rather than claiming it.
- **`MovementSystem` stays pure + ECS-only**: mutates world via `EcsModule` only; no Pixi.

## Open questions (resolve before plan is frozen — these are for `grill-me`, not coding)

1. **One feature or two?** Bundle H1–H3 + first consumer here (faster to *see* reuse), or
   split "harness (H1–H3)" and "MovementSystem + consumers" into two features (smaller
   PRs, slower to see reuse)?
2. **`System` type now or later?** Introduce the `{name, lifecycle, phase, apply(ecs,
   config, ctx)}` registry as part of this feature, or keep `MovementSystem` a plain
   function + `main.ts` registration and defer the type?
3. **`drive` semantics.** A field-selector over `Partial<{x,y,size,alpha}…>` vs a smaller
   enum (`'position' | 'visual'`). Affects the `config` surface (item 2 of `review`).
4. **Where does `dt` originate?** Ticker `delta` (Pixi `ticker.deltaMS`) vs a fixed
   `1/60` for determinism in tests. Decide the test contract.

## Done when

- [ ] **H1** — `Ticker` exposes a frame `delta`; `tick()` computes `dt` and passes it to
      `UPDATE`/`AFTER_UPDATE`; `addSystem(fn: () => void, ...)` still works (compile-proof).
- [ ] **H2** — `EcsModule` supports generic `addComponent(id, C, data)` /
      `removeComponent(id, C)` + a per-component data registry; `Animated` needs no bespoke
      accessor. No raw BiteCS outside `ecs/world.ts`.
- [ ] **H3** — `EcsModule.setPosition(id, x, y)` mutates an existing `Position`.
- [ ] **First consumer** — `MovementSystem(ecs, {duration, ease?, drive?, onDone?})`
      drives `[Animated, …]` in `UPDATE`; `main.ts` registers it per config (one system,
      N configs).
- [ ] **Unit** — `movement.test.ts`: dt-invariance (advance to t≥1 over N ticks = to target
      regardless of N), `onDone` fires **exactly once**, `t` clamps; **slide AND
      fade/scale** configs both pass (the reuse assertion).
- [ ] **Acceptance** stage added: `MovementSystem(config)` → N ticks → assert final
      `Position`/`Visual` + `onDone`.
- [ ] `pnpm test:unit`, `pnpm typecheck`, `pnpm build` green; `pnpm test:e2e`
      (`console-clean`) green. No `any`; raw BiteCS only in `ecs/world.ts`; no game logic
      in `src/pixi/`.
- [ ] **Review** — `.pi/skills/review` verdict (`READY TO DONE? yes`, items 1–5 PASS,
      item 6 resolved) posted to `acceptance.md`; stronger-model pass via
      `pi -p --provider openai-codex --model gpt-5.6-sol …` when available.
- [ ] **Done-when** — `Current.md`: `board` → ✅ done; `general-system` → 🔄 in progress
      (or next), and update the test-count line.

See [`plan.md`](./plan.md).
