import type { SplatConfig, GameState } from './game'

export interface SplatResult {
  score: number
  comboMultiplier: number
  feedback: 'perfect' | 'good' | 'miss' | 'nice'
  feedbackText?: string
}

export interface ModeUpdate {
  timeRemaining?: number
  completed?: boolean
}

export interface GameModeConfig {
  id: string
  name: string
  description: string
  icon: string
  hasTimer: boolean
  hasScore: boolean
  duration: number | null
}

export interface GameMode {
  readonly config: GameModeConfig

  initialize(canvasWidth: number, canvasHeight: number): void
  onSplat(splat: SplatConfig, state: GameState): SplatResult
  update(deltaTime: number, state: GameState): ModeUpdate
  isComplete(state: GameState): boolean
  getEndTitle(state: GameState): string
  getEndSubtitle(state: GameState): string
  cleanup(): void
}
