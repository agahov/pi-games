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

The unit test is a foundation mount smoke test; it is not square-feature acceptance.
