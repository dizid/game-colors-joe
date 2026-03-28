import type { Vector2, GestureEvent } from '../types/game'

type GestureCallback = (event: GestureEvent) => void

interface PointerSample {
  x: number
  y: number
  time: number
}

export class InputHandler {
  private element: HTMLElement
  private onGesture: GestureCallback
  private isDown = false
  private samples: PointerSample[] = []
  private startTime = 0
  private path: Vector2[] = []
  private canvasRect: DOMRect | null = null

  constructor(element: HTMLElement, onGesture: GestureCallback) {
    this.element = element
    this.onGesture = onGesture
    this.bind()
  }

  private bind(): void {
    // Use pointer events for unified touch + mouse
    this.element.addEventListener('pointerdown', this.onPointerDown)
    this.element.addEventListener('pointermove', this.onPointerMove)
    this.element.addEventListener('pointerup', this.onPointerUp)
    this.element.addEventListener('pointerleave', this.onPointerUp)
    this.element.addEventListener('pointercancel', this.onPointerUp)

    // Prevent scrolling on the canvas
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
    this.isDown = true
    this.startTime = performance.now()
    const pos = this.getLocalCoords(e)
    this.samples = [{ x: pos.x, y: pos.y, time: this.startTime }]
    this.path = [pos]
    this.element.setPointerCapture(e.pointerId)
  }

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.isDown) return
    e.preventDefault()
    const pos = this.getLocalCoords(e)
    this.samples.push({ x: pos.x, y: pos.y, time: performance.now() })
    this.path.push(pos)

    // Keep only last 5 samples for velocity calculation
    if (this.samples.length > 5) this.samples.shift()
  }

  private onPointerUp = (e: PointerEvent): void => {
    if (!this.isDown) return
    this.isDown = false

    const duration = performance.now() - this.startTime
    const endPos = this.getLocalCoords(e)
    const velocity = this.calculateVelocity()
    const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2)

    // Classify the gesture
    let type: GestureEvent['type']
    if (duration < 200 && speed < 100) {
      type = 'tap'
    } else if (duration > 500 && this.path.length > 10) {
      type = 'drag'
    } else {
      type = 'fling'
    }

    // Calculate pressure from speed (0-1 normalized)
    const pressure = Math.min(1, speed / 800)

    this.onGesture({
      type,
      position: endPos,
      velocity,
      path: [...this.path],
      pressure,
      duration,
    })
  }

  private calculateVelocity(): Vector2 {
    if (this.samples.length < 2) return { x: 0, y: 0 }

    const last = this.samples[this.samples.length - 1]
    const prev = this.samples[Math.max(0, this.samples.length - 3)]
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
