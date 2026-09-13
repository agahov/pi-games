# 0011 — Project foundation

Status: Planned
Role: implementer
Prerequisites: none
Feature: [centered square](../../features/001-square.md)

## Scope

- Scaffold a minimal Vue/TypeScript/Vite application and full-viewport host.
- Install the [selected stack](../../doc/tech-stack.md), verify actual APIs/compatibility, and commit a reproducible lockfile to the project files (no git commit required).
- Configure Vitest, Playwright, and TypeScript checks. Playwright starts its own local app server.
- Add one meaningful application-mount smoke test; the square is not required yet.
- Document local install, development, and validation commands.

## Acceptance

Provide these npm scripts and run them:

- `npm run test:unit` — test runner executes a real passing smoke test, not an empty suite.
- `npm run test:e2e` — browser mounts the Vue host with no uncaught application errors.
- `npm run typecheck` — passes.
- `npm run build` — passes.

Record dependency/runtime requirements and any browser-install prerequisite. Do not label scaffold smoke tests as square-feature acceptance.

## Exclusions

No ECS world, renderer port, RenderSystem, Pixi canvas, square behavior, or generic framework.

## Evidence

Not run; implementation pending. Record commands and observed results here.

## Handoff

On success: mark this task Done; keep feature In progress; point CURRENT.md to [0012](0012-game-render-system.md); stop.
