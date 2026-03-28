import type { GameMode, GameModeConfig, SplatResult, ModeUpdate } from '../types/modes'
import type { SplatConfig, GameState } from '../types/game'

export abstract class BaseMode implements GameMode {
  abstract readonly config: GameModeConfig

  protected width = 0
  protected height = 0

  initialize(canvasWidth: number, canvasHeight: number): void {
    this.width = canvasWidth
    this.height = canvasHeight
  }

  abstract onSplat(splat: SplatConfig, state: GameState): SplatResult
  abstract update(deltaTime: number, state: GameState): ModeUpdate
  abstract isComplete(state: GameState): boolean
  abstract getEndTitle(state: GameState): string
  abstract getEndSubtitle(state: GameState): string

  cleanup(): void {}
}
