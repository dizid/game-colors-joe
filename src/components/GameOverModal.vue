<script setup lang="ts">
import type { GameState } from '../types/game'
import { getFunnyCoverageLabel } from '../lib/humor'

const props = defineProps<{
  state: GameState
  title: string
  subtitle: string
  bestScore: number
  coverage: number
  canvasDataUrl: string | null
}>()

const emit = defineEmits<{
  playAgain: []
  goHome: []
  share: []
}>()

const isNewBest = props.state.score > 0 && props.state.score >= props.bestScore
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
    <div class="bg-[#1a1a2e] border border-white/10 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6
                w-full sm:max-w-sm shadow-2xl overflow-y-auto max-h-[92vh]
                transform animate-[splat-in_0.4s_ease-out]">

      <!-- Title -->
      <div class="text-center mb-3">
        <h2 class="text-2xl sm:text-3xl font-bold text-white">{{ title }}</h2>
        <p class="text-white/50 text-xs sm:text-sm mt-1">{{ subtitle }}</p>
        <div v-if="isNewBest" class="mt-1.5 text-accent font-bold text-base animate-pulse">
          NEW BEST!
        </div>
      </div>

      <!-- Canvas preview (show BEFORE stats for visual impact) -->
      <div v-if="canvasDataUrl" class="mb-3 rounded-xl overflow-hidden border-2 border-[#8B7355]">
        <img :src="canvasDataUrl" alt="Your artwork" class="w-full max-h-36 sm:max-h-52 object-cover" />
      </div>

      <!-- Score breakdown (compact) -->
      <div v-if="state.score > 0" class="bg-white/5 rounded-xl p-3 mb-3 space-y-1 text-sm">
        <div class="flex justify-between text-white/80">
          <span>Score</span>
          <span class="font-mono font-bold text-white">{{ state.score.toLocaleString() }}</span>
        </div>
        <div class="flex justify-between text-white/50 text-xs">
          <span>Splats</span>
          <span class="font-mono">{{ state.splatCount }}</span>
        </div>
        <div class="flex justify-between text-white/50 text-xs">
          <span>Max Combo</span>
          <span class="font-mono">x{{ state.maxCombo }}</span>
        </div>
        <div class="flex justify-between text-white/50 text-xs">
          <span>Coverage</span>
          <span class="font-mono">{{ Math.round(coverage) }}% {{ getFunnyCoverageLabel(coverage) }}</span>
        </div>
        <div v-if="bestScore > 0" class="flex justify-between text-white/30 text-xs pt-1 border-t border-white/5">
          <span>Previous Best</span>
          <span class="font-mono">{{ bestScore.toLocaleString() }}</span>
        </div>
      </div>

      <!-- Action buttons - big, clear, unmissable -->
      <div class="space-y-2.5">
        <!-- Primary row: Play Again + Share -->
        <div class="flex gap-2">
          <button
            @click="emit('playAgain')"
            class="flex-1 py-3.5 px-4 rounded-xl bg-accent text-white font-bold text-base
                   hover:bg-accent/90 active:scale-[0.97] transition-all touch-manipulation
                   flex items-center justify-center gap-2"
          >
            <span class="text-xl">🎨</span> Play Again
          </button>
          <button
            @click="emit('share')"
            class="flex-1 py-3.5 px-4 rounded-xl bg-emerald-500 text-white font-bold text-base
                   hover:bg-emerald-400 active:scale-[0.97] transition-all touch-manipulation
                   flex items-center justify-center gap-2"
          >
            <span class="text-xl">📤</span> Share
          </button>
        </div>

        <!-- Back to menu -->
        <button
          @click="emit('goHome')"
          class="w-full py-2.5 rounded-xl bg-white/5 text-white/50 hover:text-white/70 hover:bg-white/10
                 text-sm font-medium transition-all touch-manipulation"
        >
          Back to Menu
        </button>
      </div>
    </div>
  </div>
</template>
