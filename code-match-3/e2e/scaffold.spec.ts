import { test, expect } from '@playwright/test'

test('scaffold loads with two DOM layers', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('#canvas-layer')).toBeAttached()
    await expect(page.locator('#ui-layer')).toBeAttached()
})

test('ui-layer has pointer-events: none', async ({ page }) => {
    await page.goto('/')

    const pointerEvents = await page.locator('#ui-layer')
        .evaluate(el => getComputedStyle(el).pointerEvents)

    expect(pointerEvents).toBe('none')
})