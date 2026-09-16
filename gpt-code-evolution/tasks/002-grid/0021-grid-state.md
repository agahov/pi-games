# 0021 — Grid state

Status: Planned

- **Role.** Implementer.
- **Prerequisite.** Feature 001 Done.
- **Feature.** [Grid](../../features/002-grid.md).
- **Type.** New Archetype — Cell.
- **Scope.** Define the Cell recipe from existing Position + Square and its size default. Instantiate it from grid initialization values. Support an explicit single-cell fixture; keep the displayed scene unchanged until 0022.
- **Layout.** Compute centered positions from row, column, and cell size. No new GridSystem, tag, entity hierarchy, or per-frame layout.
- **Tests.** Headless grid has exactly 64 unique cells and expected bounds. Fake renderer receives 64 creates; repeat synchronization creates no duplicates; removal/disposal releases them.
- **Checks.** `npm run test:unit`, `npm run test:e2e`, `npm run typecheck`, `npm run build` all pass; existing single-square browser scenario remains valid.
- **Excluded.** Borders, default-scene replacement, and RenderSystem restructuring.
- **Evidence.** Not run.
- **Handoff.** Mark Done; keep feature In progress; point CURRENT.md to 0022; stop.
