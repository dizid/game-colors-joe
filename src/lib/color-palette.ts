import type { PaintColor, PaintColorId } from '../types/game'

export const PAINT_COLORS: PaintColor[] = [
  { id: 'blue', name: 'Bangkok Blue', hex: '#1E90FF' },
  { id: 'red', name: 'Tuk-Tuk Red', hex: '#DC143C' },
  { id: 'green', name: 'Monsoon Teal', hex: '#20B2AA' },
  { id: 'yellow', name: 'Temple Yellow', hex: '#FFD700' },
  { id: 'teal', name: 'Street Mango', hex: '#FF8C00' },
  { id: 'pink', name: 'Lotus Pink', hex: '#FF69B4' },
  { id: 'orange', name: 'Pad Thai Orange', hex: '#FF4500' },
]

export function getColor(id: PaintColorId): PaintColor {
  return PAINT_COLORS.find(c => c.id === id) ?? PAINT_COLORS[0]
}

export function getRandomColor(): PaintColor {
  return PAINT_COLORS[Math.floor(Math.random() * PAINT_COLORS.length)]
}

// Slightly vary a hex color for organic feel
export function varyColor(hex: string, amount: number = 20): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const vary = () => Math.max(0, Math.min(255, Math.floor(Math.random() * amount * 2 - amount)))
  return `rgb(${r + vary()}, ${g + vary()}, ${b + vary()})`
}

// Get a translucent version
export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Combo level names
export const COMBO_NAMES: Record<number, string> = {
  1: '',
  2: 'Nice!',
  3: 'MESSY!',
  5: 'CHAOTIC!',
  8: 'FULL RAMPAGE!',
  10: 'JOE MODE!!!',
}

export function getComboName(combo: number): string {
  const thresholds = Object.keys(COMBO_NAMES).map(Number).sort((a, b) => b - a)
  for (const t of thresholds) {
    if (combo >= t && COMBO_NAMES[t]) return COMBO_NAMES[t]
  }
  return ''
}

// Coverage level names
export function getCoverageTitle(percent: number): { title: string; bonus: number } {
  if (percent >= 80) return { title: 'JOE APPROVED', bonus: 5000 }
  if (percent >= 60) return { title: 'Street Art', bonus: 2000 }
  if (percent >= 40) return { title: 'Full Chaos', bonus: 1000 }
  if (percent >= 20) return { title: 'Getting Messy', bonus: 500 }
  return { title: 'Shy Painter', bonus: 0 }
}
