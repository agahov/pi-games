# Centered Square

## Requirements

Use Node.js 22.23.2 (or a compatible current Node.js release) and npm. Install the project dependencies from the committed lockfile with `npm ci`.

Playwright requires its Chromium browser to be installed once per environment:

```sh
npx playwright install chromium
```

## Local development

```sh
npm ci
npm run dev
```

## Validation

```sh
npm run test:unit
npm run test:e2e
npm run typecheck
npm run build
```

The tests currently cover Game state, presentation fitting/lifecycle, and a basic visible-square browser scenario. Full feature acceptance and review are tracked in CURRENT.md.

## Automated task execution

See [task runner](doc/task-runner.md) for sequential Luna implementation, checks, review, and per-task commits. Preview with `python3 scripts/run_tasks.py`; execute explicitly with `--run` from a clean repository.
