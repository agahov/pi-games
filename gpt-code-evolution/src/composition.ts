import { GAME_CONFIG, Game, type GameConfig } from './game'
import type { RenderSquare, RendererPort } from './render'
import { PixiAdapter } from './render/PixiAdapter'
import { RenderSystem } from './render/RenderSystem'
import { measureHost } from './render/viewport'

export interface CompositionAdapter extends RendererPort {
  initialize(): Promise<void>
  resize(width: number, height: number): void
  render(): void
  dispose(): void
}

export interface ResizeObserverLike {
  observe(target: Element): void
  disconnect(): void
}

export type ResizeObserverFactory = (
  callback: (entries: ResizeObserverEntry[]) => void,
) => ResizeObserverLike

export interface CompositionDependencies {
  createAdapter?: (
    host: HTMLElement,
    config: Readonly<GameConfig>,
  ) => CompositionAdapter
  createResizeObserver?: ResizeObserverFactory
}

/** Owns the Game/presentation graph for one mounted Vue host. */
export class Composition {
  readonly game: Game
  readonly adapter: CompositionAdapter
  readonly renderSystem: RenderSystem

  private readonly host: HTMLElement
  private readonly createResizeObserver?: ResizeObserverFactory
  private resizeObserver: ResizeObserverLike | null = null
  private windowResizeHandler: (() => void) | null = null
  private initialization: Promise<void> | null = null
  private mounted = false
  private disposed = false

  constructor(
    host: HTMLElement,
    options: CompositionDependencies = {},
    config: Readonly<GameConfig> = GAME_CONFIG,
  ) {
    this.host = host
    this.createResizeObserver = options.createResizeObserver
    this.game = new Game(config)
    this.adapter = options.createAdapter?.(host, this.game.config)
      ?? new PixiAdapter(host, this.game.config)
    this.renderSystem = new RenderSystem(this.game.world, this.adapter)
  }

  get isDisposed(): boolean {
    return this.disposed
  }

  mount(): Promise<void> {
    if (this.mounted) return this.initialization ?? Promise.resolve()
    if (this.disposed) return Promise.resolve()

    this.mounted = true
    this.resizeHost()
    this.connectResizeObservation()

    try {
      this.initialization = this.adapter.initialize()
    } catch (error) {
      this.dispose()
      return Promise.reject(error)
    }

    this.initialization = this.initialization
      .then(() => {
        if (this.disposed) return
        this.renderSystem.synchronize()
        this.adapter.render()
      })
      .catch((error) => {
        if (!this.disposed) this.dispose()
        throw error
      })

    return this.initialization
  }

  dispose(): void {
    if (this.disposed) return

    this.disposed = true
    this.disconnectResizeObservation()
    this.renderSystem.dispose()
    this.adapter.dispose()
    this.game.dispose()
  }

  unmount(): void {
    this.dispose()
  }

  private resizeHost(): void {
    if (this.disposed) return
    const size = measureHost(this.host)
    this.adapter.resize(size.width, size.height)
  }

  private handleObservedResize(entries: ResizeObserverEntry[]): void {
    if (this.disposed) return

    const bounds = entries[0]?.contentRect
    if (bounds) {
      this.adapter.resize(bounds.width, bounds.height)
    } else {
      this.resizeHost()
    }
  }

  private connectResizeObservation(): void {
    const factory = this.createResizeObserver ?? (
      typeof ResizeObserver === 'function'
        ? (callback: (entries: ResizeObserverEntry[]) => void) => new ResizeObserver(callback)
        : undefined
    )

    if (factory) {
      this.resizeObserver = factory((entries) => this.handleObservedResize(entries))
      this.resizeObserver.observe(this.host)
      return
    }

    if (typeof window !== 'undefined') {
      this.windowResizeHandler = () => this.resizeHost()
      window.addEventListener('resize', this.windowResizeHandler)
    }
  }

  private disconnectResizeObservation(): void {
    this.resizeObserver?.disconnect()
    this.resizeObserver = null

    if (this.windowResizeHandler && typeof window !== 'undefined') {
      window.removeEventListener('resize', this.windowResizeHandler)
    }
    this.windowResizeHandler = null
  }
}

export function createComposition(
  host: HTMLElement,
  options: CompositionDependencies = {},
  config: Readonly<GameConfig> = GAME_CONFIG,
): Composition {
  return new Composition(host, options, config)
}

export type { RenderSquare }
