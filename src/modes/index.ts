import type { GameMode } from '../types/modes'
import { FreeFlingMode } from './free-fling'
import { ZenMode } from './zen'

type ModeFactory = () => GameMode

const modeRegistry = new Map<string, ModeFactory>([
  ['free-fling', () => new FreeFlingMode()],
  ['zen', () => new ZenMode()],
])

export function createMode(id: string): GameMode {
  const factory = modeRegistry.get(id)
  if (!factory) throw new Error(`Unknown game mode: ${id}`)
  return factory()
}

export function getAvailableModes(): { id: string; name: string; description: string; icon: string }[] {
  return Array.from(modeRegistry.entries()).map(([id, factory]) => {
    const mode = factory()
    return {
      id,
      name: mode.config.name,
      description: mode.config.description,
      icon: mode.config.icon,
    }
  })
}
