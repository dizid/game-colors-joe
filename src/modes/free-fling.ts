import { BaseMode } from './base-mode'
import type { GameModeConfig, SplatResult, ModeUpdate } from '../types/modes'
import type { SplatConfig, GameState } from '../types/game'
import { scoreSplat } from '../lib/splatter-engine'
import { getComboName } from '../lib/color-palette'
import { getFunnyEndTitle, getFunnyEndSubtitle } from '../lib/humor'

export class FreeFlingMode extends BaseMode {
  readonly config: GameModeConfig = {
    id: 'free-fling',
    name: 'Free Fling',
    description: '60 seconds of pure paint chaos! Get the highest score!',
    icon: '🎨',
    hasTimer: true,
    hasScore: true,
    duration: 60,
  }

  onSplat(splat: SplatConfig, state: GameState): SplatResult {
    const { points, multiplier, bonuses } = scoreSplat(
      splat.position, splat.velocity, this.width, this.height, state.combo
    )

    const comboName = getComboName(state.combo + 1)

    return {
      score: points,
      comboMultiplier: multiplier,
      feedback: points >= 200 ? 'perfect' : points >= 100 ? 'good' : 'nice',
      feedbackText: comboName || (bonuses.length > 0 ? bonuses[0] : undefined),
    }
  }

  update(deltaTime: number, state: GameState): ModeUpdate {
    if (state.timeRemaining === null) return {}

    const newTime = Math.max(0, state.timeRemaining - deltaTime)
    return {
      timeRemaining: newTime,
      completed: newTime <= 0,
    }
  }

  isComplete(state: GameState): boolean {
    return state.timeRemaining !== null && state.timeRemaining <= 0
  }

  getEndTitle(state: GameState): string {
    return getFunnyEndTitle(state.score, state.splatCount, state.maxCombo, 0)
  }

  getEndSubtitle(state: GameState): string {
    return getFunnyEndSubtitle(state.score, state.splatCount, state.maxCombo, 0)
  }
}
