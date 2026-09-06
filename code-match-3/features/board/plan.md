# Feature: board — Plan

See [`intent.md`](./intent.md) for the full contract. Tasks are ordered
bottom-up (logic → view → wiring → tests → verify). All start ⬜ open.

| Task | Description | Status |
|------|-------------|--------|
| 1 | **ECS rule** — `src/ecs/systems/board.ts`: `buildBoard(ecs, config)` creates 64 `Position`+`Visual` cell entities in fixed world space (origin `0,0`, `cellSize 64`, `gap 8`, `stride 72`). Pure: mutates world only, takes config as params. No Pixi. | ⬜ |
| 2 | **Camera (view layer)** — `src/pixi/camera.ts`: `Camera{offsetX, offsetY, zoom}`; `fitCamera(viewport, boardSize, {minWidth:360, maxWidth:960, padding:48})` → centers + clamps on-screen width to `[360,960]`, height proportional (`fitSize = min(vw,vh)−2·padding`, `zoom = desiredW/boardWorldW`); `applyCamera(container, camera)` sets `.position` + `.scale`. Pure math, no game logic. | ⬜ |
| 3 | **Unit — board** — `src/__tests__/board.test.ts`: `query([Position,Visual])` ⇒ 64 entities; spot-check cell `(0,0)` at world `(0,0)` and last cell at `(504,504)`. | ⬜ |
| 4 | **Unit — camera** — `src/__tests__/camera.test.ts`: width clamps to `[360,960]`; `offsetX/offsetY` center the board (assert exact numbers); square ⇒ height proportional; `applyCamera` sets container position/scale. | ⬜ |
| 5 | **Composition root** — `main.ts`: replace the 3×3 PoC loop with `buildBoard(8×8)`; create a dedicated `cameraContainer` (cells render into it, root `stage` untransformed); apply the camera each RENDER frame; wire `window` `'resize'` → `fitCamera`; keep all constants in one config object. | ⬜ |
| 6 | **Acceptance stage** — `src/__tests__/acceptance.test.ts`: add a stage — `buildBoard` → `renderSyncSystem` → `containerMap.size === 64` → `applyCamera` centers (assert container transform). | ⬜ |
| 7 | **Verify** — `pnpm test:unit` green, `pnpm typecheck` clean, `pnpm build` succeeds, `pnpm test:e2e` (`console-clean`) green. No `any`; no raw BiteCS outside `ecs/world.ts`; no game logic in `src/pixi/`. | ⬜ |
| 8 | **Manual** — `pnpm dev` → all 64 cells visible and centered; on window resize they stay centered and fit within `[360, 960]`. | ⬜ |
| 9 | **Done-when** — update `features/board/acceptance.md`; mark all tasks ✅; in `Current.md` move `board` → ✅ done and set the next feature 🔄. | ⬜ |

---

## Notes / constraints (from intent)

- **Camera is a Pixi-view concern, not ECS** — no camera state in the world.
  `renderSyncSystem` stays entity-generic; the camera is its own render step in
  `main.ts` (folded into `applyCamera`).
- **Reposition-free resize**: the board moves via the camera transform, never via
  per-entity repositioning (forward-compatible with per-cell state later).
- **No new HUD**; "I can see all cells" is automated as `containerMap.size === 64`
  + centering assertions + boot-clean e2e + a manual `pnpm dev` glance.
- **Constants single source of truth**: one config object in `main.ts`
  (`cols`, `rows`, `cellSize`, `gap`, `minWidth`, `maxWidth`, `padding`).
