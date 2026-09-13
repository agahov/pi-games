# 0011 — Project foundation

Status: Done
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

- `npm run test:unit` — passed: 1 file and 1 test passed (`tests/unit/app.test.ts`).
- `npm run test:e2e` — passed: 1 Chromium browser test passed; the test starts Vite through Playwright `webServer` and observed no page errors or console errors. Required once in this environment: `npx playwright install chromium`.
- `npm run typecheck` — passed: `vue-tsc --noEmit` completed successfully.
- `npm run build` — passed: Vite 7.3.6 production build completed successfully.

Runtime requirement: Node.js 22.23.2 and npm 10.9.8 were used. Reproducible install is `npm ci` using `package-lock.json`. Playwright Chromium must be installed per environment with `npx playwright install chromium`.

## Parent verification

- Inspected the scaffold; tightened Playwright to use its own server with `--strictPort` and no server reuse.
- Added full-viewport bounding-box checks at 800×600 and 280×400; removed an unsupported minimum body width. Unit smoke test now accurately describes DOM mounting and unmounts its wrapper.
- First local test attempt failed because node_modules was absent (`vitest: command not found`). Ran `npm ci` successfully.
- Final independent rerun: `npm ci && npm run test:unit && npm run test:e2e && npm run typecheck && npm run build` passed (1 unit test, 1 Chromium test, typecheck, production build).
- `npm audit --json` reported two moderate development-tool findings for Vitest/@vitest/mocker (GHSA-82fw-gwwq-j7x9). Attempted a compatible Vitest 4.1.11 upgrade, but npm 10.9.8 dependency resolution repeatedly failed with `Cannot read properties of null (reading 'edgesOut')`. Restored the original lockfile and verified `npm ci` plus all checks again. Dependency remediation remains a documented follow-up; do not expose the test tooling server to untrusted networks.

## Handoff

On success: mark this task Done; keep feature In progress; point CURRENT.md to [0012](0012-game-render-system.md); stop.
