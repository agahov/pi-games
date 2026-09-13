# Feature: selection

## Why

Right now the whole selection *plumbing* is in place — a click on a tile runs the
pipeline `pointerdown → findEntityId → selectEntity command → deselectAll + Selected
component → entitySelected event → selectedEntity model ref` (proven by
`acceptance` stage 7). **But nothing on screen changes.** A selected tile looks
identical to every other tile, because `renderSyncSystem` ignores the `Selected`
flag.

This feature closes that last gap: **make the selection visible.** A clicked tile
becomes *the* selected tile and is drawn with a highlight. This is the visual hook
the rest of match-3 (swap, match-on-select) builds on.

## Scope

In scope:

- **Visible highlight** — `renderSyncSystem` now reflects `Selected`: the selected
  cell is drawn with a highlight stroke; unselected cells are unchanged.
- **Pure, testable appearance core** — a small `resolveCellAppearance(visual,
  selected, style)` decision function (mirrors the `fitCamera` pattern): the render
  wiring stays thin, and the styling rule is unit-testable without a live renderer.
- **A single selection highlight style** — a `SelectionStyle` (highlight colour +
  stroke width) with a `DEFAULT_SELECTION_STYLE`, overridable.

Out of scope (separate features):

- **Multi-selection** — stays **single selection** (clicking a new tile deselects
  the previous — the existing `selectEntity` → `deselectAll` behaviour).
- **Deselect by clicking empty space / a command** — only `deselectAll` clears an
  active selection.
- Selection *actions* (swap two selected tiles, match-3 on select).
- Changing the click → command path — it already works.

## Architecture

Unchanged three-layer / two-channel shape. The only new seam is a **style layer**
inside the render bridge:

```
  click ──▶ selectEntity ──▶ deselectAll + Selected ──▶ entitySelected ──▶ model   (exists, tested)
                                                            │
                                                            ▼
                              Selected flag on the entity ──┐
                                                            ▼
                    renderSyncSystem ──▶ resolveCellAppearance(visual, selected, style)
                                            └─► fill + optional highlight stroke ──▶ Graphics
```

- `resolveCellAppearance` is **pure**: given a cell's `Visual`, whether it is
  `selected`, and a `SelectionStyle`, it returns the appearance to draw. No Pixi,
  no `any` — the unit-testable core, exactly like `fitCamera` is the core for the
  camera.
- `renderSyncSystem` is the thin Pixi-wiring edge: it asks the resolver *what to
  draw* and applies the resulting `fill`/`stroke` to the `Graphics`.
- `selected` is read via `ecs.hasComponent(id, Selected)` — the flag already exists;
  no new component, no new command, no new event.
- A cell is **unselected by default**; selection is the *exception* that adds a
  stroke. No selection ⇒ identical output to before ⇒ no regression.

## Appearance rule (single source of truth)

| Name | Value | Meaning |
|------|-------|---------|
| `DEFAULT_SELECTION_STYLE.strokeColor` | `0xffcc33` | gold/amber highlight border |
| `DEFAULT_SELECTION_STYLE.strokeWidth` | `4` | border width in world px |

- A cell always fills its `Visual.color` (size `Visual.size`).
- A *selected* cell additionally strokes the same rect with
  `strokeColor`/`strokeWidth`. Unselected cells never stroke.
- The style is overridable (`renderSyncSystem(…, style)`), defaulting to
  `DEFAULT_SELECTION_STYLE` so the composition root needs no change.

## File layout (delta from `board`)

```
src/
  ecs/systems/render-system.ts   EDIT add resolveCellAppearance(visual, selected,
                         style): CellAppearance; add SelectionStyle +
                         DEFAULT_SELECTION_STYLE; renderSyncSystem draws the
                         highlight stroke for selected cells.
src/__tests__/
  render-system.test.ts     EDIT  unit-test resolveCellAppearance (unselected ⇒
                       no stroke; selected ⇒ highlight stroke; custom style).
  acceptance.test.ts        EDIT add stage 9 — build small board, select one
                       cell, renderSync strokes exactly that one (prototype
                       spy on Graphics.stroke: 0 before, 1 after).
features/selection/
  intent.md / plan.md / acceptance.md
```

## Key design decisions

- **Reuse the whole select pipeline; add only the visual.** Every inward/outward
  channel already exists and is tested end-to-end (stage 7). This feature is just
  the *render read* of the `Selected` flag — the smallest change that makes
  selection observable.
- **Appearance is a pure decision, not Pixi logic.** Keeping the styling rule as a
  pure function (like `fitCamera`) makes it unit-testable without a canvas and
  keeps `renderSyncSystem` "just draw what the resolver says." No game logic in
  `src/pixi/` (the style lives in `src/ecs/systems/`, the render bridge).
- **Default-off regression safety.** Unselected ⇒ `hasStroke: false` ⇒ the draw
  sequence is byte-for-byte what it was, so existing render tests stay green.
- **Stroke over recolor.** A border reads as "this one is selected" without hiding
  the tile's colour; recoloring would lose the base `Visual.color`.
- **No `any`, no raw BiteCS outside `ecs/world.ts`.** `Selected` is read through the
  `EcsModule.hasComponent` boundary.

## Systems (ecs-design — item 6)

- **General System instantiated / reused:** `renderSyncSystem` (per-frame,
     `Phase.RENDER`) — the existing render bridge is *augmented*, not duplicated
    (`buildBoard`/`selectEntity`/`entitySelected` were already in place; only the
   render read of `Selected` was missing).
- **New behaviour, already generic:** a pure, *parameterized* helper
    `resolveCellAppearance(visual, selected, style?)` with a `SelectionStyle`
   (`{strokeColor, strokeWidth}`) + `DEFAULT_SELECTION_STYLE`. The highlight
   **style is the config seam** — a future "different selection look" just passes
    a different `style`, so this is the "configured instance" shape, not a bespoke
    one-off.
- **Lifecycle / phase:** per-frame, `RENDER` (inherited via `renderSyncSystem`).
    No new lifecycle; composition root (`main.ts`) is unchanged (the new `style`
     param defaults to `DEFAULT_SELECTION_STYLE`).
- **Not a new General System, no extended-General-System signal.** This is static
    appearance mapping (`flag → fill/stroke`), *not* a transition/animation the
    `MovementSystem` family (the standing `features/general-system` backlog item)
     would own — it sits outside that family. No 4th lifecycle, no config-seam
     hack.

## Done when

- [ ] `resolveCellAppearance(visual, false)` → fill `= visual.color`, **no stroke**;
       `resolveCellAppearance(visual, true)` → same fill **plus** the highlight
      stroke (`strokeColor`/`strokeWidth` from the style).
- [ ] `renderSyncSystem` strokes a cell iff it has `Selected` (spy on
       `Graphics.stroke`: 0 calls with no selection, exactly 1 with one selected
       cell of 4).
- [ ] `SelectionStyle` + `DEFAULT_SELECTION_STYLE` overridable; `renderSyncSystem`
       defaults to it (composition root unchanged).
- [ ] Unit tests: `resolveCellAppearance` (unselected, selected, custom style).
- [ ] Acceptance stage 9: build → select → render strokes exactly the selected cell.
- [ ] `pnpm test:unit`, `pnpm typecheck`, `pnpm build` all green/clean.
- [ ] No `any`, no raw BiteCS outside `ecs/world.ts`, no game logic in
       `src/pixi/`.
- [ ] Manual: `pnpm dev` → click a tile, that tile is highlighted; click another →
      selection moves (only one highlighted at a time).

See [`plan.md`](./plan.md) and [`acceptance.md`](./acceptance.md).
