# Feature 001: Two Squares

## Intent
Two squares on a PixiJS canvas. One static. One follows the mouse cursor.

## Architecture
See [`doc/ARCHITECTURE.md`](../../../doc/ARCHITECTURE.md). In short:
- **bitECS** `World` with `Position` and `Renderable` components on two entities: `StaticEntity`, `ChaserEntity`.
- `InputSystem` — reads `cmd_bus` mouse events, writes `MousePosition`.
- `ChaseSystem` — reads `MousePosition`, updates `ChaserEntity.Position`.
- `RenderSystem` — queries `[Renderable, Position]`, updates PixiJS display objects.
- Vue has a mount point (`#app`). PixiJS attaches to `#game` (sibling in body). They communicate via `cmd_bus` only.

## Acceptance Scenario
- **Given**: the 3-layer game scaffold with two entities (one static, one chaser), mouse input enabled via `cmd_bus`
- **When**: the user moves the mouse over the PixiJS canvas
- **Then**:
     - [ ] The chaser square moves toward the mouse position
     - [ ] The static square does not move
     - [ ] Both squares are visible on the canvas
     - [ ] No Vue ↔ PixiJS direct import
     - [ ] All communication between layers goes through `cmd_bus`

## Design Notes
- `cmd_bus` is a typed event emitter with a shared types module at `game/src/types/`.
- `shallowRef` holds UI-level state (e.g., "is game running", "score"). No per-entity reactivity.
- bitECS 0.4.0: `addComponent(world, eid, comp)`, SoA components `Position = { x: [] as number[], y: [] as number[] }`.
- See ADRs: `001` (sibling canvas), `002` (shallowRef), `003` (typed cmd_bus), `004` (bitecs 0.4.0).

## Status
draft
