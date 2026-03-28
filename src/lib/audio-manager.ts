// Procedural audio using Web Audio API - no sound files needed!
export class AudioManager {
  private ctx: AudioContext | null = null
  private enabled = true
  private initialized = false

  // Initialize on first user gesture (browser policy)
  async init(): Promise<void> {
    if (this.initialized) return
    try {
      this.ctx = new AudioContext()
      this.initialized = true
    } catch {
      this.enabled = false
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  get isEnabled(): boolean {
    return this.enabled
  }

  // Wet splat sound
  playSplat(intensity: number = 0.5): void {
    if (!this.enabled || !this.ctx) return

    const now = this.ctx.currentTime
    const duration = 0.15 + intensity * 0.1

    // Noise burst for the "wet" sound
    const bufferSize = Math.floor(this.ctx.sampleRate * duration)
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      // Filtered noise that decays
      const t = i / bufferSize
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 8) * 0.3
    }

    const source = this.ctx.createBufferSource()
    source.buffer = buffer

    // Low-pass filter for a "thicker" sound
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 800 + intensity * 600
    filter.Q.value = 1

    const gain = this.ctx.createGain()
    gain.gain.value = 0.2 + intensity * 0.15

    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.ctx.destination)

    // Slight pitch variation for variety
    source.playbackRate.value = 0.8 + Math.random() * 0.4

    source.start(now)
    source.stop(now + duration)
  }

  // Whoosh for fast flings
  playWhoosh(speed: number = 0.5): void {
    if (!this.enabled || !this.ctx) return

    const now = this.ctx.currentTime
    const duration = 0.2

    const osc = this.ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(200 + speed * 300, now)
    osc.frequency.exponentialRampToValueAtTime(100, now + duration)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + duration)
  }

  // Combo milestone chime
  playCombo(level: number): void {
    if (!this.enabled || !this.ctx) return

    const now = this.ctx.currentTime
    const notes = [440, 554, 659, 880, 1047] // A4, C#5, E5, A5, C6
    const noteIndex = Math.min(level - 1, notes.length - 1)

    for (let i = 0; i <= noteIndex; i++) {
      const osc = this.ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = notes[i]

      const gain = this.ctx.createGain()
      const startAt = now + i * 0.08
      gain.gain.setValueAtTime(0, startAt)
      gain.gain.linearRampToValueAtTime(0.1, startAt + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.3)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(startAt)
      osc.stop(startAt + 0.3)
    }
  }

  // Game over fanfare
  playGameOver(): void {
    if (!this.enabled || !this.ctx) return

    const now = this.ctx.currentTime
    const notes = [523, 659, 784, 1047] // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq

      const gain = this.ctx!.createGain()
      const startAt = now + i * 0.15
      gain.gain.setValueAtTime(0, startAt)
      gain.gain.linearRampToValueAtTime(0.12, startAt + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.5)

      osc.connect(gain)
      gain.connect(this.ctx!.destination)

      osc.start(startAt)
      osc.stop(startAt + 0.5)
    })
  }

  // Miss sound (sad trombone lite)
  playMiss(): void {
    if (!this.enabled || !this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(300, now)
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.3)

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.06, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.3)
  }

  // Button click
  playClick(): void {
    if (!this.enabled || !this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 800

    const gain = this.ctx.createGain()
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

    osc.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc.stop(now + 0.05)
  }
}

// Singleton
export const audio = new AudioManager()
