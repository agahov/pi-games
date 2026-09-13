# Feature: selection — Acceptance

See [`intent.md`](./intent.md) for the contract and [`plan.md`](./plan.md) for tasks.

## Major workflows

### 1. A selected tile is drawn with a highlight

- `resolveCellAppearance(visual, false)` → `{ fill: visual.color, hasStroke: false, … }`
  — the unselected cell is exactly today's fill, **no stroke**.
- `resolveCellAppearance(visual, true)` → same `fill` **plus** the highlight
   `strokeColor` (`0xffcc33`) and `strokeWidth` (`4`).
- A custom `style` overrides the default colours/width.
- Verified by: `render-system.test.ts` (appearance-core block).

### 2. `renderSyncSystem` strokes exactly the selected cell

- With no `[Selected]` entity, a `renderSyncSystem` pass never calls `Graphics.stroke`.
- Selecting one of 4 cells and re-syncing calls `stroke` **exactly once** — on the
   selected cell.
- Verified by: `acceptance.test.ts` stage 9 (prototype spy on `Graphics.stroke`).

### 3. Selection is visible & movable on screen (manual)

- `pnpm dev` → click a tile → that tile shows a gold border; click a different tile
   → the border moves to the new tile (single selection).
- *Automated proxy:* stage 9 + `console-clean` e2e (boots without errors).

## Done when

- [x] `pnpm test:unit` — all green (appearance-core + stage 9 added).
- [x] `pnpm typecheck` — clean.
- [x] `pnpm build` — succeeds.
- [x] `pnpm test:e2e` — `console-clean` passes.
- [x] No `any`, no raw BiteCS outside `ecs/world.ts`, no game logic in `src/pixi/`.
- [x] Manual `pnpm dev` glance — click highlights a tile; selection moves on re-click
      (human gate; stage 9 is its proxy).

## Review verdict

Ran `.pi/skills/review` at "done" on `selection`.

1. **PASS** — 100/100 unit, typecheck clean, build succeeds, e2e 3/3; no new
   `any` (`type VisualData`, `SelectionStyle`, `CellAppearance`), no raw BiteCS
   outside `ecs/world.ts` (`Selected` read via `ecs.hasComponent`), no game logic
   in `src/pixi/`.
2. **PASS** — `resolveCellAppearance(visual, selected, style?): CellAppearance` and
   the new defaulted `style` param on `renderSyncSystem` are minimal and fully
   typed; params are the contract; no `any`.
3. **PASS** — appearance core unit-tested on behaviour (unselected ⇒ no stroke;
   selected ⇒ highlight; custom style); the selection render has acceptance
   **stage 9** (`Graphics.stroke` prototype spy: 0 calls pre-selection, exactly 1
   after); boot hygiene via `console-clean` e2e.
4. **PASS** — no new cross-layer wiring; `main.ts` unchanged; the appearance-core
   unit test needs no Pixi, no DOM, no world internals.
5. **PASS** — `resolveCellAppearance` = "decide one cell's fill + optional
   highlight"; `renderSyncSystem` = "sync `[Position,Visual]` to the stage,
   highlighting selected cells" — each one sentence / one responsibility.
6. **RESOLVED** — extends the existing per-frame `renderSyncSystem` General System
   with a pure, *parameterized* helper whose `SelectionStyle` is the config seam
   (a "configured instance", not a one-off); not a transition/animation in the
   `MovementSystem` family; no extended-General-System signal. See *Systems* in
   `intent.md`.

```
READY TO DONE? yes
```
