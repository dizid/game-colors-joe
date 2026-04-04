import type { Splat, SplatBlob, SplatTendril, Particle, Footprint } from '../types/game'

// Draw a complete splat to a canvas context
export function drawSplat(ctx: CanvasRenderingContext2D, splat: Splat): void {
  // Draw tendrils first (behind blobs)
  for (const tendril of splat.tendrils) {
    drawTendril(ctx, tendril)
  }

  // Draw main blobs
  for (const blob of splat.blobs) {
    drawBlob(ctx, blob)
  }

  // Draw satellite dots
  for (const dot of splat.dots) {
    drawBlob(ctx, dot)
  }

  // Draw footprints if present
  if (splat.footprints) {
    for (const fp of splat.footprints) {
      drawFootprint(ctx, fp)
    }
  }
}

function drawBlob(ctx: CanvasRenderingContext2D, blob: SplatBlob): void {
  ctx.save()
  ctx.translate(blob.center.x, blob.center.y)
  ctx.rotate(blob.rotation)
  ctx.globalAlpha = blob.opacity

  // Create radial gradient for organic look
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, blob.radius)
  gradient.addColorStop(0, blob.color)
  gradient.addColorStop(0.7, blob.color)
  gradient.addColorStop(1, blob.color.replace(/[\d.]+\)$/, '0)').replace('rgb(', 'rgba('))

  ctx.fillStyle = gradient
  ctx.beginPath()

  // Draw irregular blob shape using bezier curves
  const points = 8 + Math.floor(Math.random() * 4)
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2
    const wobble = 0.8 + Math.random() * 0.4
    const rx = blob.radius * blob.elongation * wobble
    const ry = blob.radius * wobble
    const x = Math.cos(angle) * rx
    const y = Math.sin(angle) * ry

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      // Use quadratic curves for smoothness
      const prevAngle = ((i - 0.5) / points) * Math.PI * 2
      const cpWobble = 0.85 + Math.random() * 0.3
      const cpx = Math.cos(prevAngle) * blob.radius * blob.elongation * cpWobble
      const cpy = Math.sin(prevAngle) * blob.radius * cpWobble
      ctx.quadraticCurveTo(cpx, cpy, x, y)
    }
  }

  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.restore()
}

function drawTendril(ctx: CanvasRenderingContext2D, tendril: SplatTendril): void {
  ctx.save()
  ctx.globalAlpha = tendril.opacity
  ctx.strokeStyle = tendril.color
  ctx.lineCap = 'round'

  // Draw the tendril with tapering width
  const steps = 20
  for (let i = 0; i < steps; i++) {
    const t1 = i / steps
    const t2 = (i + 1) / steps

    const p1 = bezierPoint(tendril.start, tendril.control1, tendril.control2, tendril.end, t1)
    const p2 = bezierPoint(tendril.start, tendril.control1, tendril.control2, tendril.end, t2)

    // Width tapers from thick to thin
    const width = tendril.width * (1 - t1 * 0.8)

    ctx.beginPath()
    ctx.lineWidth = Math.max(0.5, width)
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()
  }

  ctx.globalAlpha = 1
  ctx.restore()
}

function bezierPoint(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number
): { x: number; y: number } {
  const mt = 1 - t
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
  }
}

