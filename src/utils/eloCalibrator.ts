import type { EngineConfig } from '../types/chess'

export function getEngineConfigForElo(targetElo: number): EngineConfig {
  const elo = Math.max(400, Math.min(3190, Math.round(targetElo)))

  if (elo < 1320) {
    const skillLevel = Math.max(0, Math.round(((elo - 400) / 920) * 5))
    const depth = elo < 800 ? 1 : elo < 1100 ? 2 : 3
    const blunderChance = Math.max(0.05, 0.45 - ((elo - 400) / 920) * 0.4)

    return {
      uciCommands: [
        'setoption name UCI_LimitStrength value false',
        `setoption name Skill Level value ${skillLevel}`,
      ],
      goCommand: `go depth ${depth}`,
      randomBlunderChance: blunderChance,
    }
  }

  return {
    uciCommands: [
      'setoption name UCI_LimitStrength value true',
      `setoption name UCI_Elo value ${elo}`,
    ],
    goCommand: 'go movetime 700',
    randomBlunderChance: 0,
  }
}
