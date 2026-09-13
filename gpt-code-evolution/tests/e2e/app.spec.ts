import { expect, test } from '@playwright/test'

test('Vue host mounts without application errors', async ({ page }) => {
  const pageErrors: Error[] = []
  const consoleErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  await page.goto('/')
  const host = page.getByTestId('game-host')
  await expect(host).toBeVisible()
  await expect(page.getByText('Game foundation')).toBeVisible()
  for (const viewport of [{ width: 800, height: 600 }, { width: 280, height: 400 }]) {
    await page.setViewportSize(viewport)
    await expect.poll(() => host.boundingBox()).toEqual({ x: 0, y: 0, ...viewport })
  }
  expect(pageErrors).toEqual([])
  expect(consoleErrors).toEqual([])
})
