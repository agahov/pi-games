import { expect, test } from '@playwright/test'

test('renders a visible centered square without application errors', async ({ page }) => {
  const pageErrors: Error[] = []
  const consoleErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  await page.setViewportSize({ width: 800, height: 600 })
  await page.goto('/')
  const host = page.getByTestId('game-host')
  await expect(host).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(1)

  const renderedSquare = async () => page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('2d')
    const bounds = canvas.getBoundingClientRect()
    if (!context || canvas.width === 0 || canvas.height === 0 || bounds.width === 0 || bounds.height === 0) {
      return null
    }

    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
    let minX = canvas.width
    let minY = canvas.height
    let maxX = -1
    let maxY = -1
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const index = (y * canvas.width + x) * 4
        const red = pixels[index]
        const green = pixels[index + 1]
        const blue = pixels[index + 2]
        const alpha = pixels[index + 3]
        if (alpha > 200 && red > 220 && green > 150 && green < 240 && blue < 80) {
          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x)
          maxY = Math.max(maxY, y)
        }
      }
    }

    if (maxX < minX || maxY < minY) return null
    const scaleX = canvas.width / bounds.width
    const scaleY = canvas.height / bounds.height
    return {
      x: Math.round(minX / scaleX),
      y: Math.round(minY / scaleY),
      width: Math.round((maxX - minX + 1) / scaleX),
      height: Math.round((maxY - minY + 1) / scaleY),
      center: [pixels[(Math.floor(canvas.height / 2) * canvas.width + Math.floor(canvas.width / 2)) * 4],
        pixels[(Math.floor(canvas.height / 2) * canvas.width + Math.floor(canvas.width / 2)) * 4 + 1],
        pixels[(Math.floor(canvas.height / 2) * canvas.width + Math.floor(canvas.width / 2)) * 4 + 2]],
    }
  })

  const logicalAreaAndLetterboxColors = async () => page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('2d')
    const bounds = canvas.getBoundingClientRect()
    if (!context || bounds.width === 0 || bounds.height === 0) return null

    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
    const pixelAt = (x: number, y: number) => {
      const pixelX = Math.min(canvas.width - 1, Math.floor(x * canvas.width / bounds.width))
      const pixelY = Math.min(canvas.height - 1, Math.floor(y * canvas.height / bounds.height))
      const index = (pixelY * canvas.width + pixelX) * 4
      return [pixels[index], pixels[index + 1], pixels[index + 2]]
    }

    return {
      letterbox: pixelAt(10, 10),
      logicalArea: pixelAt(10, 100),
    }
  })

  await expect.poll(renderedSquare).toEqual({
    x: 368,
    y: 268,
    width: 64,
    height: 64,
    center: [250, 204, 21],
  })

  for (const viewport of [{ width: 800, height: 600 }, { width: 280, height: 400 }]) {
    await page.setViewportSize(viewport)
    await expect.poll(() => host.boundingBox()).toEqual({ x: 0, y: 0, ...viewport })
  }
  await expect.poll(async () => {
    const colors = await logicalAreaAndLetterboxColors()
    return colors !== null && colors.logicalArea.join(',') !== colors.letterbox.join(',')
  }).toBe(true)

  expect(pageErrors).toEqual([])
  expect(consoleErrors).toEqual([])
})
