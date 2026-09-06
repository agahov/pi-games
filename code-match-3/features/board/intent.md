# Feature: board

## Why

Give the game a proper **8×8 playfield**: a centred grid of 64 cells that always
stays centered on-screen and scales to fit the viewport (responsive, with a
min/max clamp). This is the visual foundation every later match-3 feature
(matching, filling, swapping) builds on.

The board is laid out in **fixed world space** by an ECS rule; a lightweight
**camera** (Pixi-side, view-only) centers and zooms that world to the viewport.
On window resize the board stays centered and fits automatically.

## Scope

In scope:

- **ECS rule** — `buildBoard(ecs, config)` creates 64 `Position`+`Visual` cell
  entities in fixed world space.
- **Camera (view layer)** — `src/pixi/camera.ts`: a `Camera` `{offsetX, offsetY,
  zoom}` with `fitCamera(...)` (center + clamp) and `applyCamera(container,
  camera)`.
- **Wiring (composition root)** — `main.ts` builds the board, renders cells into
  a dedicated `cameraContainer`, applies the camera each frame, and wires
  `window` `resize` → `fitCamera`. The PoC 3×3 scene is **replaced** by the 8×8
  board.
- **Tests** — unit (`board`, `camera`), an `acceptance` stage, plus the existing
  e2e `console-clean` for boot hygiene and a manual `pnpm dev` glance.

Out of scope (separate features):

- Cell *content* / `value` / `filled` state, the `Cell` grid component (col/row).
- Matching, swapping, gravity, scoring.
- Window `resize` as an ECS `resize` *command* — replaced by a Pixi `resize`
  listener that recomputes the camera.
- A HUD cell-count readout.

## Architecture

Three layers, two channels (see [`platform/intent.md`](../platform/intent.md)):

```
        main.ts (composition root, the only wiring file)
              │
   ┌──────────┼────────────────────────────┐
   │          │                             │
buildBoard    camera (Pixi view)           renderSyncSystem
 (ECS rule)    cameraContainer              cells → Graphics
   │          fit/apply                     (world coords)
   ▼             │                           ▲
 Position+Visual  └─── applied each frame ───┘
 (64 cell entities)
```

- `main.ts` builds the board → a `renderSyncSystem` pass turns the 64 cells into
  `Graphics` children of a dedicated **`cameraContainer`** (root `stage` stays
  untransformed).
- Each RENDER frame: recompute/apply the camera to `cameraContainer`
  (`.position` = offset from `fitCamera`, `.scale` = zoom) → the *whole board*
  is centered + scaled. A `window` `resize` listener mutates the camera in place;
  the next frame reflects it — **"re-render automatically after resize."**
- Camera lives in the **Pixi view layer** (`src/pixi/`), not ECS — centering/zoom
  is a *rendering* concern, so `src/pixi/` stays free of **game logic**. `buildBoard`
  is the only new ECS game rule; it is pure (mutates the world only, takes config
  as params).

## Layout & camera constants (single source of truth in `main.ts`)

| Group | Constant | Value | Meaning |
|-------|----------|-------|---------|
| World layout | `cols`, `rows` | `8`, `8` | the 8×8 grid |
| World layout | `cellSize` | `64` | filled square per cell |
| World layout | `gap` | `8` | space between cells |
| World layout | `stride` | `72` | `cellSize + gap`; world px between origins |
| World layout | `boardWorldW` / `H` | `568` | `cols·stride − gap` (square) |
| Camera clamp | `minWidth` | `360` | min on-screen board width (px) |
| Camera clamp | `maxWidth` | `960` | max on-screen board width (px) |
| Camera clamp | `padding` | `48` | screen-space margin |

Camera math:

```
fitSize   = min(vw, vh) − 2·padding      // aspect-safe: use smaller axis
desiredW  = clamp(fitSize, minWidth, maxWidth)
zoom      = desiredW / boardWorldW
offsetX   = (vw − boardWorldW·zoom) / 2
offsetY   = (vh − boardWorldH·zoom) / 2   // square → proportional
```

