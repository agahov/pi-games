import { expect, test, type Page, type TestInfo } from '@playwright/test'

type Viewport = {
  width: number
  height: number
}

type ViewportCase = Viewport & {
  squareSize: number
  logicalAreaWidth: number
  logicalAreaHeight: number
}

type PixelBox = {
  left: number
  top: number
  width: number
  height: number
  centerX: number
  centerY: number
}

type ScenePixels = {
  canvas: {
    cssWidth: number
    cssHeight: number
    physicalWidth: number
    physicalHeight: number
  }
  square: PixelBox | null
  logicalArea: PixelBox | null
  centerPixel: number[]
  logicalPixel: number[]
  letterboxPixel: number[] | null
}

type ObserverStats = {
  created: number
  observed: number
  callbacks: number
  disconnected: number
}

const SQUARE_COLOR = [250, 204, 21]
const LOGICAL_AREA_COLOR = [36, 54, 83]
const LETTERBOX_COLOR = [22, 32, 51]
const COLOR_TOLERANCE = 8
const GEOMETRY_TOLERANCE = 1

const viewportCases: ViewportCase[] = [
  {
    width: 800,
    height: 600,
    squareSize: 64,
    logicalAreaWidth: 800,
    logicalAreaHeight: 600,
  },
  {
    width: 1200,
    height: 900,
    squareSize: 96,
    logicalAreaWidth: 1200,
    logicalAreaHeight: 900,
  },
  {
    width: 1200,
    height: 600,
    squareSize: 64,
    logicalAreaWidth: 800,
    logicalAreaHeight: 600,
  },
  {
    width: 280,
    height: 400,
    squareSize: 22.4,
    logicalAreaWidth: 280,
    logicalAreaHeight: 210,
  },
]

function isClose(actual: number, expected: number, tolerance = GEOMETRY_TOLERANCE): boolean {
  return Math.abs(actual - expected) <= tolerance
}

function colorDistance(first: number[], second: number[]): number {
  return Math.sqrt(first.reduce((sum, value, index) => {
    const difference = value - (second[index] ?? 0)
    return sum + difference * difference
  }, 0))
}

function expectColor(actual: number[], expected: number[]): void {
  expect(actual).toHaveLength(3)
  for (const [index, channel] of actual.entries()) {
    expect(Math.abs(channel - (expected[index] ?? 0))).toBeLessThanOrEqual(COLOR_TOLERANCE)
  }
}

