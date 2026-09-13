# 0012 — Game and RenderSystem

Status: Planned
Role: implementer
Prerequisite: [0011](0011-project-foundation.md) Done
Feature: [centered square](../../features/001-square.md)

## Scope

- Implement Game initialization/disposal and feature-configured ECS square state.
- Define the smallest typed renderer port required by the [architecture](../../doc/architecture.md).
- Implement presentation RenderSystem using ECS queries and an injected renderer port.
- Synchronize entity creation, changed visual data, and removal; keep only presentation bookkeeping, not a second game hierarchy.
- Test with a fake adapter; do not expose ECS mutation through Vue-facing APIs.

## Acceptance

- `npm run test:unit` passes, including headless initial state: exactly one square at origin, size from feature configuration.
- Fake-port tests verify create, update after component change, remove after entity deletion, and no duplicate creation on repeated synchronization. Repeated unchanged update calls are acceptable; optimization is not required.
- Game/RenderSystem tests need no DOM or PixiJS runtime.
- `npm run test:e2e` retains the application-mount smoke test.
- `npm run typecheck` and `npm run build` pass.

## Exclusions

No PixiAdapter, browser rendering, gameplay controls, full-world snapshots, event bus, or simulation loop.

## Evidence

Not run; implementation pending. Record commands and observed results here.

## Handoff

On success: mark this task Done; keep feature In progress; point CURRENT.md to [0013](0013-pixi-integration.md); stop.
