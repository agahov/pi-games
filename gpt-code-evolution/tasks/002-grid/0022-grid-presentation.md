# 0022 — Grid presentation

Status: Planned

- **Role.** Implementer.
- **Prerequisite.** [0021](0021-grid-state.md) Done.
- **Feature.** [Grid](../../features/002-grid.md).
- **Type.** Updated Visualization + initialization selection; no new/extended game behavior.
- **Scope.** Switch the displayed scene to 8×8 Cell instances. Add configurable contrasting borders through PixiAdapter; retain the existing renderer port if no new per-entity data is needed.
- **Style.** Start with 1-world-unit borders; contain visible geometry within the specified grid bounds. Preserve distinguishable cells when scaled.
- **Tests.** Replace the default-scene browser assertion with grid pixel/screenshot checks at all three feature viewport sizes. Retain explicit single-cell regression coverage for reusable components where useful.
- **Lifetime.** Verify resize leaves world state unchanged and remount releases resources without duplicate canvases.
- **Checks.** `npm run test:unit`, `npm run test:e2e`, `npm run typecheck`, `npm run build` all pass. Map every feature criterion to evidence; use explicit pixel tolerances.
- **Excluded.** Interaction, new systems, event bus, and unsolicited RenderSystem refactoring.
- **Evidence.** Not run.
- **Handoff.** Mark Done; set feature Test; point CURRENT.md to 0023; stop.