async function readScene(page: Page): Promise<ScenePixels | null> {
  try {
    const canvasLocator = page.locator('canvas')
    if (await canvasLocator.count() !== 1) return null

    return await canvasLocator.evaluate((element) => {
      const canvas = element as HTMLCanvasElement
      const context = canvas.getContext('2d')
      const bounds = canvas.getBoundingClientRect()
      if (!context || canvas.width === 0 || canvas.height === 0
        || bounds.width === 0 || bounds.height === 0) {
        return null
      }

      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
      const squareColor = [250, 204, 21]
      const logicalAreaColor = [36, 54, 83]

      const isColor = (index: number, color: number[]): boolean => pixels[index + 3] > 200
        && Math.abs(pixels[index] - color[0]) <= 8
        && Math.abs(pixels[index + 1] - color[1]) <= 8
        && Math.abs(pixels[index + 2] - color[2]) <= 8

      const toBox = (
        minX: number,
        minY: number,
        maxX: number,
        maxY: number,
      ): PixelBox | null => {
        if (maxX < minX || maxY < minY) return null

        const left = bounds.left + minX * bounds.width / canvas.width
        const top = bounds.top + minY * bounds.height / canvas.height
        const width = (maxX - minX + 1) * bounds.width / canvas.width
        const height = (maxY - minY + 1) * bounds.height / canvas.height
        return {
          left,
          top,
          width,
          height,
          centerX: left + width / 2,
          centerY: top + height / 2,
        }
      }

      const scanColor = (color: number[]): PixelBox | null => {
        let minX = canvas.width
        let minY = canvas.height
        let maxX = -1
        let maxY = -1

        for (let y = 0; y < canvas.height; y += 1) {
          for (let x = 0; x < canvas.width; x += 1) {
            const index = (y * canvas.width + x) * 4
            if (!isColor(index, color)) continue
            minX = Math.min(minX, x)
            minY = Math.min(minY, y)
            maxX = Math.max(maxX, x)
            maxY = Math.max(maxY, y)
          }
        }

        return toBox(minX, minY, maxX, maxY)
      }

      const pixelAt = (x: number, y: number): number[] => {
        const pixelX = Math.max(
          0,
          Math.min(canvas.width - 1, Math.floor((x - bounds.left) * canvas.width / bounds.width)),
        )
        const pixelY = Math.max(
          0,
          Math.min(canvas.height - 1, Math.floor((y - bounds.top) * canvas.height / bounds.height)),
        )
        const index = (pixelY * canvas.width + pixelX) * 4
        return [pixels[index], pixels[index + 1], pixels[index + 2]]
      }

      const scale = Math.min(bounds.width / 800, bounds.height / 600)
      const logicalWidth = 800 * scale
      const logicalHeight = 600 * scale
      const logicalLeft = bounds.left + (bounds.width - logicalWidth) / 2
      const logicalTop = bounds.top + (bounds.height - logicalHeight) / 2
      const sampleInset = Math.min(20 * scale, logicalWidth / 4, logicalHeight / 4)
      const hasHorizontalLetterbox = logicalLeft - bounds.left > 1
      const hasVerticalLetterbox = logicalTop - bounds.top > 1
      const letterboxPixel = hasHorizontalLetterbox
        ? pixelAt(bounds.left + Math.min(10, bounds.width / 4), bounds.top + bounds.height / 2)
        : hasVerticalLetterbox
          ? pixelAt(bounds.left + bounds.width / 2, bounds.top + Math.min(10, bounds.height / 4))
          : null

      return {
        canvas: {
          cssWidth: bounds.width,
          cssHeight: bounds.height,
          physicalWidth: canvas.width,
          physicalHeight: canvas.height,
        },
        square: scanColor(squareColor),
        logicalArea: scanColor(logicalAreaColor),
        centerPixel: pixelAt(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2),
        logicalPixel: pixelAt(logicalLeft + sampleInset, logicalTop + sampleInset),
        letterboxPixel,
      }
    })
  } catch {
    // The canvas can be replaced between the count and evaluate calls while Pixi initializes.
    return null
  }
}

async function waitForScene(page: Page, expected: ViewportCase): Promise<ScenePixels> {
  await expect.poll(async () => {
    const scene = await readScene(page)
    if (!scene?.square || !scene.logicalArea) return false

    const expectedLeft = (expected.width - expected.logicalAreaWidth) / 2
    const expectedTop = (expected.height - expected.logicalAreaHeight) / 2
    return isClose(scene.square.width, expected.squareSize)
      && isClose(scene.square.height, expected.squareSize)
      && isClose(scene.logicalArea.left, expectedLeft)
      && isClose(scene.logicalArea.top, expectedTop)
      && isClose(scene.logicalArea.width, expected.logicalAreaWidth)
      && isClose(scene.logicalArea.height, expected.logicalAreaHeight)
  }, { timeout: 10_000 }).toBe(true)

  const scene = await readScene(page)
  if (!scene) throw new Error('The rendered scene disappeared after it became ready.')
  return scene
}

