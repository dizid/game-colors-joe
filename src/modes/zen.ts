import { BaseMode } from './base-mode'
import type { GameModeConfig, SplatResult, ModeUpdate } from '../types/modes'
import type { SplatConfig, GameState } from '../types/game'

export class ZenMode extends BaseMode {
  readonly config: GameModeConfig = {
    id: 'zen',
    name: 'Zen Mode',
    description: 'No timer. No score. Just paint. Pure creative freedom.',
    icon: '🧘',
    hasTimer: false,
    hasScore: false,
    duration: null,
  }

  onSplat(_splat: SplatConfig, _state: GameState): SplatResult {
    return {
      score: 0,
      comboMultiplier: 1,
      feedback: 'nice',
    }
  }

  update(_deltaTime: number, _state: GameState): ModeUpdate {
    return {}
  }

  isComplete(_state: GameState): boolean {
    return false // Zen never ends
  }

  getEndTitle(_state: GameState): string {
    return 'Beautiful!'
  }

  getEndSubtitle(state: GameState): string {
    return `${state.splatCount} splats of pure joy`
  }
}
