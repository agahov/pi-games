# Game foundation

- **Requirements.** Node.js 22.23.2 or compatible; npm.
- **Map.** [Project](doc/map.md) · [Current work](CURRENT.md) · [Task runner](doc/task-runner.md).

## Setup

```sh
npm ci
npx playwright install chromium
npm run dev
```

## Checks

```sh
npm run test:unit
npm run test:e2e
npm run typecheck
npm run build
```