function assertViewportScene(scene: ScenePixels, expected: ViewportCase): void {
  if (!scene.square || !scene.logicalArea) {
    throw new Error('The screenshot did not contain both the square and logical game area.')
  }

  const expectedLeft = (expected.width - expected.logicalAreaWidth) / 2
  const expectedTop = (expected.height - expected.logicalAreaHeight) / 2

  expect(isClose(scene.canvas.cssWidth, expected.width)).toBe(true)
  expect(isClose(scene.canvas.cssHeight, expected.height)).toBe(true)
  expect(scene.canvas.physicalWidth).toBeGreaterThan(0)
  expect(scene.canvas.physicalHeight).toBeGreaterThan(0)

  expect(isClose(scene.square.width, expected.squareSize)).toBe(true)
  expect(isClose(scene.square.height, expected.squareSize)).toBe(true)
  expect(isClose(scene.square.centerX, expected.width / 2)).toBe(true)
  expect(isClose(scene.square.centerY, expected.height / 2)).toBe(true)

  expect(isClose(scene.logicalArea.left, expectedLeft)).toBe(true)
  expect(isClose(scene.logicalArea.top, expectedTop)).toBe(true)
  expect(isClose(scene.logicalArea.width, expected.logicalAreaWidth)).toBe(true)
  expect(isClose(scene.logicalArea.height, expected.logicalAreaHeight)).toBe(true)

  expectColor(scene.centerPixel, SQUARE_COLOR)
  expectColor(scene.logicalPixel, LOGICAL_AREA_COLOR)
  expect(colorDistance(scene.centerPixel, scene.logicalPixel)).toBeGreaterThan(100)

  const hasLetterbox = expected.logicalAreaWidth < expected.width
    || expected.logicalAreaHeight < expected.height
  if (hasLetterbox) {
    expect(scene.letterboxPixel).not.toBeNull()
    if (scene.letterboxPixel) expectColor(scene.letterboxPixel, LETTERBOX_COLOR)
  } else {
    expect(scene.letterboxPixel).toBeNull()
  }
}

async function attachScreenshot(page: Page, testInfo: TestInfo, viewport: Viewport): Promise<void> {
  await testInfo.attach(`square-${viewport.width}x${viewport.height}`, {
    body: await page.screenshot({ animations: 'disabled', scale: 'css' }),
    contentType: 'image/png',
  })
}

async function installResizeObserverInstrumentation(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const stats = {
      created: 0,
      observed: 0,
      callbacks: 0,
      disconnected: 0,
    }
    Object.defineProperty(window, '__squareAcceptanceResizeObserver', {
      configurable: true,
      value: stats,
    })

    const NativeResizeObserver = window.ResizeObserver
    if (!NativeResizeObserver) return

    class TrackingResizeObserver extends NativeResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        super((entries, observer) => {
          stats.callbacks += 1
          callback(entries, observer)
        })
        stats.created += 1
      }

      override observe(target: Element, options?: ResizeObserverOptions): void {
        stats.observed += 1
        super.observe(target, options)
      }

      override disconnect(): void {
        stats.disconnected += 1
        super.disconnect()
      }
    }

    window.ResizeObserver = TrackingResizeObserver
  })
}

async function readResizeObserverStats(page: Page): Promise<ObserverStats | null> {
  return page.evaluate(() => {
    const stats = (window as unknown as {
      __squareAcceptanceResizeObserver?: ObserverStats
    }).__squareAcceptanceResizeObserver
    return stats ? { ...stats } : null
  })
}

async function unmountVueApp(page: Page): Promise<{
  canvasCount: number
  observerStats: ObserverStats | null
}> {
  return page.evaluate(() => {
    const root = document.querySelector('#app') as (HTMLElement & {
      __vue_app__?: { unmount: () => void }
    }) | null
    if (!root?.__vue_app__) throw new Error('The Vue application handle was not found.')

    root.__vue_app__.unmount()
    const stats = (window as unknown as {
      __squareAcceptanceResizeObserver?: ObserverStats
    }).__squareAcceptanceResizeObserver
    return {
      canvasCount: document.querySelectorAll('canvas').length,
      observerStats: stats ? { ...stats } : null,
    }
  })
}

