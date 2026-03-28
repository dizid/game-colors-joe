<script setup lang="ts">
import { computed } from 'vue'
import type { GameState } from '../types/game'
import type { FeedbackEvent } from '../composables/useGameState'

const props = defineProps<{
  state: GameState
  feedbacks: FeedbackEvent[]
  comboText: string
  hasTimer: boolean
  hasScore: boolean
}>()

const emit = defineEmits<{
  pause: []
}>()

const timeDisplay = computed(() => {
  if (props.state.timeRemaining === null) return ''
  const secs = Math.ceil(props.state.timeRemaining)
  return `${secs}s`
})

const isLowTime = computed(() => {
  return props.state.timeRemaining !== null && props.state.timeRemaining <= 10
})

const comboMultiplier = computed(() => {
  const c = props.state.combo
  if (c >= 10) return 'x5'
  if (c >= 8) return 'x4'
  if (c >= 5) return 'x3'
  if (c >= 3) return 'x2'
  if (c >= 2) return 'x1.5'
  return ''
})
</script>

<template>
  <div class="absolute inset-x-0 top-0 z-20 pointer-events-none">
    <!-- Top bar -->
    <div class="flex items-center justify-between px-4 py-2 pointer-events-auto">
      <!-- Score -->
      <div v-if="hasScore" class="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-1.5 min-w-24">
        <div class="text-white/60 text-[10px] uppercase tracking-wider font-semibold">Score</div>
        <div class="text-white text-xl font-bold font-mono tabular-nums leading-tight">
          {{ state.score.toLocaleString() }}
        </div>
      </div>

      <!-- Zen mode label -->
      <div v-else class="bg-black/30 backdrop-blur-sm rounded-xl px-4 py-2">
        <div class="text-white/80 text-sm font-medium">Zen Mode</div>
      </div>

      <!-- Pause button -->
      <button
        @click="emit('pause')"
        class="bg-black/50 backdrop-blur-sm rounded-xl px-3 py-2 min-w-11 min-h-11 flex items-center justify-center
               text-white/80 hover:text-white hover:bg-black/60 transition-colors active:scale-95 touch-manipulation"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
        </svg>
      </button>

      <!-- Timer -->
      <div
        v-if="hasTimer"
        class="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-1.5 min-w-20 text-center"
        :class="{ 'bg-red-900/70': isLowTime }"
      >
        <div class="text-white/60 text-[10px] uppercase tracking-wider font-semibold">Time</div>
        <div
          class="text-white text-xl font-bold font-mono tabular-nums leading-tight"
          :class="{ 'text-red-300 animate-pulse': isLowTime }"
        >
          {{ timeDisplay }}
        </div>
      </div>
    </div>

    <!-- Combo display -->
    <div
      v-if="comboText"
      class="flex justify-center mt-2"
    >
      <div class="combo-text text-center">
        <div class="text-3xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
             style="text-shadow: 0 0 20px rgba(255,107,53,0.8)">
          {{ comboText }}
        </div>
        <div v-if="comboMultiplier" class="text-lg font-bold text-accent mt-0.5">
          {{ comboMultiplier }}
        </div>
      </div>
    </div>

    <!-- Floating score feedbacks -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        v-for="fb in feedbacks"
        :key="fb.id"
        class="absolute float-up text-white font-bold text-lg drop-shadow-lg pointer-events-none"
        :style="{ left: `${fb.x}px`, top: `${fb.y - 20}px` }"
      >
        {{ fb.text }}
      </div>
    </div>
  </div>
</template>
