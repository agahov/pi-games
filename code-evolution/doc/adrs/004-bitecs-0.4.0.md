# ADR-004: bitECS 0.4.0

## Status
Accepted — 2025-01-01

## Context
The game's logic layer is bitECS. We need to decide the version.

## Alternatives

### A: bitECS 0.3.x
Older API. `defineComponent({ x: Types.f32 })`, `defineQuery([Comp])`.
- **Pro**: Widely documented, many tutorials.
- **Con**: Old. Many removed APIs.

### B: bitECS 0.4.0
Current. `createWorld()`, `addComponent(world, eid, comp)`, `query(world, [Comp])`.
- **Pro**: Current. SoA plain objects. Observers. Prefabs. 5kb.
- **Con**: Smaller documentation/ community. API still stabilising.

## Decision
**B** — bitECS 0.4.0. Lock in the current version.

## Consequences
- No `defineComponent`, no `Types.f32`. Components are `{ x: [] as number[], y: [] as number[] }`.
- `addComponent` parameter order: `(world, eid, component)`.
- `query(world, [Comp])` is a direct call, not a pre-compiled query.
- Observers available: `observe(world, onAdd(Position), callback)`.

## History
- 2025-01-01: initial decision.
