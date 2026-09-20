# ADR-003: Typed Command Bus

## Status
Accepted — 2025-01-01

## Context
The three layers (Vue, bitECS, PixiJS) communicate via `cmd_bus`. We need to decide the bus type.

## Alternatives

### A: String-keyed event emitter
`cmd_bus.emit('mouseMove', {x, y})`. Handlers registered by string. No type safety.
- **Pro**: Simple. Fast to implement. Minimal.
- **Con**: No compile-time safety. String typos cause silent failures. Hard to refactor.

### B: Typed event emitter, shared types module
Each command/event has a TypeScript type. `cmd_bus.emit(msg)` where `msg` is a discriminated union.
- **Pro**: Catch errors at compile time. Refactor-friendly. Clear contract.
- **Con**: Upfront effort to define types. Slightly more boilerplate.

### C: bitECS observers as event system
`observe(world, onAdd(Position), callback)`. No separate bus.
- **Pro**: Reuse existing ECS reactivity. No new infrastructure.
- **Con**: Violates layer independence. ECS becomes the event bus, coupling UI to ECS internals.

## Decision
**B** — typed event emitter with a shared types module at `game/src/types/`.

## Consequences
- All layers import from `game/src/types/` for command/event definitions.
- `cmd_bus` itself is a thin generic emitter parameterised by these types.
- Refactoring a command type updates all handlers automatically.
- No layer knows about another layer's internals — only the shared types.

## History
- 2025-01-01: initial decision.
