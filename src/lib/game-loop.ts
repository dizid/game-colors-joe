export class GameLoop {
  private animationId = 0
  private lastTime = 0
  private running = false
  private updateFn: (dt: number) => void
  private renderFn: (dt: number) => void

  constructor(update: (dt: number) => void, render: (dt: number) => void) {
    this.updateFn = update
    this.renderFn = render
  }

  start(): void {
    if (this.running) return
    this.running = true
    this.lastTime = performance.now()
    this.animationId = requestAnimationFrame(this.tick)
  }

  stop(): void {
    this.running = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = 0
    }
  }

  get isRunning(): boolean {
    return this.running
  }

  private tick = (timestamp: number): void => {
    if (!this.running) return

    // Cap delta time at 50ms to prevent physics explosions
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05)
    this.lastTime = timestamp

    this.updateFn(dt)
    this.renderFn(dt)

    this.animationId = requestAnimationFrame(this.tick)
  }
}
