import { ref, reactive } from 'vue'
import type { GameState, PaintColorId, GestureEvent, SplatConfig } from '../types/game'
import type { GameMode, SplatResult } from '../types/modes'
import { createMode } from '../modes'
import { getColor, getComboName } from '../lib/color-palette'
import { ParticleSystem } from '../lib/particle-system'
import { GameLoop } from '../lib/game-loop'
import { audio } from '../lib/audio-manager'
import { saveHighScore, getBestScore } from '../lib/storage'
import { drawSplat, clearCanvas, fillWhite, calculateCoverage } from '../lib/canvas-renderer'
import { getJoeMood, getIdleTaunt, getComboBreakText, rollForSillyEvent, type JoeMood, type SillyEvent } from '../lib/humor'

// Feedback event for UI display
export interface FeedbackEvent {
  id: number
  text: string
  points: number
  x: number
  y: number
  timestamp: number
}

let feedbackCounter = 0

export function useGameState() {
  const state = reactive<GameState>({
    mode: '',
    score: 0,
    combo: 0,
    maxCombo: 0,
    timeRemaining: null,
    selectedColorId: 'blue' as PaintColorId,
    isPaused: false,
    isComplete: false,
    splatCount: 0,
    missCount: 0,
  })

  const activeMode = ref<GameMode | null>(null)
  const particles = new ParticleSystem()
  const gameLoop = ref<GameLoop | null>(null)
  const feedbacks = ref<FeedbackEvent[]>([])
  const comboText = ref('')
  const screenShake = ref(false)
  const bestScore = ref(0)
  const coverage = ref(0)

  // Humor state
  const joeMood = ref<JoeMood>('idle')
  const idleTaunt = ref('')
  const sillyEvent = ref<SillyEvent | null>(null)
  let timeSinceLastSplat = 0
  let lastIdleTauntTime = 0
  let previousCombo = 0

  // Canvas refs - set by SplatCanvas component
  let persistCtx: CanvasRenderingContext2D | null = null
  let animCtx: CanvasRenderingContext2D | null = null
  let canvasWidth = 0
  let canvasHeight = 0

  function setCanvasContexts(
    persist: CanvasRenderingContext2D,
    anim: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    persistCtx = persist
    animCtx = anim
    canvasWidth = width
    canvasHeight = height
  }

  function startGame(modeId: string): void {
    const mode = createMode(modeId)
    activeMode.value = mode
    state.mode = modeId
    state.score = 0
    state.combo = 0
    state.maxCombo = 0
    state.timeRemaining = mode.config.duration
    state.isPaused = false
    state.isComplete = false
    state.splatCount = 0
    state.missCount = 0
    comboText.value = ''
    feedbacks.value = []
    coverage.value = 0
    joeMood.value = 'idle'
    idleTaunt.value = ''
    sillyEvent.value = null
    timeSinceLastSplat = 0
    lastIdleTauntTime = 0
    previousCombo = 0

    bestScore.value = getBestScore(modeId)

    mode.initialize(canvasWidth, canvasHeight)
    particles.reset()

    // Reset canvas
    if (persistCtx) {
      fillWhite(persistCtx, canvasWidth, canvasHeight)
    }

    // Create game loop
    const loop = new GameLoop(
      (dt) => update(dt),
      (dt) => render(dt)
    )
    gameLoop.value = loop
    loop.start()

    audio.init()
  }

  function update(dt: number): void {
    if (state.isPaused || state.isComplete) return

    const mode = activeMode.value
    if (!mode) return

    // Update game mode (timer, etc)
    const modeUpdate = mode.update(dt, state)
    if (modeUpdate.timeRemaining !== undefined) {
      state.timeRemaining = modeUpdate.timeRemaining
    }

    // Update particles
    particles.update(dt)

    // Commit ready splats to persistent canvas
    const readySplats = particles.getReadySplats()
    if (persistCtx) {
      for (const splat of readySplats) {
        drawSplat(persistCtx, splat)
      }
    }

    // Track idle time and update Joe's mood
    timeSinceLastSplat += dt
    joeMood.value = getJoeMood(state.combo, timeSinceLastSplat, state.isComplete)

    // Show idle taunts when Joe gets bored
    const now = Date.now()
    if (timeSinceLastSplat > 5 && now - lastIdleTauntTime > 4000) {
      idleTaunt.value = getIdleTaunt()
      lastIdleTauntTime = now
      // Clear after 3 seconds
      setTimeout(() => { idleTaunt.value = '' }, 3000)
    }

    // Clear silly events after their duration
    if (sillyEvent.value) {
      sillyEvent.value = null // cleared by timeout set in handleGesture
    }

    // Check if game is complete
    if (modeUpdate.completed && !state.isComplete) {
      endGame()
    }

    // Clean up old feedbacks
    feedbacks.value = feedbacks.value.filter(f => now - f.timestamp < 1200)
  }

  function render(_dt: number): void {
    if (!animCtx) return

    // Clear animation layer
    clearCanvas(animCtx, canvasWidth, canvasHeight)

    // Draw active particles
    particles.render(animCtx)
  }

  function handleGesture(gesture: GestureEvent): void {
    if (state.isPaused || state.isComplete) return
    if (!activeMode.value) return

    const color = getColor(state.selectedColorId)

    // Calculate base size from gesture
    const speed = Math.sqrt(gesture.velocity.x ** 2 + gesture.velocity.y ** 2)
    const size = 12 + gesture.pressure * 20 + Math.min(speed * 0.02, 15)

    const splatConfig: SplatConfig = {
      position: gesture.position,
      velocity: gesture.velocity,
      color: color.hex,
      size,
      pressure: gesture.pressure,
    }

    // Get score from game mode
    const result = activeMode.value.onSplat(splatConfig, state)

    // Reset idle tracking
    timeSinceLastSplat = 0
    idleTaunt.value = ''
    previousCombo = state.combo

    // Update state
    if (result.score > 0) {
      state.score += result.score
      state.combo++
      state.maxCombo = Math.max(state.maxCombo, state.combo)
      state.splatCount++

      // Audio - big splats get the funny fart-splat sound
      if (gesture.pressure > 0.8 && speed > 500) {
        audio.playFartSplat()
      } else {
        audio.playSplat(gesture.pressure)
      }
      if (speed > 400) audio.playWhoosh(gesture.pressure)

      // Combo feedback
      const comboName = getComboName(state.combo)
      if (comboName && comboName !== comboText.value) {
        comboText.value = comboName
        audio.playCombo(state.combo >= 10 ? 5 : state.combo >= 5 ? 3 : 2)

        // Burp sound on high combos for extra hilarity
        if (state.combo >= 7) {
          setTimeout(() => audio.playBurp(), 200)
        }

        // Screen shake for high combos
        if (state.combo >= 5) {
          screenShake.value = true
          setTimeout(() => { screenShake.value = false }, 300)
        }

        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(50)
      }

      // Points feedback with optional quip
      addFeedback(result, gesture.position)

      // Roll for silly random events
      const event = rollForSillyEvent(state.splatCount)
      if (event) {
        sillyEvent.value = event
        state.score += event.bonusPoints
        audio.playCombo(4) // fanfare for event
        if (navigator.vibrate) navigator.vibrate([50, 30, 50])
        setTimeout(() => { sillyEvent.value = null }, event.duration)
      }
    } else {
      // Combo break!
      const breakText = getComboBreakText(previousCombo)
      if (breakText) {
        addFeedback(
          { score: 0, comboMultiplier: 1, feedback: 'miss', feedbackText: breakText },
          gesture.position
        )
        audio.playMiss()
      }
      state.combo = 0
      comboText.value = ''
      audio.playSplat(0.3)
    }

    // Emit particles + queue splat rendering
    particles.emit(splatConfig)

    // Start loop if not running (for zen mode)
    if (gameLoop.value && !gameLoop.value.isRunning) {
      gameLoop.value.start()
    }
  }

  function addFeedback(result: SplatResult, position: { x: number; y: number }): void {
    const text = result.feedbackText
      ? `+${result.score} ${result.feedbackText}`
      : `+${result.score}`

    feedbacks.value.push({
      id: ++feedbackCounter,
      text,
      points: result.score,
      x: position.x,
      y: position.y,
      timestamp: Date.now(),
    })
  }

  function selectColor(colorId: PaintColorId): void {
    state.selectedColorId = colorId
    audio.playClick()
  }

  function pauseGame(): void {
    state.isPaused = true
    gameLoop.value?.stop()
  }

  function resumeGame(): void {
    state.isPaused = false
    gameLoop.value?.start()
  }

  function endGame(): void {
    state.isComplete = true
    gameLoop.value?.stop()
    audio.playGameOver()

    // Calculate coverage
    if (persistCtx) {
      coverage.value = calculateCoverage(persistCtx, canvasWidth, canvasHeight)
    }

    // Save high score
    if (activeMode.value?.config.hasScore) {
      saveHighScore(state.mode, state.score)
    }
  }

  function getCanvasDataUrl(): string | null {
    if (!persistCtx) return null
    return persistCtx.canvas.toDataURL('image/png')
  }

  function clearAndReset(): void {
    gameLoop.value?.stop()
    particles.reset()
    if (persistCtx) fillWhite(persistCtx, canvasWidth, canvasHeight)
    if (animCtx) clearCanvas(animCtx, canvasWidth, canvasHeight)
  }

  return {
    state,
    activeMode,
    feedbacks,
    comboText,
    screenShake,
    bestScore,
    coverage,
    joeMood,
    idleTaunt,
    sillyEvent,
    setCanvasContexts,
    startGame,
    handleGesture,
    selectColor,
    pauseGame,
    resumeGame,
    endGame,
    getCanvasDataUrl,
    clearAndReset,
  }
}
