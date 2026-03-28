import type { SavedArtwork, HighScore } from '../types/game'

const STORAGE_KEY = 'joes-splat-factory'

interface SaveData {
  version: number
  highScores: HighScore[]
  gallery: SavedArtwork[]
  soundEnabled: boolean
}

function getDefaultSaveData(): SaveData {
  return {
    version: 1,
    highScores: [],
    gallery: [],
    soundEnabled: true,
  }
}

function load(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultSaveData()
    return JSON.parse(raw) as SaveData
  } catch {
    return getDefaultSaveData()
  }
}

function save(data: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage full or unavailable - silently fail
  }
}

export function getHighScores(): HighScore[] {
  return load().highScores
}

export function getBestScore(mode: string): number {
  const scores = load().highScores.filter(s => s.mode === mode)
  return scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0
}

export function saveHighScore(mode: string, score: number): void {
  const data = load()
  data.highScores.push({ mode, score, date: Date.now() })
  // Keep top 20 per mode
  data.highScores.sort((a, b) => b.score - a.score)
  const byMode = new Map<string, HighScore[]>()
  for (const s of data.highScores) {
    const list = byMode.get(s.mode) ?? []
    if (list.length < 20) list.push(s)
    byMode.set(s.mode, list)
  }
  data.highScores = Array.from(byMode.values()).flat()
  save(data)
}

export function saveArtwork(artwork: SavedArtwork): void {
  const data = load()
  data.gallery.unshift(artwork)
  // Keep last 50 artworks
  if (data.gallery.length > 50) data.gallery = data.gallery.slice(0, 50)
  save(data)
}

export function getGallery(): SavedArtwork[] {
  return load().gallery
}

export function getSoundEnabled(): boolean {
  return load().soundEnabled
}

export function setSoundEnabled(enabled: boolean): void {
  const data = load()
  data.soundEnabled = enabled
  save(data)
}
