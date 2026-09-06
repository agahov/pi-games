# Feature: platform — Acceptance

## Major workflows

These are the "happy path" scenarios that must keep working.

### 1. App starts and renders the 3×3 grid
- `pnpm dev` → browser shows 9 coloured squares.
- `renderSyncSystem` creates 9 `Graphics` containers, each at a grid position.
- Verified by: `acceptance.test.ts` stage 1–2.

### 2. Click selects an entity
- Clicking a square pushes `selectEntity` through the command queue.
- On drain: `handleCommand` sets `Selected` flag on the entity, emits `entitySelected`.
- `GameModel.selectedEntity` updates synchronously; HUD shows the ID.
- Verified by: `acceptance.test.ts` stage 3–5.

### 3. Destroy removes an entity
- "Destroy Selected" button → `destroyEntity` command → `markRemoved(id)`.
- `removeRenderSystem` destroys the Pixi container, `removeWorldSystem` deregisters.
- `GameModel.selectedEntity` resets to null.
- Verified by: `acceptance.test.ts` stage 6.

### 4. Full pipeline in one tick
- Event → queue → drain → handle → bus → model, all within a single `tick()`.
- Verified by: `acceptance.test.ts` stage 7.

### 5. Pause and resume
- `loop.pause()` stops the ticker + blocks gameplay command pushes.
- Control commands (resize, setParam) still enqueued.
- `loop.resume()` unblocks; pre-pause commands drain normally after resume.
- Verified by: `command-queue.test.ts`, `game-loop.test.ts`.

## Done when

- [x] `pnpm test:unit` — 76/76
- [x] `pnpm typecheck` — clean
- [x] `pnpm build` — succeeds
- [x] No `any`, no raw BiteCS outside `ecs/world.ts`
