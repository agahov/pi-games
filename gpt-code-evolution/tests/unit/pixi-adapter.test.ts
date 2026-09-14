import { describe, expect, it, vi } from 'vitest'
import { PixiAdapter, type PixiApplicationLike, type PixiGraphicsLike } from '../../src/render/PixiAdapter'

// No real Pixi/Canvas runtime in isolated resource-lifecycle tests.
vi.mock('pixi.js', () => ({ Application: class {}, Graphics: class {} }))

function fixture() {
  let resolve!: () => void
  const ready = new Promise<void>((done) => { resolve = done })
  const host = document.createElement('main')
  const canvas = document.createElement('canvas')
  const graphics: Array<PixiGraphicsLike & { destroy: ReturnType<typeof vi.fn> }> = []
  const application = {
    canvas,
    stage: {
      x: 0, y: 0, visible: true,
      scale: { set: vi.fn() },
      addChild: vi.fn(), removeChild: vi.fn(),
    },
    renderer: { resize: vi.fn() },
    init: vi.fn(() => ready),
    render: vi.fn(),
    destroy: vi.fn(() => canvas.remove()),
  } satisfies PixiApplicationLike
  const adapter = new PixiAdapter(host, { logicalWidth: 800, logicalHeight: 600 }, {
    createApplication: () => application,
    createGraphics: () => {
      const graphic = {
        x: 0, y: 0,
        clear: vi.fn(), rect: vi.fn(), fill: vi.fn(), destroy: vi.fn(),
      }
      graphics.push(graphic)
      return graphic
    },
    getDevicePixelRatio: () => 2,
  })
  adapter.resize(800, 600)
  return { host, canvas, graphics, application, adapter, resolve }
}

describe('PixiAdapter resource lifecycle', () => {
  it('owns graphics and canvas, applies uniform resize, and disposes once', async () => {
    const f = fixture()
    const ready = f.adapter.initialize()
    f.resolve()
    await ready
    f.adapter.create(1, { x: 0, y: 0, size: 64 })
    expect(f.host.contains(f.canvas)).toBe(true)
    expect(f.adapter.graphicsCount).toBe(1)
    expect(f.graphics).toHaveLength(2) // Decorative logical area is not an entity.
    f.adapter.update(1, { x: 12, y: -8, size: 48 })
    expect(f.graphics[1]).toMatchObject({ x: 12, y: -8 })
    f.adapter.resize(1200, 600)
    expect(f.application.renderer.resize).toHaveBeenLastCalledWith(1200, 600, 2)
    expect(f.adapter.fit).toMatchObject({ scale: 1, offsetX: 200, offsetY: 0 })
    f.adapter.remove(1)
    f.adapter.remove(1)
    expect(f.graphics[1].destroy).toHaveBeenCalledOnce()
    f.adapter.dispose()
    f.adapter.dispose()
    expect(f.graphics.every((graphic) => graphic.destroy.mock.calls.length === 1)).toBe(true)
    expect(f.application.destroy).toHaveBeenCalledOnce()
    expect(f.host.contains(f.canvas)).toBe(false)
  })

  it('destroys late-initialized resources without attaching a canvas', async () => {
    const f = fixture()
    const ready = f.adapter.initialize()
    await Promise.resolve() // Begin the application's pending async initialization.
    expect(f.application.init).toHaveBeenCalledOnce()
    f.adapter.dispose()
    f.adapter.dispose()
    expect(f.application.destroy).not.toHaveBeenCalled()
    f.resolve()
    await ready
    expect(f.application.destroy).toHaveBeenCalledOnce()
    expect(f.host.contains(f.canvas)).toBe(false)
    expect(f.graphics).toHaveLength(0)
    expect(f.adapter.isInitialized).toBe(false)
  })
})
