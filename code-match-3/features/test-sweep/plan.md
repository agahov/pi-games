# Feature: test-sweep — Plan

| Task | Description | Status |
|------|-------------|--------|
| 1 | `game-model.test.ts` — event → ShallowRef (dedicated) | ⬜ |
| 2 | `command-queue.test.ts` — audit: pause/resume/clear coverage | ✅ done |
| 3 | `event-bus.test.ts` — audit: on/off/emit/no-leak | ✅ done |
| 4 | `render-system.test.ts` — audit: full removal pipeline | ✅ done |
| 5 | `pnpm test` (unit + e2e) — full sweep | ⬜ |
| 6 | No console warnings on `pnpm dev` | ⬜ |
| 7 | No memory leaks (event listeners) | ⬜ |
