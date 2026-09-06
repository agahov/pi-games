# Feature: platform

## Why

A minimal, dependency-light web game template that demonstrates how to wire
**ECS logic**, **Pixi rendering**, and **Vue UI** with a clean architectural
separation. Everything is typed, testable, and the PoC scene exercises every
layer end-to-end.

## Architecture

Three layers, two communication channels:

```
  ┌──────────┐   events (out)   ┌─────────────────────────┐
  │  Vue UI   │◄────────────────│         ECS              │
  │  (model)   │   commands (in) │  ┌─────┐ ┌───────────┐  │
  └───────────┘────────────────►│  │ world │ │ component │  │
  ┌──────────┐   commands (in)   │  ├─────┤ ├───────────┤  │
  │  Pixi     │──────────────────►│  │ loop │ │ eventBus  │  │
  │  (input)   │                   │  │queue │ │  + queue  │  │
  └───────────┘                   │  └─────┘ └───────────┘  │
                                   └─────────────────────────┘
```

**Commands** (inward): `commandQueue.push({ type, ... })` → drained at start
of every tick (`COMMAND_DRAIN` phase).

**Events** (outward): `eventBus.emit('entitySelected', { entityId })` → sync
callbacks update `ShallowRef` in `GameModel`.

All cross-layer types live in `src/types.ts` — one file, one contract, zero `any`.

## File layout

```
src/
  types.ts               ── Command / Event type contracts + CONTROL_TYPES
  kernel/
    event-bus.ts         ── createTypedBus<T>()
    command-queue.ts     ── createCommandQueue<T>(controlTypes)
    game-loop.ts         ── createGameLoop(ticker, queue, handler, bus)
    logger.ts            ── createLogger([domains])
  ecs/
    world.ts             ── BiteCS 0.4 wrapper (only file that imports bitecs)
    components.ts        ── Position, Visual, Selected, RemovedComponent
    systems/
      input-system.ts    ── handleCommand(): command → world mutation + event
      render-system.ts   ── sync/render/remove (Pixi ↔ world)
  pixi/
    scene.ts             ── PIX.Application factory + resize
    input.ts             ── pointer → Container.entityId → commandQueue.push()
  ui/
    model.ts             ── createGameModel(bus) → ShallowRefs
    App.vue              ── HUD component (injects model + callbacks)
    components/          ── shadcn-vue: Button, Card + sub-components
  main.ts                ── composition root (only wiring file)
  index.css              ── Tailwind v4 + theme CSS custom properties
  lib/
    utils.ts             ── cn() helper
```

## Key design decisions

### Control vs Gameplay commands

`CONTROL_TYPES` in `types.ts` — a `Set<string>` of command types that are
always enqueued (resize, setParam). Gameplay commands (selectEntity,
destroyEntity) are dropped when the queue is paused. `pause()` does NOT clear
the queue; it only blocks new gameplay pushes.

### Render bridge

`RenderSyncSystem` maintains `Map<EntityId, Graphics>` — the source of truth
for rendered entities. Per-frame full sync:
- New entities → create Graphics, add to stage + Map.
- Existing → update position/appearance.
- Dead → `RemoveRenderSystem` destroys Graphics, deletes from Map →
  `RemoveWorldSystem` calls `world.removeEntity()`.

### BiteCS specifics

- `bitecs@^0.4.0` — plain-object components, versioned entity IDs.
- `createWorld(createEntityIndex())` — versioning prevents stale-reference bugs.
- Flag components (Selected, RemovedComponent) use bitecs bitflag system directly.
- Data-bearing components (Position, Visual) store values in external Maps.

### DOM structure

Two independent layers:
```
#canvas-layer   ← Pixi canvas (gets all input by default)
#ui-layer       ← Vue app (pointer-events: none by default
                    children opt in with pointer-events: auto)
```

### GameModel

Closure factory, not a class. `createGameModel(bus)` returns a plain object
with `ShallowRef` values. Shared via Vue `provide/inject`.

### PoC scene

`main.ts` creates a 3×3 grid of 9 coloured `Graphics` containers. Clicking
selects (highlights + HUD shows ID), "Destroy" button flags removal,
"Pause/Resume" toggles the game loop.

## Done when

See [`acceptance.md`](./acceptance.md).
