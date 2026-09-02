# Web Game Template — Implementation Plan

Status: **planned** | Created: 2026-03-12

## Architecture Summary

Three layers, two channels:

```
Vue ──→ commands ──→ ECS ──→ events ──→ Vue (shallowRef)
Pixi ──→ commands ──→ ECS
ECS ──→ render ──→ Pixi (per-frame sync)
```

Full details: [`tech.md`](./tech.md)

---

## Steps

| # | Step | Status | Depends On |
|---|------|--------|------------|
| 1 | **Project scaffold** | ⬜ TODO | — |
| 2 | **ECS world + wrapper** | ⬜ TODO | 1 |
| 3 | **Kernel: EventBus + CommandQueue** | ⬜ TODO | 1 |
| 4 | **Kernel: GameLoop** | ⬜ TODO | 3, 5 |
| 5 | **Pixi scene + input** | ⬜ TODO | 1, 3 |
| 6 | **Render systems (sync + remove)** | ⬜ TODO | 2, 5 |
| 7 | **GameModel (Vue bridge)** | ⬜ TODO | 3 |
| 8 | **Composition root + PoC scene** | ⬜ TODO | 2, 4, 5, 6, 7 |
| 9 | **shadcn-vue integration** | ⬜ TODO | 7 |
| 10 | **Tests** | ⬜ TODO | 3, 6, 7 |

---

## Step 1 — Project Scaffold

Foundation. Everything depends on this.

### Tasks

| Task | Status | Depends On |
|------|--------|------------|
| 1.1 | `npm create vite@latest . -- --template vue-ts` — init Vite + Vue + TS project | — |
| 1.2 | Add dependencies: `pixi.js@8`, `bitecs@0.4`, `shadcn-vue`, `vitest` | 1.1 |
| 1.3 | Update `package.json` scripts: `dev`, `build`, `test`, `test:run` | 1.1 |
| 1.4 | Configure `vite.config.ts`: `@/` alias → `src/`, `vitest` config | 1.1 |
| 1.5 | Create directory structure from `tech.md` layout | 1.1 |
| 1.6 | `index.html`: two DOM layers (`#canvas-layer`, `#ui-layer` with `pointer-events: none`) | 1.1 |
| 1.7 | `tsconfig.json`: strict, `noUncheckedIndexedAccess`, path aliases | 1.1 |
| 1.8 | **Test**: `src/__tests__/scaffold.test.ts` — assert all directories exist, imports resolve, Vite config loads | 1.4, 1.5 |
| 1.9 | **Review**: verify `pnpm dev` builds, `pnpm test:run` passes, TypeScript strict passes | 1.8 |

### Done when

- [ ] `pnpm dev` starts Vite and serves `#canvas-layer` + `#ui-layer`
- [ ] `pnpm build` produces production output
- [ ] `pnpm test:run` runs Vitest with 1 passing scaffold test
- [ ] `pnpm typecheck` (tsc `--noEmit`) passes strict
- [ ] Directory structure matches `tech.md` layout
- [ ] PR reviewed and approved

---

## Step 2 — ECS World + Wrapper

Depends on: **Step 1**

### Tasks

| Task | Status | Depends On |
|------|--------|------------|
| 2.1 | `src/ecs/components.ts` — define `Position`, `Visual`, `Selected`, `RemovedComponent` as BiteCS 0.4 soa objects | 1.1 |
| 2.2 | `src/ecs/world.ts` — `createWorld(createEntityIndex())`, export `world`, `components` | 2.1 |
| 2.3 | `src/ecs/world.ts` — wrapper API: `createEntity()`, `addPosition(id,x,y)`, `addVisual(id,...)`, `setSelected(id,bool)`, `markRemoved(id)`, `query(...)` | 2.2 |
| 2.4 | `src/ecs/systems/render-system.ts` placeholder: `RenderSyncSystem`, `RemoveRenderSystem` signatures (not implemented yet) | 2.3 |
| 2.5 | **Test**: `src/__tests__/ecs.test.ts` — create entity, add components, query, markRemoved, assert component state | 2.3 |
| 2.6 | **Review**: verify no raw BiteCS calls leak outside `ecs/world.ts`, types are strict | 2.5 |

### Done when

- [ ] `createEntity()` returns a versioned entity ID
- [ ] `query(Selected)` returns only entities with `SelectedComponent`
- [ ] `markRemoved(id)` adds `RemovedComponent`, does not remove from world
- [ ] `pnpm test:run` passes with ecs.test.ts

---

## Step 3 — Kernel: EventBus + CommandQueue

Depends on: **Step 1**

### Tasks