test('renders the square at every acceptance viewport through resize', async ({ page }, testInfo) => {
  const pageErrors: Error[] = []
  const consoleErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  await page.setViewportSize(viewportCases[0])
  await page.goto('/')
  const host = page.getByTestId('game-host')
  await expect(host).toBeVisible()

  for (const viewport of viewportCases) {
    await page.setViewportSize(viewport)
    await expect.poll(async () => {
      const box = await host.boundingBox()
      return box !== null
        && isClose(box.x, 0)
        && isClose(box.y, 0)
        && isClose(box.width, viewport.width)
        && isClose(box.height, viewport.height)
    }).toBe(true)

    await expect(page.locator('canvas')).toHaveCount(1)
    const scene = await waitForScene(page, viewport)
    assertViewportScene(scene, viewport)
    await attachScreenshot(page, testInfo, viewport)
  }

  expect(pageErrors).toEqual([])
  expect(consoleErrors).toEqual([])
})

test('unmounts and remounts the real app without duplicate canvases or observer callbacks', async ({ page }, testInfo) => {
  const pageErrors: Error[] = []
  const consoleErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  await installResizeObserverInstrumentation(page)
  await page.setViewportSize(viewportCases[0])
  await page.goto('/')
  await expect(page.getByTestId('game-host')).toBeVisible()
  const initialScene = await waitForScene(page, viewportCases[0])
  assertViewportScene(initialScene, viewportCases[0])
  await expect(page.locator('canvas')).toHaveCount(1)

  const firstUnmount = await unmountVueApp(page)
  expect(firstUnmount.canvasCount).toBe(0)
  expect(firstUnmount.observerStats).not.toBeNull()
  if (!firstUnmount.observerStats) throw new Error('Resize observer instrumentation was not installed.')
  expect(firstUnmount.observerStats.created).toBeGreaterThan(0)
  expect(firstUnmount.observerStats.observed).toBe(firstUnmount.observerStats.created)
  expect(firstUnmount.observerStats.disconnected).toBe(firstUnmount.observerStats.created)
  const callbacksAfterUnmount = firstUnmount.observerStats.callbacks
  await page.setViewportSize({ width: 1200, height: 600 })
  await page.waitForTimeout(100)
  const afterResize = await readResizeObserverStats(page)
  expect(afterResize?.callbacks).toBe(callbacksAfterUnmount)
  expect(afterResize?.disconnected).toBe(firstUnmount.observerStats.created)

  await page.setViewportSize(viewportCases[0])
  // Re-run the real entry module without replacing the document or observer counters.
  await page.addScriptTag({ type: 'module', url: '/src/main.ts?acceptance-remount=1' })
  await expect(page.getByTestId('game-host')).toBeVisible()
  const remountedScene = await waitForScene(page, viewportCases[0])
  assertViewportScene(remountedScene, viewportCases[0])
  await expect(page.locator('canvas')).toHaveCount(1)
  const remountStats = await readResizeObserverStats(page)
  expect(remountStats).not.toBeNull()
  if (!remountStats) throw new Error('Resize observer instrumentation was not installed after remount.')
  expect(remountStats.created).toBeGreaterThan(firstUnmount.observerStats.created)
  expect(remountStats.observed).toBe(remountStats.created)
  expect(remountStats.disconnected).toBe(firstUnmount.observerStats.disconnected)
  await attachScreenshot(page, testInfo, viewportCases[0])

  const secondUnmount = await unmountVueApp(page)
  expect(secondUnmount.canvasCount).toBe(0)
  expect(secondUnmount.observerStats).not.toBeNull()
  if (!secondUnmount.observerStats) throw new Error('Resize observer instrumentation was not installed on final unmount.')
  expect(secondUnmount.observerStats.disconnected).toBe(secondUnmount.observerStats.created)

  expect(pageErrors).toEqual([])
  expect(consoleErrors).toEqual([])
})
