import { createWorld, type World } from 'bitecs'

export interface PositionComponent {
  x: number[]
  y: number[]
}

export interface SquareComponent {
  size: number[]
}

export interface GameWorldContext {
  components: {
    Position: PositionComponent
    Square: SquareComponent
  }
}

export type GameWorld = World<GameWorldContext>

export function createGameWorld(): GameWorld {
  return createWorld<GameWorldContext>({
    components: {
      Position: {
        x: [],
        y: [],
      },
      Square: {
        size: [],
      },
    },
  })
}
