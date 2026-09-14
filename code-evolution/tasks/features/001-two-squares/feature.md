# Feature 001: Two Squares

## Intent
Two squares on a PixiJS canvas. One static. One follows the mouse cursor.

## Architecture
Three layers communicating through `cmd_bus`:
- **Vue (UI)**: HTML overlay, buttons, labels. Mounts to `#app`. Reactive state via `shallowRef` fed by `EventAdapter`.
- **bitECS (logic)**: `createWorld()`, two entities (`StaticEntity`, `ChaserEntity`). Components: `Position`, `Renderable`. Systems: `InputSystem`, `ChaseSystem`, `RenderSystem`.
- **PixiJS (render)**: Attaches to `#game` (sibling of `#app`). `RenderSystem` reads `Position` + `Renderable` and updates sprite positions.

Data flow:
- `Pixi mouse event → cmd_bus → InputSystem → MousePosition component → ChaseSystem → ChaserEntity.Position`
- `ECS Position component → RenderSystem → PixiJS sprite position`
- `ECS events → EventAdapter → shallowRef → Vue UI`

## Acceptance Scenario
- **Given**: the 3-layer game scaffold with two entities, one static one chaser, mouse input enabled
- **When**: the user moves the mouse over the PixiJS canvas
- **Then**:
    - [ ] The chaser square moves to the mouse position
    - [ ] The static square does not move
    - [ ] Both squares are visible on the canvas
    - [ ] No Vue ↔ PixiJS direct import
    - [ ] All communication between layers goes through `cmd_bus`

## Design Notes
- `cmd_bus` is a typed event emitter with a shared types module (`game/src/types/`).
- bitECS 0.4.0 API: `addComponent(world, eid, component)`, `query(world, [Comp])`.
- `shallowRef` holds UI-level state (e.g., "is game running", "current score"), not per-entity data.

## Status
draft
