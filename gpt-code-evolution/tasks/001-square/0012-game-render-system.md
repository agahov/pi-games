# 0012 — Game and RenderSystem

Status: Done
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

- `npm run test:unit` — passed: 2 files and 3 tests passed, including the headless Game and fake renderer-port lifecycle tests.
- `npm run test:e2e` — passed: 1 Chromium application-mount smoke test passed with no observed page or console errors.
- `npm run typecheck` — passed: `vue-tsc --noEmit` completed successfully.
- `npm run build` — passed: Vite 7.3.6 production build completed successfully.

## Parent verification

- Delegated only 0012 to `openai-codex/gpt-5.6-luna` with `--thinking max`.
- Inspected Game/config/ECS storage, renderer port, RenderSystem, and headless tests. No Vue/PixiJS runtime imports in Game or RenderSystem; no later-task rendering implementation added.
- Independently ran `npm run test:unit && npm run test:e2e && npm run typecheck && npm run build`: passed (3 unit tests across 2 files, 1 Chromium smoke test, typecheck, Vite production build).
- Browser coverage remains foundation-only; visible-square acceptance waits for Pixi integration. Full independent feature review remains task 0015.

## Handoff

On success: mark this task Done; keep feature In progress; point CURRENT.md to [0013](0013-pixi-integration.md); stop.
