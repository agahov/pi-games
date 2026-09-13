# 0013 — Pixi integration

Status: Planned
Role: implementer
Prerequisite: [0012](0012-game-render-system.md) Done
Feature: [centered square](../../features/001-square.md)

## Scope

- Implement PixiAdapter against the existing renderer port: create/update/remove graphics and dispose resources.
- Implement pure uniform-fit calculation using configured logical dimensions; handle zero-sized hosts without invalid transforms.
- Wire Vue host, Game, RenderSystem, PixiAdapter, and resize observation through Composition.
- Draw the square on startup and redraw on resize; no gameplay simulation loop.
- Implement idempotent teardown and cancellation/disposed handling for initialization finishing after unmount.

## Acceptance

- `npm run test:unit` passes with fit-math checks for all [feature acceptance sizes](../../features/001-square.md).
- Lifecycle tests with controlled async initialization cover normal teardown, repeated cleanup, and late resolution; observers and graphics resources are released.
- `npm run test:e2e` passes, adding a basic actual-visible-square check (not just canvas existence). Broader browser scenarios belong to 0014.
- `npm run typecheck` and `npm run build` pass.
- Confirm resizing changes presentation only, not ECS square dimensions/position.

## Exclusions

No new gameplay, generic renderer framework, performance tuning, or independent review.

## Evidence

Not run; implementation pending. Record commands and observed results here.

## Handoff

On success: mark this task Done; keep feature In progress; point CURRENT.md to [0014](0014-browser-acceptance.md); stop.