function drawFootprint(ctx: CanvasRenderingContext2D, fp: Footprint): void {
  ctx.save()
  ctx.translate(fp.position.x, fp.position.y)
  ctx.rotate(fp.rotation)
  if (!fp.isLeft) ctx.scale(-1, 1)
  ctx.globalAlpha = fp.opacity

  const s = fp.size

  // Build the sole path as a reusable function
  function solePath(): void {
    ctx.beginPath()
    ctx.moveTo(-s * 0.3, s * 1.0) // heel left
    ctx.bezierCurveTo(
      -s * 0.35, s * 0.4,
      -s * 0.5, -s * 0.2,
      -s * 0.45, -s * 0.6
    )
    ctx.bezierCurveTo(
      -s * 0.4, -s * 0.8,
      s * 0.3, -s * 0.85,
      s * 0.35, -s * 0.55
    )
    ctx.bezierCurveTo(
      s * 0.4, -s * 0.2,
      s * 0.3, s * 0.3,
      s * 0.25, s * 1.0
    )
    ctx.bezierCurveTo(
      s * 0.1, s * 1.15,
      -s * 0.15, s * 1.15,
      -s * 0.3, s * 1.0
    )
    ctx.closePath()
  }

  // Parse color to get RGB components for darkening/lightening
  const rgb = parseColor(fp.color)
  const darkColor = `rgb(${Math.max(0, rgb.r - 60)}, ${Math.max(0, rgb.g - 60)}, ${Math.max(0, rgb.b - 60)})`
  const lightColor = `rgb(${Math.min(255, rgb.r + 70)}, ${Math.min(255, rgb.g + 70)}, ${Math.min(255, rgb.b + 70)})`

  // 1) Outer dark edge (paint squeezed out from under foot) — thick stroke
  solePath()
  ctx.fillStyle = darkColor
  ctx.fill()
  ctx.lineWidth = s * 0.18
  ctx.lineJoin = 'round'
  ctx.strokeStyle = darkColor
  ctx.stroke()

  // 2) Lighter interior fill (like the reference image)
  ctx.save()
  solePath()
  // Shrink slightly inward by using a clip and smaller fill
  ctx.clip()
  ctx.fillStyle = lightColor
  ctx.globalAlpha = fp.opacity * 0.85
  ctx.beginPath()
  ctx.moveTo(-s * 0.2, s * 0.85)
  ctx.bezierCurveTo(
    -s * 0.25, s * 0.3,
    -s * 0.38, -s * 0.1,
    -s * 0.32, -s * 0.45
  )
  ctx.bezierCurveTo(
    -s * 0.28, -s * 0.65,
    s * 0.2, -s * 0.7,
    s * 0.24, -s * 0.4
  )
  ctx.bezierCurveTo(
    s * 0.28, -s * 0.1,
    s * 0.2, s * 0.2,
    s * 0.16, s * 0.85
  )
  ctx.bezierCurveTo(
    s * 0.05, s * 0.95,
    -s * 0.08, s * 0.95,
    -s * 0.2, s * 0.85
  )
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // 3) Draw 5 toes — dark outer, light inner
  const toes = [
    { x: -s * 0.32, y: -s * 0.85, r: s * 0.14 },
    { x: -s * 0.12, y: -s * 0.98, r: s * 0.11 },
    { x: s * 0.06, y: -s * 0.98, r: s * 0.10 },
    { x: s * 0.2, y: -s * 0.93, r: s * 0.09 },
    { x: s * 0.32, y: -s * 0.82, r: s * 0.08 },
  ]
  for (const toe of toes) {
    // Dark outer
    ctx.fillStyle = darkColor
    ctx.beginPath()
    ctx.arc(toe.x, toe.y, toe.r, 0, Math.PI * 2)
    ctx.fill()
    // Light inner
    ctx.fillStyle = lightColor
    ctx.globalAlpha = fp.opacity * 0.8
    ctx.beginPath()
    ctx.arc(toe.x, toe.y, toe.r * 0.6, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = fp.opacity
  }

  ctx.globalAlpha = 1
  ctx.restore()
}

// Parse rgb() or hex color string to {r, g, b}
function parseColor(color: string): { r: number; g: number; b: number } {
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (rgbMatch) {
    return { r: +rgbMatch[1], g: +rgbMatch[2], b: +rgbMatch[3] }
  }
  // hex fallback
  const hex = color.replace('#', '')
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  }
}

// Draw a single particle (used during animation)
export function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle): void {
  if (!particle.active || particle.life <= 0) return

  const alpha = Math.max(0, particle.life / particle.maxLife)
  ctx.globalAlpha = alpha * 0.8
  ctx.fillStyle = particle.color
  ctx.beginPath()
  ctx.arc(particle.x, particle.y, particle.radius * (0.5 + alpha * 0.5), 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}

// Calculate canvas coverage as percentage (0-100)
export function calculateCoverage(ctx: CanvasRenderingContext2D, width: number, height: number): number {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  let paintedPixels = 0
  const totalPixels = width * height

  // Sample every 4th pixel for performance
  for (let i = 3; i < data.length; i += 16) {
    if (data[i] > 20) paintedPixels++
  }

  return (paintedPixels / (totalPixels / 4)) * 100
}

// Clear a canvas
export function clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.clearRect(0, 0, width, height)
}

// Fill canvas with white (for persistent layer)
export function fillWhite(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = '#FAFAF7'
  ctx.fillRect(0, 0, width, height)
}