| Task | Status | Depends On |
|------|--------|------------|
| 3.1 | `src/kernel/event-bus.ts` — `createTypedBus<TEvents>()`: `on(event, cb)`, `off(event, cb)`, `emit(event, payload)` | 1.1 |
| 3.2 | `src/kernel/command-queue.ts` — `createCommandQueue<TCommands>()`: `push`, `drain(handler)`, `pause`, `resume` | 1.1 |
| 3.3 | `src/types.ts` — `Command` union, `GameEvent` union (minimal: `selectEntity`, `deselectAll`, `entitySelected`) | 1.1 |
| 3.4 | **Test**: `event-bus.test.ts` — emit/on/off, multiple listeners, no leak after `off` | 3.1 |
| 3.5 | **Test**: `command-queue.test.ts` — push/drain order, pause blocks push, resume allows push, clear on pause | 3.2 |
| 3.6 | **Test**: `types.test.ts` — compile-time type safety: wrong command type fails, wrong event type fails | 3.3 |
| 3.7 | **Review**: verify no `any`, all callbacks type-safe, `off` returns void | 3.4, 3.5, 3.6 |

### Done when

- [ ] `commandQueue.push` no-ops when paused
- [ ] `commandQueue.resume` does not replay pre-pause commands
- [ ] `eventBus.on/off/emit` is type-safe with zero `any`
- [ ] `pnpm test:run` passes with 3 kernel tests

---

## Step 4 — Kernel: GameLoop

Depends on: **Step 3** (no runtime dependency on Pixi — uses `Ticker` interface)

### Tasks

| Task | Status | Depends On |
|------|--------|------------|
| 4.1 | `src/kernel/game-loop.ts` — `Ticker` interface: `{ add(cb), remove(cb), stop(), start() }` | 1.1 |
| 4.2 | `createGameLoop(ticker: Ticker, cmdQueue, eventBus)` with phase map | 4.1, 3 |
| 4.3 | `loop.addSystem(fn, phase)` — phase ordering: `COMMAND_DRAIN → UPDATE → AFTER_UPDATE → RENDER` | 4.2 |
| 4.4 | `COMMAND_DRAIN` phase: auto-registered, drains `cmdQueue` | 4.2 |
| 4.5 | `loop.pause()` / `resume()` — stops ticker + pauses `cmdQueue` (clears + blocks) | 4.4 |
| 4.6 | `loop.destroy()` — stops everything | 4.5 |
| 4.7 | **Test**: `game-loop.test.ts` — mock Ticker, verify phase order, pause/resume, command drain, no Pixi import | 4.5 |
| 4.8 | **Review**: verify no Pixi import in kernel, phase order enforced by code, `pause` clears queue | 4.7 |

### Done when

- [ ] `Ticker` interface is in `src/kernel/`, no Pixi import in kernel layer
- [ ] Systems execute in strict phase order
- [ ] `loop.pause()` stops ticker + clears + blocks command queue
- [ ] `pnpm test:run` passes with game-loop.test.ts
- [ ] Mock Ticker test proves GameLoop is Pixi-independent

---

## Step 5 — Pixi Scene + Input

Depends on: **Step 1, 3**

### Tasks

| Task | Status | Depends On |
|------|--------|------------|
| 5.1 | `src/pixi/scene.ts` — `createApp()` → creates `PIXI.Application`, mounts to `#canvas-layer`, `resize()` on `ResizeObserver` | 1.1 |
| 5.2 | `src/pixi/input.ts` — global pointer/keyboard wiring via `app.ticker` or `app.events` | 5.1 |
| 5.3 | Module augmentation on `PIXI.Container`: add `entityId?: number` | 5.1 |
| 5.4 | `src/ecs/systems/input-system.ts` — pointer/click → `Container.entityId` → `commandQueue.push({ type: 'selectEntity', ... })` | 5.2, 3.2 |
| 5.5 | **Test**: `input-system.test.ts` — mock click with `entityId=5`, assert command queued | 5.4, 3.2 |
| 5.6 | **Review**: verify no game logic in `pixi/`, only rendering + input routing | 5.5 |

### Done when

- [ ] `createApp()` returns a usable `PIXI.Application` in `#canvas-layer`
- [ ] Click on a container with `entityId=5` → `commandQueue.push({ type: 'selectEntity', entityId: 5 })`
- [ ] `pnpm test:run` passes

---

## Step 6 — Render Systems (sync + remove)

Depends on: **Step 2, 5**

### Tasks

