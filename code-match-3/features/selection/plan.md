# Feature: selection — Plan

See [`intent.md`](./intent.md) for the full contract. Tasks are ordered bottom-up
(logic → view → wiring → tests → verify). All start ⬜ open.

| # | Task | Status |
|---|------|--------|
| 1 | **Pure appearance core** — `src/ecs/systems/render-system.ts`: export `SelectionStyle {strokeColor, strokeWidth}`, `DEFAULT_SELECTION_STYLE = {strokeColor:0xffcc33, strokeWidth:4}`, `CellAppearance {fill, hasStroke, strokeColor, strokeWidth}`, and `resolveCellAppearance(visual, selected, style?)` — pure: unselected ⇒ `hasStroke:false`, fill `= visual.color`; selected ⇒ `hasStroke:true` + the style's stroke, fill unchanged. Honours a custom `style`. No Pixi, no `any`. | ✅ |
| 2 | **Render the highlight** — `renderSyncSystem(ecs, containerMap, stage, style?)`: for each `[Position,Visual]` cell, read `selected = ecs.hasComponent(id, Selected)` and draw `resolveCellAppearance(vis, selected, style)` — always fill; `stroke` the same rect **iff** `hasStroke`. Default `style = DEFAULT_SELECTION_STYLE`. Unselected ⇒ identical draw to before (no regression). | ✅ |
| 3 | **Unit — appearance core** — `src/__tests__/render-system.test.ts`: `resolveCellAppearance` unselected ⇒ no stroke + fill `= color`; selected ⇒ highlight stroke (`0xffcc33`, width 4) + fill unchanged; custom `style` is honoured. | ✅ |
| 4 | **Acceptance stage 9** — `src/__tests__/acceptance.test.ts`: build small board (2×2 = 4 cells), `renderSync` (no selection ⇒ `Graphics.stroke` not called via a prototype spy), select one cell + `renderSync` again ⇒ `stroke` called exactly once (the selected cell only). Restore the spy. | ✅ |
| 5 | **Wiring check** — `main.ts`: confirm `renderSyncSystem` needs **no change** (defaults to `DEFAULT_SELECTION_STYLE`); click → `selectEntity` path already wired. No composition change expected. | ✅ |
| 6 | **Verify** — `pnpm test:unit` green, `pnpm typecheck` clean, `pnpm build` succeeds, `pnpm test:e2e` (console-clean) green. No `any`; no raw BiteCS outside `ecs/world.ts`; no game logic in `src/pixi/`. | ✅ |
| 7 | **Done-when** — update `features/selection/acceptance.md`; mark tasks ✅; in `Current.md` move `selection` → ✅ done and set the next feature 🔄. *Manual `pnpm dev` glance (click → highlight moves) is the human gate; stage 9 is its automated proxy.* | ✅ |

---

## Notes / constraints (from intent)

- **Single selection, default-off.** Clicking a new tile deselects the previous
  (existing `selectEntity` → `deselectAll`). Unselected cells are never stroked, so
  the draw sequence for the common case is unchanged ⇒ **zero regression** to the
  existing render tests.
- **Appearance is a pure decision** (`resolveCellAppearance`), the render wiring is
  thin, and `Selected` is read through `EcsModule.hasComponent` — no new component,
  event, or command; no raw BiteCS outside `ecs/world.ts`.
- **Stroke, not recolor** — a border keeps the tile's base `Visual.color` visible.