Cells are drawn as plain filled `rect`s, single color `0x3388ff`, alpha 1; the
`8`-px `gap` makes 64 distinct cells readable.

## File layout (delta from `platform`)

```
src/
  ecs/systems/board.ts   NEW  buildBoard(ecs, config): 64 Position+Visual cells,
                              fixed world layout (origin 0,0, stride 72).
  pixi/camera.ts         NEW  Camera{offsetX,offsetY,zoom};
                              fitCamera(viewport, boardSize, clamp);
                              applyCamera(container, camera).
  main.ts                EDIT replace 3×3 PoC with buildBoard(8×8); create
                         cameraContainer; apply camera each frame; wire
                         window 'resize' → fitCamera; single config object.
src/__tests__/
  board.test.ts          NEW  64 entities + spot-checked world positions.
  camera.test.ts         NEW  clamp [360,960] + centering math.
  acceptance.test.ts     EDIT add a stage: build → renderSync → 64 graphics
                         → applyCamera centers.
features/board/
  intent.md / plan.md / acceptance.md
```

## Key design decisions

- **Cells = `Position`+`Visual` entities, no grid component yet.** A cell needs no
  game logic in this feature, so we reuse the existing components and derive grid
  positions at creation time. A `Cell{col,row}` component belongs to the
  matching feature, not here.
- **Camera is a view concern, lives in `src/pixi/`, not ECS.** ECS holds no camera
  state. `fitCamera` is pure math; `applyCamera` mutates a Pixi container. This
  respects *"no game logic in `src/pixi/`"* (centering/zoom is rendering, not
  gameplay) and keeps `renderSyncSystem` entity-generic (camera is its own step in
  `main.ts`, not folded in).
- **Reposition-free resize.** The board moves via the camera transform, never via
  per-entity repositioning — forward-compatible with per-cell state added later.
  Read the live `renderer` size each frame; a `window` `resize` listener just
  recomputes the camera. The ECS `resize` *command* idea was dropped.
- **Deterministic test math.** `buildBoard`/`fitCamera` are pure: tests pass their
  own viewport/config and assert exact numbers.
- **No `resize` HUD readout.** "I can see all cells" is automated as
  `containerMap.size === 64` + camera-centering assertions plus boot-clean e2e and
  a manual `pnpm dev` glance.

## Done when

- [ ] `buildBoard(ecs, {cols:8, rows:8, cellSize:64, gap:8})` creates **64**
      `Position`+`Visual` cell entities in fixed world space (origin `0,0`,
      stride `72`) — ECS rule.
- [ ] `src/pixi/camera.ts`: `Camera{offsetX, offsetY, zoom}` + `fitCamera(viewport,
      boardSize, {minWidth:360, maxWidth:960, padding:48})` centers and clamps the
      on-screen width to `[360, 960]`, height proportional; `applyCamera` sets
      `container.position` + `container.scale`.
- [ ] `main.ts` replaces the 3×3 PoC with the 8×8 board; renders cells into a
      dedicated `cameraContainer`; applies the camera each frame; wires `window`
      `resize` → `fitCamera`; all constants in one config object.
- [ ] Unit tests: `board.test.ts` (64 entities + spot-checked positions) and
      `camera.test.ts` (clamp + centering).
- [ ] Acceptance stage: build → `renderSync` → `containerMap.size === 64` →
      `applyCamera` centers the board.
- [ ] `pnpm test:unit`, `pnpm typecheck`, `pnpm build` all green/clean.
- [ ] No `any`, no raw BiteCS outside `ecs/world.ts`, no game logic in
      `src/pixi/`, no new HUD.
- [ ] Manual: `pnpm dev` → **all 64 cells visible, centered**, and on window
      resize they stay centered and fit within `[360, 960]`.

See [`plan.md`](./plan.md) and [`acceptance.md`](./acceptance.md).
