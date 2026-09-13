# 0014 — Browser acceptance

Status: Planned
Role: implementer
Prerequisite: [0013](0013-pixi-integration.md) Done
Feature: [centered square](../../features/001-square.md)

## Scope

- Complete automated browser coverage for every observable feature acceptance criterion.
- Verify actual pixels or screenshots with explicit tolerances; canvas existence and internal-state assertions alone do not prove rendering.
- Exercise resize in one mounted session, full-viewport fitting, letterboxing, and unmount/remount without duplicate canvases.
- Combine browser lifecycle evidence with isolated tests for observer cleanup and pending initialization.
- Fix failures within this scope without weakening assertions; identify boundary changes separately.

## Acceptance

Run and record the full suite:

- `npm run test:unit`
- `npm run test:e2e`
- `npm run typecheck`
- `npm run build`

All pass. Link each [feature criterion](../../features/001-square.md) to its test/evidence, including the three specified viewport sizes, contrast, centering, unchanged game state, and teardown safety.

## Exclusions

No new behavior, architecture redesign, or self-approval as independent reviewer.

## Evidence

Not run; implementation pending. Record commands, test mapping, and observed results here.

## Handoff

On success: mark this task Done; set feature Test; point CURRENT.md to [0015](0015-review-demo-reflection.md); stop.
