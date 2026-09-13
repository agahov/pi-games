import { addComponent, addEntity, deleteWorld, type EntityId } from 'bitecs'
import { GAME_CONFIG, type GameConfig } from './config'
import { createGameWorld, type GameWorld } from './ecs'

export class Game {
  readonly config: GameConfig
  readonly world: GameWorld
  readonly squareEntity: EntityId

  private disposed = false

  constructor(config: Readonly<GameConfig> = GAME_CONFIG) {
    this.config = {
      logicalWidth: config.logicalWidth,
      logicalHeight: config.logicalHeight,
      square: {
        size: config.square.size,
      },
    }
    this.world = createGameWorld()

    const { Position, Square } = this.world.components
    this.squareEntity = addEntity(this.world)
    addComponent(this.world, this.squareEntity, Position)
    addComponent(this.world, this.squareEntity, Square)
    Position.x[this.squareEntity] = 0
    Position.y[this.squareEntity] = 0
    Square.size[this.squareEntity] = this.config.square.size
  }

  get isDisposed(): boolean {
    return this.disposed
  }

  dispose(): void {
    if (this.disposed) return

    deleteWorld(this.world)
    this.disposed = true
  }
}
