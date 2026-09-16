# Glossary

- **Archetype.** Named entity recipe: components, defaults, and enabled behavior; not class inheritance or a required new component layout.
- **Cell.** Grid-location archetype using Position + Square.
- **Default behavior.** Existing behavior enabled by an archetype's components.
- **Initialization values.** Instance count, placement, and overrides applied at creation.
- **New behavior.** A missing game policy, not merely different data values.
- **Extended behavior.** A changed contract of existing behavior; not one system calling/inheriting another.
- **Visualization.** Presentation of entity state, separate from gameplay policy.

- **Game.** Owns ECS state, rules, and Game API.
- **Game API.** Typed commands and game-derived UI queries.
- **Command.** Request for a game action; Game validates it.
- **System.** One ECS policy; independent of other systems.
- **Component.** Entity data or capability selected by queries.
- **Tag component.** Presence/absence capability without a numeric payload.
- **Query membership.** Entities matching required/excluded components.
- **System map.** Boundary rationale and links to implementation/tests.
- **RenderSystem.** Synchronizes presentation through a renderer port.
- **Renderer port.** Typed external-effects interface used by RenderSystem.
- **PixiAdapter.** Owns Pixi resources and viewport fitting.
- **Composition.** Wiring, execution order, and lifetime owner.
- **Logical area.** Configured world area, independent of browser dimensions.
- **Letterboxing.** Unused space after uniform fitting.
- **UI projection.** Game-derived display values; not authoritative state.
- **UI-only state.** Vue-owned focus and panels.
