export interface Vector2 {
  x: number
  y: number
}

export interface SplatConfig {
  position: Vector2
  velocity: Vector2
  color: string
  size: number
  pressure: number
}

export interface SplatBlob {
  center: Vector2
  radius: number
  color: string
  opacity: number
  rotation: number
  elongation: number
}

export interface SplatTendril {
  start: Vector2
  control1: Vector2
  control2: Vector2
  end: Vector2
  width: number
  color: string
  opacity: number
}

export interface Splat {
  id: string
  blobs: SplatBlob[]
  tendrils: SplatTendril[]
  dots: SplatBlob[]
  timestamp: number
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  life: number
  maxLife: number
  gravity: number
  active: boolean
}

export type PaintColorId = 'blue' | 'red' | 'green' | 'yellow' | 'teal' | 'pink' | 'orange'

export interface PaintColor {
  id: PaintColorId
  name: string
  hex: string
}

export interface GestureEvent {
  type: 'tap' | 'fling' | 'drag' | 'spread'
  position: Vector2
  velocity: Vector2
  path: Vector2[]
  pressure: number
  duration: number
  fingerSpread?: number // distance between two fingers for 'spread' type
}

export interface GameState {
  mode: string
  score: number
  combo: number
  maxCombo: number
  timeRemaining: number | null
  selectedColorId: PaintColorId
  isPaused: boolean
  isComplete: boolean
  splatCount: number
  missCount: number
}

export interface SavedArtwork {
  id: string
  dataUrl: string
  timestamp: number
  mode: string
  score: number
}

export interface HighScore {
  score: number
  mode: string
  date: number
}
