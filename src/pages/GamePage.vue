<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SplatCanvas from '../components/SplatCanvas.vue'
import ColorPicker from '../components/ColorPicker.vue'
import GameHud from '../components/GameHud.vue'
import GameOverModal from '../components/GameOverModal.vue'
import PauseOverlay from '../components/PauseOverlay.vue'
import { useGameState } from '../composables/useGameState'
import { saveArtwork } from '../lib/storage'
import type { GestureEvent } from '../types/game'

const route = useRoute()
const router = useRouter()
const modeId = route.params.mode as string

const {
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
  getCanvasDataUrl,
  clearAndReset,
} = useGameState()

const canvasReady = ref(false)
const canvasDataUrl = ref<string | null>(null)

function onCanvasReady(
  persist: CanvasRenderingContext2D,
  anim: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  setCanvasContexts(persist, anim, width, height)
  canvasReady.value = true
  startGame(modeId)
}

function onGesture(gesture: GestureEvent): void {
  handleGesture(gesture)
}

function onPause(): void {
  pauseGame()
}

function onResume(): void {
  resumeGame()
}

function onPlayAgain(): void {
  canvasDataUrl.value = null
  startGame(modeId)
}

function onGoHome(): void {
  clearAndReset()
  router.push({ name: 'home' })
}

function onShare(): void {
  const dataUrl = getCanvasDataUrl()
  if (!dataUrl) return

  // Build a fun share message with score
  const title = activeMode.value?.getEndTitle(state) ?? 'Check out my painting!'
  const shareText = state.score > 0
    ? `I scored ${state.score.toLocaleString()} on Joe's Splat Factory! ${title} 🎨💥`
    : `Check out my painting from Joe's Splat Factory! 🎨`

  // Try native share API first (works great on mobile for social media)
  if (navigator.share) {
    fetch(dataUrl)
      .then(r => r.blob())
      .then(blob => {
        const file = new File([blob], `joe-painting-${Date.now()}.png`, { type: 'image/png' })
        navigator.share({
          title: "Joe's Splat Factory",
          text: shareText,
          url: 'https://joes-splat-factory.netlify.app',
          files: [file],
        }).catch(() => {
          downloadArt(dataUrl)
        })
      })
  } else {
    downloadArt(dataUrl)
  }

  // Also auto-save artwork to gallery
  saveArtwork({
    id: `art-${Date.now()}`,
    dataUrl,
    timestamp: Date.now(),
    mode: modeId,
    score: state.score,
  })
}

function downloadArt(dataUrl: string): void {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `joe-painting-${Date.now()}.png`
  link.click()
}

// Watch for game completion
watch(() => state.isComplete, (complete) => {
  if (complete) {
    canvasDataUrl.value = getCanvasDataUrl()
  }
})

// Handle keyboard pause
function onKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Escape') {
    if (state.isPaused) resumeGame()
    else pauseGame()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
  clearAndReset()
})
</script>

<template>
  <div class="h-full flex flex-col bg-deep-navy">
    <!-- Canvas area -->
    <div class="flex-1 p-2 sm:p-4 relative overflow-hidden">
      <SplatCanvas
        :screen-shake="screenShake"
        @gesture="onGesture"
        @ready="onCanvasReady"
      />

      <!-- HUD overlay -->
      <GameHud
        v-if="activeMode"
        :state="state"
        :feedbacks="feedbacks"
        :combo-text="comboText"
        :has-timer="activeMode.config.hasTimer"
        :has-score="activeMode.config.hasScore"
        :joe-mood="joeMood"
        :idle-taunt="idleTaunt"
        :silly-event="sillyEvent"
        @pause="onPause"
      />
    </div>

    <!-- Color picker bar -->
    <div class="bg-black/30 backdrop-blur-sm border-t border-white/5 flex justify-center">
      <ColorPicker
        :selected-color-id="state.selectedColorId"
        @select="selectColor"
      />
    </div>

    <!-- Pause overlay -->
    <PauseOverlay
      v-if="state.isPaused"
      @resume="onResume"
      @quit="onGoHome"
    />

    <!-- Game over modal -->
    <GameOverModal
      v-if="state.isComplete"
      :state="state"
      :title="activeMode?.getEndTitle(state) ?? 'Done!'"
      :subtitle="activeMode?.getEndSubtitle(state) ?? ''"
      :best-score="bestScore"
      :coverage="coverage"
      :canvas-data-url="canvasDataUrl"
      @play-again="onPlayAgain"
      @go-home="onGoHome"
      @share="onShare"
    />
  </div>
</template>
