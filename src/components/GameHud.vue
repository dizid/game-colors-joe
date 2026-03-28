<script setup lang="ts">
import { computed } from 'vue'
import type { GameState } from '../types/game'
import type { FeedbackEvent } from '../composables/useGameState'
import type { JoeMood, SillyEvent } from '../lib/humor'
import { JOE_FACES } from '../lib/humor'

const props = defineProps<{
  state: GameState
  feedbacks: FeedbackEvent[]
  comboText: string
  hasTimer: boolean
  hasScore: boolean
  joeMood: JoeMood
  idleTaunt: string
  sillyEvent: SillyEvent | null
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
  if (c >= 20) return 'x6'
  if (c >= 15) return 'x5.5'
  if (c >= 11) return 'x5'
  if (c >= 9) return 'x4.5'
  if (c >= 7) return 'x4'
  if (c >= 5) return 'x3'
  if (c >= 4) return 'x2.5'
  if (c >= 3) return 'x2'
  if (c >= 2) return 'x1.5'
  return ''
})

const joeFace = computed(() => JOE_FACES[props.joeMood])

const joeWiggle = computed(() => {
  if (props.joeMood === 'hyped' || props.joeMood === 'godmode') return true
  return false
})
</script>

<template>
  <div class="absolute inset-x-0 top-0 z-20 pointer-events-none">
    <!-- Top bar -->
    <div class="flex items-center justify-between px-4 py-2 pointer-events-auto">
      <!-- Score + Joe face -->
      <div v-if="hasScore" class="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-1.5 min-w-24 flex items-center gap-2">
        <span
          class="text-2xl transition-transform duration-200"
          :class="{ 'animate-bounce': joeWiggle }"
        >{{ joeFace }}</span>
        <div>
          <div class="text-white/60 text-[10px] uppercase tracking-wider font-semibold">Score</div>
          <div class="text-white text-xl font-bold font-mono tabular-nums leading-tight">
            {{ state.score.toLocaleString() }}
          </div>
        </div>
      </div>

      <!-- Zen mode label + Joe -->
      <div v-else class="bg-black/30 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
        <span class="text-2xl">{{ joeFace }}</span>
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

    <!-- Silly random event banner -->
    <div
      v-if="sillyEvent"
      class="flex justify-center mt-3"
    >
      <div class="silly-event bg-gradient-to-r from-yellow-500/90 via-orange-500/90 to-pink-500/90
                  rounded-2xl px-6 py-3 text-center shadow-2xl border border-white/20">
        <div class="text-4xl mb-1">{{ sillyEvent.emoji }}</div>
        <div class="text-white font-bold text-xl drop-shadow-lg">{{ sillyEvent.text }}</div>
        <div class="text-yellow-100 font-mono text-sm">+{{ sillyEvent.bonusPoints }} bonus!</div>
      </div>
    </div>

    <!-- Idle taunt from Joe -->
    <div
      v-if="idleTaunt && !comboText && !sillyEvent"
      class="flex justify-center mt-4"
    >
      <div class="idle-taunt bg-black/60 backdrop-blur-sm rounded-2xl px-5 py-2.5 max-w-xs">
        <div class="text-white/70 text-sm text-center italic">
          {{ idleTaunt }}
        </div>
      </div>
    </div>

    <!-- Floating score feedbacks -->
    <div class="absolute inset-0 overflow-hidden">
      <div
        v-for="fb in feedbacks"
        :key="fb.id"
        class="absolute float-up font-bold text-lg drop-shadow-lg pointer-events-none"
        :class="fb.points > 0 ? 'text-white' : 'text-red-300'"
        :style="{ left: `${fb.x}px`, top: `${fb.y - 20}px` }"
      >
        {{ fb.text }}
      </div>
    </div>
  </div>
</template>
