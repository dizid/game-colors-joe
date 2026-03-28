import type { Vector2, SplatConfig, Splat, SplatBlob, SplatTendril } from '../types/game'
import { varyColor } from './color-palette'

let splatCounter = 0

// Generate a unique, organic-looking splat from a gesture
export function generateSplat(config: SplatConfig): Splat {
  const { position, velocity, color, size, pressure } = config
  const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2)
  const angle = Math.atan2(velocity.y, velocity.x)

  const blobs = generateBlobs(position, color, size, pressure, speed, angle)
  const tendrils = generateTendrils(position, color, size, speed, angle)
  const dots = generateDots(position, color, size, speed, angle)

  return {
    id: `splat-${++splatCounter}`,
    blobs,
    tendrils,
    dots,
    timestamp: Date.now(),
  }
}

function generateBlobs(
  center: Vector2,
  color: string,
  size: number,
  pressure: number,
  speed: number,
  angle: number
): SplatBlob[] {
  const blobs: SplatBlob[] = []

  // Main central blob - larger when pressure is high
  const mainRadius = size * (0.8 + pressure * 0.5) * (1 + speed * 0.001)
  blobs.push({
    center: {
      x: center.x + (Math.random() - 0.5) * 4,
      y: center.y + (Math.random() - 0.5) * 4,
    },
    radius: mainRadius,
    color: varyColor(color, 15),
    opacity: 0.85 + Math.random() * 0.15,
    rotation: Math.random() * Math.PI * 2,
    elongation: 1 + speed * 0.002, // faster flings = more elongated
  })

  // 2-4 secondary blobs around the center
  const secondaryCount = 2 + Math.floor(Math.random() * 3)
  for (let i = 0; i < secondaryCount; i++) {
    const dist = mainRadius * (0.6 + Math.random() * 0.8)
    const blobAngle = angle + (Math.random() - 0.5) * Math.PI * 1.2
    blobs.push({
      center: {
        x: center.x + Math.cos(blobAngle) * dist,
        y: center.y + Math.sin(blobAngle) * dist,
      },
      radius: mainRadius * (0.3 + Math.random() * 0.4),
      color: varyColor(color, 20),
      opacity: 0.7 + Math.random() * 0.2,
      rotation: Math.random() * Math.PI * 2,
      elongation: 1 + Math.random() * 0.3,
    })
  }

  return blobs
}

function generateTendrils(
  center: Vector2,
  color: string,
  size: number,
  speed: number,
  angle: number
): SplatTendril[] {
  const tendrils: SplatTendril[] = []

  // More tendrils for faster flings
  const count = Math.min(8, 3 + Math.floor(speed * 0.01))

  for (let i = 0; i < count; i++) {
    // Tendrils biased toward velocity direction
    const tendrilAngle = angle + (Math.random() - 0.5) * Math.PI * 1.5
    const length = size * (1.5 + speed * 0.005 + Math.random() * 2)
    const width = size * (0.15 + Math.random() * 0.2)

    const endX = center.x + Math.cos(tendrilAngle) * length
    const endY = center.y + Math.sin(tendrilAngle) * length

    // Create organic-looking bezier curves
    const ctrl1Dist = length * (0.3 + Math.random() * 0.3)
    const ctrl2Dist = length * (0.5 + Math.random() * 0.3)
    const wobble = size * (0.5 + Math.random())

    tendrils.push({
      start: {
        x: center.x + (Math.random() - 0.5) * size * 0.3,
        y: center.y + (Math.random() - 0.5) * size * 0.3,
      },
      control1: {
        x: center.x + Math.cos(tendrilAngle) * ctrl1Dist + (Math.random() - 0.5) * wobble,
        y: center.y + Math.sin(tendrilAngle) * ctrl1Dist + (Math.random() - 0.5) * wobble,
      },
      control2: {
        x: center.x + Math.cos(tendrilAngle) * ctrl2Dist + (Math.random() - 0.5) * wobble,
        y: center.y + Math.sin(tendrilAngle) * ctrl2Dist + (Math.random() - 0.5) * wobble,
      },
      end: { x: endX, y: endY },
      width,
      color: varyColor(color, 25),
      opacity: 0.6 + Math.random() * 0.3,
    })
  }

  return tendrils
}

function generateDots(
  center: Vector2,
  color: string,
  size: number,
  speed: number,
  angle: number
): SplatBlob[] {
  const dots: SplatBlob[] = []

  // Satellite dots - more for faster flings
  const count = 8 + Math.floor(speed * 0.015 + Math.random() * 10)

  for (let i = 0; i < count; i++) {
    const dist = size * (1.5 + Math.random() * 4 + speed * 0.008)
    // Bias dots toward the fling direction
    const dotAngle = angle + (Math.random() - 0.5) * Math.PI * 1.8
    const dotSize = 1 + Math.random() * (size * 0.2)

    dots.push({
      center: {
        x: center.x + Math.cos(dotAngle) * dist,
        y: center.y + Math.sin(dotAngle) * dist,
      },
      radius: dotSize,
      color: varyColor(color, 30),
      opacity: 0.5 + Math.random() * 0.4,
      rotation: 0,
      elongation: 1,
    })
  }

  return dots
}

// Calculate score for a splat based on canvas position
export function scoreSplat(
  position: Vector2,
  velocity: Vector2,
  canvasWidth: number,
  canvasHeight: number,
  combo: number
): { points: number; multiplier: number; bonuses: string[] } {
  let points = 50 // base
  const bonuses: string[] = []
  const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2)

  // Fast fling bonus
  if (speed > 400) {
    points += 25
    bonuses.push('Fast Fling!')
  }

  // Edge hit (within 15% of edge)
  const edgeThreshold = 0.15
  const nearEdge =
    position.x < canvasWidth * edgeThreshold ||
    position.x > canvasWidth * (1 - edgeThreshold) ||
    position.y < canvasHeight * edgeThreshold ||
    position.y > canvasHeight * (1 - edgeThreshold)
  if (nearEdge) {
    points += 75
    bonuses.push('Edge Shot!')
  }

  // Corner hit (within 10% of corner)
  const cornerThreshold = 0.1
  const nearCorner =
    (position.x < canvasWidth * cornerThreshold || position.x > canvasWidth * (1 - cornerThreshold)) &&
    (position.y < canvasHeight * cornerThreshold || position.y > canvasHeight * (1 - cornerThreshold))
  if (nearCorner) {
    points += 200
    bonuses.push('CORNER SHOT!')
  }

  // Combo multiplier
  let multiplier = 1
  if (combo >= 10) multiplier = 5
  else if (combo >= 8) multiplier = 4
  else if (combo >= 5) multiplier = 3
  else if (combo >= 3) multiplier = 2
  else if (combo >= 2) multiplier = 1.5

  return {
    points: Math.floor(points * multiplier),
    multiplier,
    bonuses,
  }
}
