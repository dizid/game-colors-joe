<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { InputHandler } from '../lib/input-handler'
import { fillWhite } from '../lib/canvas-renderer'
import type { GestureEvent } from '../types/game'

const props = defineProps<{
  screenShake: boolean
}>()

const emit = defineEmits<{
  gesture: [event: GestureEvent]
  ready: [persist: CanvasRenderingContext2D, anim: CanvasRenderingContext2D, width: number, height: number]
}>()

const container = ref<HTMLDivElement>()
const persistCanvas = ref<HTMLCanvasElement>()
const animCanvas = ref<HTMLCanvasElement>()
let inputHandler: InputHandler | null = null

function setupCanvases(): void {
  const containerEl = container.value
  const persistEl = persistCanvas.value
  const animEl = animCanvas.value
  if (!containerEl || !persistEl || !animEl) return

  const rect = containerEl.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, 2) // Cap at 2x
  const width = Math.floor(rect.width * dpr)
  const height = Math.floor(rect.height * dpr)

  // Set canvas dimensions
  persistEl.width = width
  persistEl.height = height
  persistEl.style.width = `${rect.width}px`
  persistEl.style.height = `${rect.height}px`

  animEl.width = width
  animEl.height = height
  animEl.style.width = `${rect.width}px`
  animEl.style.height = `${rect.height}px`

  const persistCtx = persistEl.getContext('2d')!
  const animCtx = animEl.getContext('2d')!

  // Scale for DPR
  persistCtx.scale(dpr, dpr)
  animCtx.scale(dpr, dpr)

  // Fill white background
  fillWhite(persistCtx, rect.width, rect.height)

  // Emit ready with logical (CSS) dimensions
  emit('ready', persistCtx, animCtx, rect.width, rect.height)
}

onMounted(() => {
  setupCanvases()

  // Set up input handling on the animation canvas (top layer)
  if (animCanvas.value) {
    inputHandler = new InputHandler(animCanvas.value, (gesture) => {
      emit('gesture', gesture)
    })
  }

  // Handle resize
  const observer = new ResizeObserver(() => {
    setupCanvases()
  })
  if (container.value) observer.observe(container.value)
})

onUnmounted(() => {
  inputHandler?.destroy()
})
</script>

<template>
  <div
    ref="container"
    class="relative w-full h-full overflow-hidden rounded-lg"
    :class="{ 'screen-shake': screenShake }"
  >
    <!-- Wood frame border -->
    <div class="absolute inset-0 rounded-lg border-4 border-[#8B7355] shadow-lg pointer-events-none z-10" />

    <!-- Persistent paint layer -->
    <canvas
      ref="persistCanvas"
      class="absolute inset-0"
    />

    <!-- Animation layer (particles) - receives input -->
    <canvas
      ref="animCanvas"
      class="absolute inset-0 z-[5] cursor-crosshair"
    />
  </div>
</template>
