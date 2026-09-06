/**
 * Boot-time console hygiene (sweep task 6).
 *
 * Asserts the app boots with no *errors* — uncaught page exceptions and
 * `console.error` calls. Headless-only noise is intentionally out of scope:
 *   - WebGL/GL driver performance messages (e.g. "GPU stall due to ReadPixels")
 *     are emitted by the test runner's software GL context, not by the app or
 *     a real browser during `pnpm dev`.
 *
 * Run: `pnpm test:e2e -- console-clean`
 */

import { test, expect } from '@playwright/test'

// Messages we treat as benign and ignore.
const IGNORED = /(GL Driver Message|WebGL-|vite.*connecting|\[init\]|\[loop\]|\[render\])/i

test('page boots without errors or uncaught exceptions', async ({ page }) => {
  const errors: string[] = []

  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !IGNORED.test(msg.text())) {
      errors.push(`console.error: ${msg.text()}`)
    }
   })

  await page.goto('/')
  // Let a few frames render + the boot sequence settle.
  await page.waitForTimeout(1000)

  expect(errors, `boot produced errors:\n${errors.join('\n')}`).toEqual([])
})
