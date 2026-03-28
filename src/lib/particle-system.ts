import type { Particle, SplatConfig, Splat } from '../types/game'
import { drawParticle } from './canvas-renderer'
import { generateSplat } from './splatter-engine'
import { varyColor } from './color-palette'

const POOL_SIZE = 200

export class ParticleSystem {
  private particles: Particle[] = []
  private pendingSplats: { splat: Splat; delay: number }[] = []

  constructor() {
    // Pre-allocate particle pool
    for (let i = 0; i < POOL_SIZE; i++) {
      this.particles.push({
        x: 0, y: 0, vx: 0, vy: 0,
        radius: 0, color: '', life: 0, maxLife: 0,
        gravity: 0, active: false,
      })
    }
  }

  // Spawn particles for a fling animation, returns the generated splat for later rendering
  emit(config: SplatConfig): Splat {
    const { position, velocity, color, size } = config
    const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2)
    const angle = Math.atan2(velocity.y, velocity.x)

    // Spawn 15-30 particles
    const count = Math.min(30, 15 + Math.floor(speed * 0.02))

    for (let i = 0; i < count; i++) {
      const particle = this.getInactive()
      if (!particle) break

      const spread = Math.PI * 0.6 // spread angle
      const pAngle = angle + (Math.random() - 0.5) * spread
      const pSpeed = speed * (0.3 + Math.random() * 0.7) * 0.8

      particle.x = position.x + (Math.random() - 0.5) * size
      particle.y = position.y + (Math.random() - 0.5) * size
      particle.vx = Math.cos(pAngle) * pSpeed
      particle.vy = Math.sin(pAngle) * pSpeed
      particle.radius = 2 + Math.random() * (size * 0.15)
      particle.color = varyColor(color, 25)
      particle.life = 0.3 + Math.random() * 0.4
      particle.maxLife = particle.life
      particle.gravity = 400 + Math.random() * 200
      particle.active = true
    }

    // Generate the final splat shape (will be drawn when particles settle)
    const splat = generateSplat(config)

    // Queue the splat to be drawn after a short delay
    this.pendingSplats.push({ splat, delay: 0.15 + Math.random() * 0.1 })

    return splat
  }

  // Update all active particles
  update(dt: number): void {
    for (const p of this.particles) {
      if (!p.active) continue
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += p.gravity * dt
      p.life -= dt
      if (p.life <= 0) p.active = false
    }

    // Tick pending splat delays
    for (const pending of this.pendingSplats) {
      pending.delay -= dt
    }
  }

  // Draw active particles to the animation layer
  render(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      if (p.active) drawParticle(ctx, p)
    }
  }

  // Get splats ready to commit to the persistent layer
  getReadySplats(): Splat[] {
    const ready: Splat[] = []
    this.pendingSplats = this.pendingSplats.filter(pending => {
      if (pending.delay <= 0) {
        ready.push(pending.splat)
        return false
      }
      return true
    })
    return ready
  }

  hasActiveParticles(): boolean {
    return this.particles.some(p => p.active) || this.pendingSplats.length > 0
  }

  private getInactive(): Particle | null {
    return this.particles.find(p => !p.active) ?? null
  }

  reset(): void {
    for (const p of this.particles) p.active = false
    this.pendingSplats = []
  }
}
