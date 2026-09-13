# Technology stack

Status: Selected; dependency versions verified during implementation.

| Concern | Technology |
|---|---|
| Language | TypeScript |
| UI and canvas host | Vue |
| Build/dev server | Vite |
| Game state and systems | bitECS |
| Graphics | PixiJS |
| Isolated/API tests | Vitest |
| Browser acceptance tests | Playwright |

Keep game logic independent of Vue and PixiJS. Inspect installed library APIs before implementation; commit dependency versions and lockfile with the first implementation.

Boundaries: [architecture.md](architecture.md).
