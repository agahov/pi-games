# Architecture

Implemented through square integration; full acceptance/review pending.

[Communication map](communication.md) · [ECS map](ecs-systems.md) · [Stack](tech-stack.md)

- **Game.** Owns ECS and rules; typed commands/queries expose only needed UI behavior.
- **Vue.** Owns host and UI-only state; never accesses ECS directly.
- **RenderSystem.** Queries visual components through ECS; uses an injected rendering port.
- **PixiAdapter.** Owns graphics, entity-to-graphic mapping, and viewport fitting.
- **Composition.** Owns wiring, invocation order, resize observation, and async teardown.
- **Configuration.** Game defines logical dimensions; presentation computes uniform fit. Resize never changes world state.
- **Trade-off.** RenderSystem couples to ECS schema, isolating PixiJS without full-world snapshots or another game hierarchy.
- **Deferred.** No event bus, simulation cadence, or generalized rendering until a feature needs it.

[ECS patterns](ecs-patterns.md) · [Glossary](glossary.md)
