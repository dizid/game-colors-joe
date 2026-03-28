import type { Splat, SplatBlob, SplatTendril, Particle } from '../types/game'

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
