# Feature 002: 8×8 grid

Status: Planned

- **Outcome.** Replace the single square with a centered 8×8 grid.
- **Types.** New Archetype + updated Visualization.
- **Unchanged.** Behavior, UI, 800×600 logical area, uniform scaling, letterboxing.

## New Archetype — Cell

- **Description.** One grid location, represented by a square entity.
- **Components.** Existing Position + Square; no Cell tag or new component required.
- **Default behavior.** Existing RenderSystem synchronizes the entity's visual representation.
- **Defaults.** Square size: 64 world units.
- **Initialization.** 64 instances, eight rows × eight columns, centered as a 512×512 area. Positions are instance values, not a new system.

## Visualization — Cell borders

- **Change.** Add visible contrasting borders to existing square visuals.
- **Style.** Start with 1-world-unit borders; cells touch without gaps and remain within grid bounds.
- **Boundary.** PixiAdapter presentation configuration; no new RenderSystem or game behavior.
- **Excluded.** Selection, input, animation, cell content, and editing.

## Acceptance

- **State.** Exactly 64 cells, unique positions, eight rows/columns, no leftover single square.
- **Center.** Grid bounds are −256…256 on both axes; cell centers are −224, −160, −96, −32, 32, 96, 160, 224.
- **800×600.** Grid displays at 512×512 CSS pixels, starting at (144, 44).
- **1200×900.** Grid displays at 768×768 CSS pixels, starting at (216, 66); cells are 96×96.
- **1200×600.** Grid displays at 512×512 CSS pixels, starting at (344, 44); game-area side margins are 200px.
- **Visibility.** Browser pixels show eight distinct rows/columns and outer borders, without cropping or stretching.
- **Lifetime.** Resize preserves ECS state; remount creates one canvas and releases prior resources.

## References

- **Work.** [Task index](../tasks/002-grid/README.md); queued after feature 001 review.
- **Design.** [Architecture](../doc/architecture.md), [ECS map](../doc/ecs-systems.md), [stack](../doc/tech-stack.md).
