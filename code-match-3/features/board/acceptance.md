# Feature: board — Acceptance

See [`intent.md`](./intent.md) for the contract and [`plan.md`](./plan.md) for
tasks.

## Major workflows

### 1. The 8×8 board builds in world space
- `buildBoard(ecs, {cols:8, rows:8, cellSize:64, gap:8})` creates **64**
   `Position`+`Visual` cell entities. Cell `(col,row)` sits at world
   `(col*72, row*72)` (stride `cellSize+gap = 72`).
- Verified by: `board.test.ts` (64 entities; origin cell `(0,0)`; last cell
   `(504,504)`).

### 2. The camera centers and scales the board to the viewport
- `fitCamera` uses the **smaller axis** (`min(vw,vh) − 2·padding`) as the fit size,
   clamps on-screen width to **`[360, 960]`** (`minWidth`/`maxWidth`), and centers
    the board. Height is proportional (square board, uniform zoom).
- `applyCamera` writes `container.position` + `container.scale` — no per-entity
   repositioning.
- Verified by: `camera.test.ts` (centering at 1000×1000 → offset 48; min clamp on a
   tiny viewport; max clamp on a huge viewport; uniform-zoom aspect; smaller-axis fit).

### 3. The board renders and stays centered on resize
- Cells render into a dedicated `cameraContainer` (root `stage` untransformed);
   `renderSyncSystem` maps each cell to a `Graphics`; the camera transform
   centers + scales the container each frame. A `window` `resize` listener
   recomputes the camera, so the board re-centers automatically.
- Verified by: `acceptance.test.ts` stage 8
   (`buildBoard` → `renderSyncSystem` → `containerMap.size === 64` →
   `applyCamera` centers) and `e2e/console-clean.spec.ts` (boots without errors).
- **Manual:** `pnpm dev` → all **64 cells visible, centered**; on window resize they
   stay centered and fit within `[360, 960]` px wide.

## Done when

- [x] `pnpm test:unit` — 96/96
- [x] `pnpm typecheck` — clean
- [x] `pnpm build` — succeeds
- [x] `pnpm test:e2e` — 3/3 (`console-clean`, `scaffold`)
- [x] No `any`, no raw BiteCS outside `ecs/world.ts`, no game logic in `src/pixi/`
- [ ] Manual `pnpm dev` glance — human confirmation (automated proxies all green above)
