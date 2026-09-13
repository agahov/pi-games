// @vitest-environment node

import { query, removeEntity, type EntityId } from 'bitecs'
import { describe, expect, it } from 'vitest'
import { GAME_CONFIG, Game } from '../../src/game'
import type { RenderSquare, RendererPort } from '../../src/render'
import { RenderSystem } from '../../src/render'

class FakeRenderer implements RendererPort {
  readonly created: Array<{ entity: EntityId; square: RenderSquare }> = []
  readonly updated: Array<{ entity: EntityId; square: RenderSquare }> = []
  readonly removed: EntityId[] = []

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

describe('Game', () => {
  it('initializes one configured square at the world origin', () => {
    const game = new Game()
    const { Position, Square } = game.world.components
    const entities = query(game.world, [Position, Square])

    expect(entities).toHaveLength(1)
    const entity = entities[0]
    expect(Position.x[entity]).toBe(0)
    expect(Position.y[entity]).toBe(0)
    expect(Square.size[entity]).toBe(GAME_CONFIG.square.size)

    game.dispose()
    game.dispose()
    expect(game.isDisposed).toBe(true)
  })

  it('creates, updates, and removes presentation entities without duplicates', () => {
    const game = new Game()
    const renderer = new FakeRenderer()
    const renderSystem = new RenderSystem(game.world, renderer)
    const entity = game.squareEntity

    renderSystem.synchronize()
    renderSystem.synchronize()

    expect(renderer.created).toEqual([
      { entity, square: { x: 0, y: 0, size: GAME_CONFIG.square.size } },
    ])
    expect(renderer.updated).toHaveLength(1)

    game.world.components.Position.x[entity] = 12
    game.world.components.Position.y[entity] = -8
    game.world.components.Square.size[entity] = 48
    renderSystem.synchronize()

    expect(renderer.updated.at(-1)).toEqual({
      entity,
      square: { x: 12, y: -8, size: 48 },
    })

    removeEntity(game.world, entity)
    renderSystem.synchronize()
    renderSystem.synchronize()

    expect(renderer.removed).toEqual([entity])

    renderSystem.dispose()
    game.dispose()
  })
})