| Task | Status | Depends On |
|------|--------|------------|
| 6.1 | `RenderSyncSystem`: iterate `[Position, Visual]`, create/update `Map<EntityId, Container>`, add to stage | 2, 5 |
| 6.2 | `RemoveRenderSystem`: iterate `[Visual, RemovedComponent]`, destroy container, delete from Map | 6.1 |
| 6.3 | `RemoveSystem`: iterate `[RemovedComponent]`, call `world.removeEntity(id)` (last system) | 6.2 |
| 6.4 | Register all 3 in `RENDER` phase via `loop.addSystem` | 6.3, 4 |
| 6.5 | **Test**: `render-system.test.ts` — 3×3 grid, mark one removed, assert 8 containers + 1 destroyed | 6.3 |
| 6.6 | **Review**: verify per-frame diff logic, no memory leak on destroy, `entityId` is on Container | 6.5 |

### Done when

- [ ] New entity → container created and added to stage
- [ ] `markRemoved(id)` → RenderRemoveSystem destroys container, RemoveSystem deregisters
- [ ] `pnpm test:run` passes

---

## Step 7 — GameModel (Vue bridge)

Depends on: **Step 3**

### Tasks

| Task | Status | Depends On |
|------|--------|------------|
| 7.1 | `src/ui/model.ts` — `createGameModel(eventBus)` closure, `selectedEntity` + `score` ShallowRefs | 3 |
| 7.2 | `const modelKey = Symbol('game-model')` — typed provide/inject key | 7.1 |
| 7.3 | `src/ui/App.vue` — root component, `inject(modelKey)`, renders HUD | 7.2 |
| 7.4 | **Test**: `game-model.test.ts` — emit `entitySelected` on bus, assert `selectedEntity.value` updated | 7.1 |
| 7.5 | **Review**: verify model is closure not class, no global refs, no `any` | 7.4 |

### Done when

- [ ] `createGameModel(bus)` returns `{ selectedEntity: ShallowRef, score: ShallowRef }`
- [ ] Bus event updates ShallowRef synchronously
- [ ] `pnpm test:run` passes

---

## Step 8 — Composition Root + PoC Scene

Depends on: **Step 2, 4, 5, 6, 7**

### Tasks

| Task | Status | Depends On |
|------|--------|------------|
| 8.1 | `src/main.ts` — wire everything: createPixi, createWorld, createBus, createQueue, createLoop, register systems, createModel, mount Vue | 2, 4, 5, 6, 7 |
| 8.2 | PoC: 3×3 grid of 9 colored `Container`s with `Position`, `Visual`, `Selected` components | 8.1 |
| 8.3 | PoC: "Destroy" button in HUD → `markRemoved(selectedEntity.value)` | 8.2, 7.3 |
| 8.4 | `loop.pause()` / `resume()` wired to a HUD pause button | 8.1, 7.3 |
| 8.5 | **Test**: integration test — start app, select entity, destroy, assert model updates | 8.3 |
| 8.6 | **Review**: verify `main.ts` is the only wiring file, PoC is minimal and deletable | 8.5 |

### Done when

- [ ] `pnpm dev` shows 3×3 grid, click highlights, HUD shows entity ID, destroy removes it
- [ ] Pause stops input and simulation
- [ ] `pnpm test:run` passes integration test
- [ ] Deleting `PoC` code leaves a working empty template

---

## Step 9 — shadcn-vue Integration

Depends on: **Step 7**

### Tasks

| Task | Status | Depends On |
|------|--------|------------|
| 9.1 | `npx shadcn-vue init` — configure theme, path aliases, `components/` in `ui/` | 7 |
| 9.2 | Replace PoC HUD with shadcn components: `Button`, `Card` for HUD | 9.1, 8.3 |
| 9.3 | **Review**: verify shadcn components don't break `pointer-events` pattern, no CSS conflicts | 9.2 |

### Done when

- [ ] HUD uses shadcn-vue `Button` and `Card`
- [ ] Pixi canvas receives all non-HUD clicks
- [ ] `pnpm build` succeeds

---

## Step 10 — Full Test Suite

Depends on: **Step 3, 6, 7**

### Tasks

| Task | Status | Depends On |
|------|--------|------------|
| 10.1 | `command-queue.test.ts` — full: order, pause, resume, clear | 3 |
| 10.2 | `render-remove.test.ts` — create, mark removed, assert destroyed | 6 |
| 10.3 | `game-model.test.ts` — event → ShallowRef | 7 |
| 10.4 | `event-bus.test.ts` — on/off/emit, no leak | 3 |
| 10.5 | **Review**: all tests pass green, no console warnings, no memory leak | 10.3 |

### Done when

- [ ] All 10+ tests pass
- [ ] No uncleaned event listeners
- [ ] `pnpm test:run` clean
