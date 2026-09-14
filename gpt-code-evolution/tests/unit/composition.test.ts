import { describe, expect, it, vi } from 'vitest'
import { Composition, type CompositionAdapter, type ResizeObserverFactory } from '../../src/composition'
import type { EntityId } from 'bitecs'
import type { RenderSquare } from '../../src/render/RendererPort'

vi.mock('../../src/render/PixiAdapter', () => ({
  PixiAdapter: class {},
}))

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}

class FakeAdapter implements CompositionAdapter {
  readonly initialization = deferred<void>()
  readonly created: Array<{ entity: EntityId; square: RenderSquare }> = []
  readonly updated: Array<{ entity: EntityId; square: RenderSquare }> = []
  readonly removed: EntityId[] = []
  readonly resizeCalls: Array<{ width: number; height: number }> = []
  initializeCalls = 0
  renderCalls = 0
  disposeCalls = 0

  initialize(): Promise<void> {
    this.initializeCalls += 1
    return this.initialization.promise
  }

  resize(width: number, height: number): void {
    this.resizeCalls.push({ width, height })
  }

  render(): void {
    this.renderCalls += 1
  }

  dispose(): void {
    this.disposeCalls += 1
  }

  create(entity: EntityId, square: RenderSquare): void {
    this.created.push({ entity, square: { ...square } })
  }

  update(entity: EntityId, square: RenderSquare): void {
    this.updated.push({ entity, square: { ...square } })
  }

  remove(entity: EntityId): void {
    this.removed.push(entity)
  }
}

function hostWithSize(width: number, height: number): HTMLElement {
  const host = document.createElement('main')
  host.getBoundingClientRect = () => ({ width, height } as DOMRect)
  return host
}

function resizeObserverHarness() {
  let callback: ((entries: ResizeObserverEntry[]) => void) | null = null
  const observer = {
    observe: vi.fn(),
    disconnect: vi.fn(),
  }
  const createResizeObserver: ResizeObserverFactory = (next) => {
    callback = next
    return observer
  }

  return {
    observer,
    createResizeObserver,
    trigger: (width: number, height: number) => {
      callback?.([{ contentRect: { width, height } } as ResizeObserverEntry])
    },
  }
}

describe('Composition lifecycle', () => {
  it('synchronizes presentation, resizes without changing ECS, and releases resources once', async () => {
    const host = hostWithSize(800, 600)
    const adapter = new FakeAdapter()
    const observer = resizeObserverHarness()
    const composition = new Composition(host, {
      createAdapter: () => adapter,
      createResizeObserver: observer.createResizeObserver,
    })

    const initialization = composition.mount()
    expect(adapter.initializeCalls).toBe(1)
    expect(adapter.resizeCalls).toEqual([{ width: 800, height: 600 }])
    expect(observer.observer.observe).toHaveBeenCalledWith(host)

    adapter.initialization.resolve()
    await initialization

    const entity = composition.game.squareEntity
    expect(adapter.created).toEqual([
      { entity, square: { x: 0, y: 0, size: 64 } },
    ])
    expect(adapter.renderCalls).toBe(1)

    const { Position, Square } = composition.game.world.components
    const stateBeforeResize = {
      x: Position.x[entity],
      y: Position.y[entity],
      size: Square.size[entity],
    }

    observer.trigger(1200, 600)

    expect(adapter.resizeCalls.at(-1)).toEqual({ width: 1200, height: 600 })
    expect({ x: Position.x[entity], y: Position.y[entity], size: Square.size[entity] })
      .toEqual(stateBeforeResize)

    composition.dispose()
    composition.dispose()

    expect(observer.observer.disconnect).toHaveBeenCalledOnce()
    expect(adapter.removed).toEqual([entity])
    expect(adapter.disposeCalls).toBe(1)
    expect(composition.game.isDisposed).toBe(true)
  })

  it('releases a pending initialization after unmount without synchronizing presentation', async () => {
    const host = hostWithSize(800, 600)
    const adapter = new FakeAdapter()
    const observer = resizeObserverHarness()
    const composition = new Composition(host, {
      createAdapter: () => adapter,
      createResizeObserver: observer.createResizeObserver,
    })

    const initialization = composition.mount()
    composition.dispose()
    composition.dispose()
    observer.trigger(1200, 600)
    adapter.initialization.resolve()
    await initialization

    expect(adapter.created).toHaveLength(0)
    expect(adapter.renderCalls).toBe(0)
    expect(adapter.resizeCalls).toHaveLength(1)
    expect(adapter.disposeCalls).toBe(1)
    expect(observer.observer.disconnect).toHaveBeenCalledOnce()
    expect(composition.game.isDisposed).toBe(true)
  })
})
