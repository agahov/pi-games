# Tech Decisions — Web Game Template

## Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Language | TypeScript | Strict mode, no `any` in template code |
| Build | Vite | Dev server + production build |
| UI | Vue 3 SFCs (`<script setup lang="ts">`) | `provide/inject` for model sharing |
| Rendering | PixiJS v8 (`pixi.js@^8`) | WebGL2, separate DOM layer |
| ECS | bitecs `^0.4.0` | Thin typed wrapper, BiteCS is internal |
| Styling | shadcn-vue | Pre-configured, optional layer |
| Testing | Vitest | 3 example tests shipped |

## Architecture

Three layers, two communication channels:

```
Vue (UI) ←── events (outward) ──→ ECS (logic)
Vue (UI) ──→ commands (inward) ──→ ECS (logic)
Pixi (render) ──→ commands (inward) ────→ ECS (logic)
```

### Communication channels

- **Commands** (inward): `commandQueue.push({ type, ... })`. Drained at start of each tick.
- **Events** (outward): `eventBus.emit('entitySelected', { entityId })`. Sync callbacks update `ShallowRef` in `GameModel`.
- Both typed via a single union in `types.ts` — one API contract, no `any`.

### Kernel: GameLoop

- `Ticker` interface in `src/kernel/game-loop.ts` — `{ add, remove, stop, start }` — Pixi's `app.ticker` structurally satisfies it but the loop is testable with a mock.
- `createGameLoop(ticker: Ticker, cmdQueue, eventBus)` with phases: `COMMAND_DRAIN → UPDATE → AFTER_UPDATE → RENDER`
- `loop.addSystem(fn, phase)` — strict phase ordering enforced by code
- `loop.pause()` — stops Ticker + pauses `cmdQueue` (clears + blocks)
- `loop.resume()` — starts Ticker + unpause `cmdQueue`
- `loop.destroy()` — stops everything
- `COMMAND_DRAIN` phase: auto-registered, drains `cmdQueue`

### Render bridge

`RenderSyncSystem` maintains `Map<EntityId, PIXI.Container>`. Per-frame full sync:
- New entities → create Container, add to stage and Map.
- Existing entities → update Container position/appearance.
- Dead entities → `RemoveRenderSystem` queries `[RenderComponent, RemovedComponent]`, destroys Container, deletes from Map.

**Entity tagging**: `Container.entityId = id` (module augmentation on `PIXI.Container`). Child sprites bubble to parent Container.

**Deletion**: `markRemoved(entity)` adds `RemovedComponent`. No direct `world.removeEntity` in game code — all destruction goes through the flag. `RemoveSystem` (last system) deregisters from world.

### GameModel

Closure factory (not a class):

```ts
export function createGameModel(eventBus: EventBus) {
  const selectedEntity = shallowRef<EntityId | null>(null)
  const score = shallowRef(0)

  eventBus.on('entitySelected', (id) => { selectedEntity.value = id })

  return { selectedEntity, score }
}
```

Wired once in `main.ts`. Shared via `provide(KEY, model)`.

### Lifecycle

- `loop.pause()` — stops Ticker + pauses `commandQueue` (clears + blocks). No stale commands survive.
- `loop.resume()` — starts Ticker + unpause `commandQueue`. First post-resume command is processed normally.
- `destroy()` — stops loop, destroys Pixi app, unmounts Vue, clears world.
- No state machine. Game-specific state (MENU, PLAYING, GAMEOVER) is a consumer concern.
- During pause: UI is visible but `commandQueue.push` no-ops. No coalescing, no `push`/`set` distinction.

## Layout

```
src/
  types.ts
  kernel/
    game-loop.ts
    event-bus.ts      # createTypedBus<T, E>()
    command-queue.ts  # createCommandQueue<T>()
  ecs/
    world.ts          # BiteCS 0.4 wrapper: createEntity, addPosition, markRemoved, query
    systems/
      input-system.ts     # Pixi pointer → EntityId → commandQueue
      render-system.ts    # RenderSyncSystem + RemoveRenderSystem
  pixi/
    scene.ts          # Pixi Application init, resize
    input.ts          # Pointer/keyboard wiring
  ui/
    model.ts          # createGameModel(eventBus)
    App.vue
    components/       # shadcn-vue: Button, Hud, etc.
  main.ts             # composition root (wires everything, starts in order)
```

## DOM structure

Two independent layers, `pointer-events` controlled:

```html
<div id="canvas-layer"></div>   <!-- Pixi canvas -->
<div id="ui-layer"              <!-- Vue app
  style="pointer-events: none">
</div>
```

Pixi gets all input by default. HUD components opt into `pointer-events: auto`.

## BiteCS specifics

- `bitecs@^0.4.0` — plain-object components, no `defineComponent`, no pre-compiled queries.
- `createWorld(createEntityIndex())` — versioned entity IDs prevent stale-reference bugs.
- `RemoveRenderSystem` queries `[RenderComponent, RemovedComponent]` per-frame (no observers).
- `RemoveSystem` (last) calls `world.removeEntity` for all `[RemovedComponent]` entities.

## PoC scene

3×3 grid of colored `PIXI.Container`s (9 entities). Click selects (+ highlight), Vue HUD shows `selectedEntity`. "Destroy" button adds `RemovedComponent` → `RemoveRenderSystem` cleans up → `RemoveSystem` deregisters. ~50 lines, exercises every layer.
