import { query, type EntityId } from 'bitecs'
import type { GameWorld } from '../game/ecs'
import type { RenderSquare, RendererPort } from './RendererPort'

export class RenderSystem {
  private readonly renderedEntities = new Set<EntityId>()
  private disposed = false

  constructor(
    private readonly world: GameWorld,
    private readonly renderer: RendererPort,
  ) {}

  synchronize(): void {
    if (this.disposed) return

    const { Position, Square } = this.world.components
    const currentEntities = new Set<EntityId>()

    for (const entity of query(this.world, [Position, Square])) {
      currentEntities.add(entity)
      const square: RenderSquare = {
        x: Position.x[entity],
        y: Position.y[entity],
        size: Square.size[entity],
      }

      if (this.renderedEntities.has(entity)) {
        this.renderer.update(entity, square)
      } else {
        this.renderer.create(entity, square)
      }
    }

    for (const entity of this.renderedEntities) {
      if (!currentEntities.has(entity)) {
        this.renderer.remove(entity)
      }
    }

    this.renderedEntities.clear()
    for (const entity of currentEntities) {
      this.renderedEntities.add(entity)
    }
  }

  dispose(): void {
    if (this.disposed) return

    for (const entity of this.renderedEntities) {
      this.renderer.remove(entity)
    }
    this.renderedEntities.clear()
    this.disposed = true
  }
}
