export interface GameConfig {
  logicalWidth: number
  logicalHeight: number
  square: {
    size: number
  }
}

export const GAME_CONFIG: Readonly<GameConfig> = {
  logicalWidth: 800,
  logicalHeight: 600,
  square: {
    size: 64,
  },
}
