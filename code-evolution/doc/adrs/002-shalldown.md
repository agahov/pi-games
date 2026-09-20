# ADR-002: shallowRef for UI Game State

## Status
Accepted — 2025-01-01

## Context
The `EventAdapter` receives events from ECS systems and must make the game state available to the Vue UI layer.
We need to choose between `ref` (deep reactivity) and `shallowRef` (shallow reactivity) as the Vue primitive.

## Alternatives

### A: `ref` (deep reactivity)
Vue deeply tracks changes in the nested object structure. Every nested field is reactive.
- **Pro**: UI reacts to any sub-field change automatically.
- **Con**: Deep reactivity overhead for large or frequently-changing state. Game state changes at 60fps; this is wasted.

### B: `shallowRef`
Vue reacts only when the top-level `.value` is reassigned. No deep tracking.
- **Pro**: Minimal reactivity overhead. Matches 60fps game update frequency. Coarse UI updates (HUD, status, "game over") are all top-level events.
- **Con**: If UI needs to react to a nested field, you must reassign the whole ref. Requires discipline.

## Decision
**B** — `shallowRef` for all UI-bound game state.

## Consequences
- `EventAdapter` reassigns `.value` when a coarse event occurs (entity spawned, game over, etc.).
- Per-entity position changes do not trigger Vue reactivity — they go to the `RenderSystem` → PixiJS pipeline.
- Vue must be disciplined: it only handles coarse UI state.

## History
- 2025-01-01: initial decision.
