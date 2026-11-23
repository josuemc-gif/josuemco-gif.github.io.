export type PieceColor = 'white' | 'black' | 'random'

export interface BotProfile {
  name: string
  elo: number
  personality: string
}

export interface EngineConfig {
  uciCommands: string[]
  goCommand: string
  randomBlunderChance: number
}

export interface EngineEvaluation {
  type: 'cp' | 'mate'
  value: number
}

export interface MoveRecord {
  san: string
  from: string
  to: string
  color: 'w' | 'b'
}
