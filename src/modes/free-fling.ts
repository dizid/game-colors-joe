import { BaseMode } from './base-mode'
import type { GameModeConfig, SplatResult, ModeUpdate } from '../types/modes'
import type { SplatConfig, GameState } from '../types/game'
import { scoreSplat } from '../lib/splatter-engine'
import { getComboName } from '../lib/color-palette'

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
    if (state.score >= 5000) return 'JOE APPROVED!'
    if (state.score >= 3000) return 'FULL CHAOS!'
    if (state.score >= 1500) return 'Getting Messy!'
    if (state.score >= 500) return 'Nice Start!'
    return 'Shy Painter...'
  }

  getEndSubtitle(state: GameState): string {
    return `${state.splatCount} splats | Max combo: x${state.maxCombo}`
  }
}
