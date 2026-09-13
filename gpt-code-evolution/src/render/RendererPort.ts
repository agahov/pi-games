import type { EntityId } from 'bitecs'

export interface RenderSquare {
  readonly x: number
  readonly y: number
  readonly size: number
}

export interface RendererPort {
  create(entity: EntityId, square: RenderSquare): void
  update(entity: EntityId, square: RenderSquare): void
  remove(entity: EntityId): void
}
