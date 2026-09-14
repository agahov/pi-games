import { Application, Graphics } from 'pixi.js'
import type { EntityId } from 'bitecs'
import type { GameConfig } from '../game/config'
import type { RenderSquare, RendererPort } from './RendererPort'
import { calculateUniformFit, measureHost, type HostSize, type UniformFit } from './viewport'

export interface PixiGraphicsLike {
  x: number
  y: number
  clear(): unknown
  rect(x: number, y: number, width: number, height: number): unknown
  fill(style: { color: number }): unknown
  destroy(options?: unknown): void
}

export interface PixiStageLike {
  x: number
  y: number
  scale: {
    set(x: number, y?: number): unknown
  }
  visible: boolean
  addChild(child: PixiGraphicsLike): unknown
  removeChild(child: PixiGraphicsLike): unknown
}

export interface PixiRendererLike {
  resize(width: number, height: number, resolution?: number): void
}

export interface PixiApplicationInitOptions {
  width: number
  height: number
  resolution: number
  autoDensity: boolean
  antialias: boolean
  backgroundColor: number
  autoStart: boolean
  preference: ['canvas']
}

export interface PixiApplicationLike {
  readonly stage: PixiStageLike
  readonly canvas: HTMLCanvasElement
  readonly renderer: PixiRendererLike
  init(options: PixiApplicationInitOptions): Promise<void>
  render(): void
  destroy(rendererDestroyOptions?: unknown, options?: unknown): void
}

export interface PixiAdapterOptions {
  createApplication?: () => PixiApplicationLike | Promise<PixiApplicationLike>
  createGraphics?: () => PixiGraphicsLike
  getDevicePixelRatio?: () => number
  resolution?: number | (() => number)
  backgroundColor?: number
  logicalAreaColor?: number
  squareColor?: number
}

const DEFAULT_BACKGROUND_COLOR = 0x162033
const DEFAULT_LOGICAL_AREA_COLOR = 0x243653
const DEFAULT_SQUARE_COLOR = 0xfacc15

function createDefaultApplication(): PixiApplicationLike {
  return new Application() as unknown as PixiApplicationLike
}

function createDefaultGraphics(): PixiGraphicsLike {
  return new Graphics() as unknown as PixiGraphicsLike
}

function finitePositive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback
}

function copySquare(square: RenderSquare): RenderSquare {
  return {
    x: square.x,
    y: square.y,
    size: square.size,
  }
}

/** The PixiJS presentation implementation of the renderer port. */
export class PixiAdapter implements RendererPort {
  private readonly applicationFactory: NonNullable<PixiAdapterOptions['createApplication']>
  private readonly graphicsFactory: NonNullable<PixiAdapterOptions['createGraphics']>
  private readonly backgroundColor: number
  private readonly logicalAreaColor: number
  private readonly squareColor: number
  private readonly getDevicePixelRatio: () => number
  private readonly resolutionOption: number | (() => number) | undefined
  private readonly graphics = new Map<EntityId, PixiGraphicsLike>()
  private readonly pendingSquares = new Map<EntityId, RenderSquare>()
  private application: PixiApplicationLike | null = null
  private logicalAreaGraphic: PixiGraphicsLike | null = null
  private initialization: Promise<void> | null = null
  private size: HostSize | null = null
  private currentFit: UniformFit
  private applicationInitialized = false
  private applicationDisposed = false
  private disposed = false

  constructor(
    private readonly host: HTMLElement,
    private readonly config: Pick<GameConfig, 'logicalWidth' | 'logicalHeight'>,
    options: PixiAdapterOptions = {},
  ) {
    this.applicationFactory = options.createApplication ?? createDefaultApplication
    this.graphicsFactory = options.createGraphics ?? createDefaultGraphics
    this.backgroundColor = options.backgroundColor ?? DEFAULT_BACKGROUND_COLOR
    this.logicalAreaColor = options.logicalAreaColor ?? DEFAULT_LOGICAL_AREA_COLOR
    this.squareColor = options.squareColor ?? DEFAULT_SQUARE_COLOR
    this.getDevicePixelRatio = options.getDevicePixelRatio ?? (() => {
      if (typeof window === 'undefined') return 1
      return window.devicePixelRatio
    })
    this.resolutionOption = options.resolution
    this.currentFit = calculateUniformFit(
      0,
      0,
      config.logicalWidth,
      config.logicalHeight,
    )
  }

  get isDisposed(): boolean {
    return this.disposed
  }

  get isInitialized(): boolean {
    return this.applicationInitialized && !this.disposed
  }

  get canvas(): HTMLCanvasElement | null {
    return this.application?.canvas ?? null
  }

  get fit(): UniformFit {
    return this.currentFit
  }

  get graphicsCount(): number {
    return this.graphics.size
  }

  initialize(): Promise<void> {
    if (this.initialization) return this.initialization
    if (this.disposed) return Promise.resolve()

    this.initialization = this.initializeApplication()
    return this.initialization
  }

  resizeToHost(): void {
    if (this.disposed) return
    const size = measureHost(this.host)
    this.resize(size.width, size.height)
  }

  resize(width: number, height: number): void {
    if (this.disposed) return

    this.size = {
      width: Number.isFinite(width) ? Math.max(0, width) : 0,
      height: Number.isFinite(height) ? Math.max(0, height) : 0,
    }

    if (!this.applicationInitialized) return

    this.applyResize(this.size)
    this.render()
  }

