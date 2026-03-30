import type { Vector2, GestureEvent } from '../types/game'

type GestureCallback = (event: GestureEvent) => void

interface PointerSample {
  x: number
  y: number
  time: number
}

interface PointerTrack {
  samples: PointerSample[]
  path: Vector2[]
  startTime: number
}

export class InputHandler {
  private element: HTMLElement
  private onGesture: GestureCallback
  private pointers = new Map<number, PointerTrack>()
  private canvasRect: DOMRect | null = null
  private wasMultiTouch = false

  constructor(element: HTMLElement, onGesture: GestureCallback) {
    this.element = element
    this.onGesture = onGesture
    this.bind()
  }

  private bind(): void {
    this.element.addEventListener('pointerdown', this.onPointerDown)
    this.element.addEventListener('pointermove', this.onPointerMove)
    this.element.addEventListener('pointerup', this.onPointerUp)
    this.element.addEventListener('pointerleave', this.onPointerUp)
    this.element.addEventListener('pointercancel', this.onPointerUp)
    this.element.style.touchAction = 'none'
  }

  private getLocalCoords(e: PointerEvent): Vector2 {
    this.canvasRect = this.element.getBoundingClientRect()
    return {
      x: e.clientX - this.canvasRect.left,
      y: e.clientY - this.canvasRect.top,
    }
  }

  private onPointerDown = (e: PointerEvent): void => {
    e.preventDefault()
    const pos = this.getLocalCoords(e)
    const now = performance.now()

    this.pointers.set(e.pointerId, {
      samples: [{ x: pos.x, y: pos.y, time: now }],
      path: [pos],
      startTime: now,
    })

    // Track if we ever had multiple fingers down
    if (this.pointers.size > 1) {
      this.wasMultiTouch = true
    }

    this.element.setPointerCapture(e.pointerId)
  }

  private onPointerMove = (e: PointerEvent): void => {
    const track = this.pointers.get(e.pointerId)
    if (!track) return
    e.preventDefault()

    const pos = this.getLocalCoords(e)
    track.samples.push({ x: pos.x, y: pos.y, time: performance.now() })
    track.path.push(pos)

    // Keep only last 5 samples for velocity calculation
    if (track.samples.length > 5) track.samples.shift()
  }

  private onPointerUp = (e: PointerEvent): void => {
    const track = this.pointers.get(e.pointerId)
    if (!track) return

    // If this is a multi-touch gesture and there's still another finger down, wait
    if (this.wasMultiTouch && this.pointers.size > 1) {
      this.pointers.delete(e.pointerId)
      return
    }

    // Calculate gesture from this pointer (or multi-touch combo)
    const endPos = this.getLocalCoords(e)
    const duration = performance.now() - track.startTime
    const velocity = this.calculateVelocity(track.samples)
    const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2)

    if (this.wasMultiTouch) {
      // Two-finger spread gesture — emit as 'spread' with the finger distance
      const allTracks = Array.from(this.pointers.values())
      allTracks.push(track) // include the one we're about to remove

      // Calculate midpoint and spread from the paths
      const positions = allTracks.map(t => {
        const last = t.samples[t.samples.length - 1]
        return { x: last.x, y: last.y }
      })

      const midpoint: Vector2 = {
        x: positions.reduce((s, p) => s + p.x, 0) / positions.length,
        y: positions.reduce((s, p) => s + p.y, 0) / positions.length,
      }

      // Distance between fingers
      let fingerSpread = 0
      if (positions.length >= 2) {
        const dx = positions[0].x - positions[1].x
        const dy = positions[0].y - positions[1].y
        fingerSpread = Math.sqrt(dx * dx + dy * dy)
      }

      // Average velocity from all tracks
      const avgVelocity: Vector2 = { x: 0, y: 0 }
      for (const t of allTracks) {
        const v = this.calculateVelocity(t.samples)
        avgVelocity.x += v.x
        avgVelocity.y += v.y
      }
      avgVelocity.x /= allTracks.length
      avgVelocity.y /= allTracks.length

      const avgSpeed = Math.sqrt(avgVelocity.x ** 2 + avgVelocity.y ** 2)

      this.onGesture({
        type: 'spread',
        position: midpoint,
        velocity: avgVelocity,
        path: track.path,
        pressure: Math.min(1, avgSpeed / 800),
        duration,
        fingerSpread,
      })
    } else {
      // Single-finger gesture
      let type: GestureEvent['type']
      if (duration < 200 && speed < 100) {
        type = 'tap'
      } else if (duration > 500 && track.path.length > 10) {
        type = 'drag'
      } else {
        type = 'fling'
      }

      const pressure = Math.min(1, speed / 800)

      this.onGesture({
        type,
        position: endPos,
        velocity,
        path: [...track.path],
        pressure,
        duration,
      })
    }

    // Clean up all pointers
    this.pointers.clear()
    this.wasMultiTouch = false
  }

  private calculateVelocity(samples: PointerSample[]): Vector2 {
    if (samples.length < 2) return { x: 0, y: 0 }

    const last = samples[samples.length - 1]
    const prev = samples[Math.max(0, samples.length - 3)]
    const dt = (last.time - prev.time) / 1000

    if (dt === 0) return { x: 0, y: 0 }

    return {
      x: (last.x - prev.x) / dt,
      y: (last.y - prev.y) / dt,
    }
  }

  destroy(): void {
    this.element.removeEventListener('pointerdown', this.onPointerDown)
    this.element.removeEventListener('pointermove', this.onPointerMove)
    this.element.removeEventListener('pointerup', this.onPointerUp)
    this.element.removeEventListener('pointerleave', this.onPointerUp)
    this.element.removeEventListener('pointercancel', this.onPointerUp)
  }
}