  create(entity: EntityId, square: RenderSquare): void {
    if (this.disposed) return

    if (!this.applicationInitialized) {
      this.pendingSquares.set(entity, copySquare(square))
      return
    }

    const existing = this.graphics.get(entity)
    if (existing) {
      this.drawSquare(existing, square)
      return
    }

    this.createGraphic(entity, square)
  }

  update(entity: EntityId, square: RenderSquare): void {
    if (this.disposed) return

    if (!this.applicationInitialized) {
      this.pendingSquares.set(entity, copySquare(square))
      return
    }

    const graphic = this.graphics.get(entity)
    if (graphic) this.drawSquare(graphic, square)
  }

  remove(entity: EntityId): void {
    if (this.disposed) return

    this.pendingSquares.delete(entity)
    const graphic = this.graphics.get(entity)
    if (!graphic) return

    this.graphics.delete(entity)
    this.destroyGraphic(graphic)
  }

  render(): void {
    if (!this.applicationInitialized || this.disposed) return
    this.application?.render()
  }

  dispose(): void {
    if (this.disposed) return

    this.disposed = true
    this.pendingSquares.clear()

    for (const graphic of this.graphics.values()) {
      this.destroyGraphic(graphic)
    }
    this.graphics.clear()

    if (this.logicalAreaGraphic) {
      this.destroyGraphic(this.logicalAreaGraphic)
      this.logicalAreaGraphic = null
    }

    if (this.applicationInitialized && this.application) {
      this.disposeApplication(this.application)
    }
  }

  private async initializeApplication(): Promise<void> {
    let application: PixiApplicationLike

    try {
      application = await this.applicationFactory()
    } catch (error) {
      if (this.disposed) return
      throw error
    }

    this.application = application
    const initialSize = this.size ?? measureHost(this.host)
    this.size = initialSize

    try {
      await application.init({
        width: finitePositive(initialSize.width, finitePositive(this.config.logicalWidth, 1)),
        height: finitePositive(initialSize.height, finitePositive(this.config.logicalHeight, 1)),
        resolution: this.resolveResolution(),
        autoDensity: true,
        antialias: true,
        backgroundColor: this.backgroundColor,
        autoStart: false,
        preference: ['canvas'],
      })
    } catch (error) {
      this.disposeApplication(application)
      if (this.disposed) return
      throw error
    }

    this.applicationInitialized = true

    if (this.disposed) {
      this.disposeApplication(application)
      return
    }

    this.applyResize(this.size)
    this.createLogicalAreaGraphic()
    this.host.appendChild(application.canvas)
    this.flushPendingSquares()
    this.render()
  }

  private resolveResolution(): number {
    const configuredResolution = typeof this.resolutionOption === 'function'
      ? this.resolutionOption()
      : this.resolutionOption
    const resolution = configuredResolution ?? this.getDevicePixelRatio()

    return finitePositive(resolution, 1)
  }

  private applyResize(size: HostSize): void {
    const application = this.application
    if (!application) return

    const fit = calculateUniformFit(
      size.width,
      size.height,
      this.config.logicalWidth,
      this.config.logicalHeight,
    )
    this.currentFit = fit

    if (size.width > 0 && size.height > 0) {
      application.renderer.resize(size.width, size.height, this.resolveResolution())
    }

    const canvas = application.canvas
    canvas.style.width = `${size.width}px`
    canvas.style.height = `${size.height}px`
    canvas.style.display = 'block'

    application.stage.x = fit.offsetX + fit.width / 2
    application.stage.y = fit.offsetY + fit.height / 2
    application.stage.scale.set(fit.scale, fit.scale)
    application.stage.visible = size.width > 0 && size.height > 0
  }

  private createLogicalAreaGraphic(): void {
    const application = this.application
    if (!application || this.logicalAreaGraphic) return

    const graphic = this.graphicsFactory()
    graphic.clear()
    graphic.rect(
      -this.config.logicalWidth / 2,
      -this.config.logicalHeight / 2,
      this.config.logicalWidth,
      this.config.logicalHeight,
    )
    graphic.fill({ color: this.logicalAreaColor })
    application.stage.addChild(graphic)
    this.logicalAreaGraphic = graphic
  }

  private flushPendingSquares(): void {
    for (const [entity, square] of this.pendingSquares) {
      this.createGraphic(entity, square)
    }
    this.pendingSquares.clear()
  }

  private createGraphic(entity: EntityId, square: RenderSquare): void {
    const application = this.application
    if (!application) return

    const graphic = this.graphicsFactory()
    this.drawSquare(graphic, square)
    application.stage.addChild(graphic)
    this.graphics.set(entity, graphic)
  }

  private drawSquare(graphic: PixiGraphicsLike, square: RenderSquare): void {
    graphic.x = square.x
    graphic.y = square.y
    graphic.clear()
    graphic.rect(-square.size / 2, -square.size / 2, square.size, square.size)
    graphic.fill({ color: this.squareColor })
  }

  private destroyGraphic(graphic: PixiGraphicsLike): void {
    try {
      this.application?.stage.removeChild(graphic)
    } catch {
      // A stage may already have been detached by an external teardown.
    }

    try {
      graphic.destroy({ context: true })
    } catch {
      // Destruction is intentionally idempotent for late or repeated teardown.
    }
  }

  private disposeApplication(application: PixiApplicationLike): void {
    if (this.applicationDisposed) return
    this.applicationDisposed = true

    try {
      application.destroy({ removeView: true }, { children: true })
    } catch {
      try {
        application.canvas.parentNode?.removeChild(application.canvas)
      } catch {
        // The resource was already detached.
      }
    } finally {
      this.applicationInitialized = false
      if (this.application === application) this.application = null
    }
  }
}
