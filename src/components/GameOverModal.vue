<script setup lang="ts">
import type { GameState } from '../types/game'

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
  save: []
}>()

const isNewBest = props.state.score > 0 && props.state.score >= props.bestScore

function getCoverageLabel(pct: number): string {
  if (pct >= 80) return 'JOE APPROVED'
  if (pct >= 60) return 'Street Art'
  if (pct >= 40) return 'Full Chaos'
  if (pct >= 20) return 'Getting Messy'
  return 'Shy Painter'
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
    <div class="bg-[#1a1a2e] border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl
                transform animate-[splat-in_0.4s_ease-out]">

      <!-- Title -->
      <div class="text-center mb-4">
        <h2 class="text-3xl font-bold text-white">{{ title }}</h2>
        <p class="text-white/50 text-sm mt-1">{{ subtitle }}</p>
        <div v-if="isNewBest" class="mt-2 text-accent font-bold text-lg animate-pulse">
          NEW BEST!
        </div>
      </div>

      <!-- Score breakdown -->
      <div v-if="state.score > 0" class="bg-white/5 rounded-2xl p-4 mb-4 space-y-2">
        <div class="flex justify-between text-white/80">
          <span>Score</span>
          <span class="font-mono font-bold text-white">{{ state.score.toLocaleString() }}</span>
        </div>
        <div class="flex justify-between text-white/60 text-sm">
          <span>Splats</span>
          <span class="font-mono">{{ state.splatCount }}</span>
        </div>
        <div class="flex justify-between text-white/60 text-sm">
          <span>Max Combo</span>
          <span class="font-mono">x{{ state.maxCombo }}</span>
        </div>
        <div class="flex justify-between text-white/60 text-sm">
          <span>Coverage</span>
          <span class="font-mono">{{ Math.round(coverage) }}% - {{ getCoverageLabel(coverage) }}</span>
        </div>
        <div v-if="bestScore > 0" class="flex justify-between text-white/40 text-xs pt-1 border-t border-white/5">
          <span>Previous Best</span>
          <span class="font-mono">{{ bestScore.toLocaleString() }}</span>
        </div>
      </div>

      <!-- Canvas preview -->
      <div v-if="canvasDataUrl" class="mb-4 rounded-xl overflow-hidden border-2 border-[#8B7355]">
        <img :src="canvasDataUrl" alt="Your artwork" class="w-full" />
      </div>

      <!-- Actions -->
      <div class="space-y-2">
        <button
          @click="emit('playAgain')"
          class="w-full py-3 px-4 rounded-xl bg-accent text-white font-bold text-lg
                 hover:bg-accent/90 active:scale-[0.98] transition-all touch-manipulation"
        >
          Play Again
        </button>

        <div class="flex gap-2">
          <button
            @click="emit('share')"
            class="flex-1 py-2.5 px-4 rounded-xl bg-white/10 text-white/80 font-medium
                   hover:bg-white/15 active:scale-[0.98] transition-all touch-manipulation text-sm"
          >
            Share Art
          </button>
          <button
            @click="emit('save')"
            class="flex-1 py-2.5 px-4 rounded-xl bg-white/10 text-white/80 font-medium
                   hover:bg-white/15 active:scale-[0.98] transition-all touch-manipulation text-sm"
          >
            Save Art
          </button>
        </div>

        <button
          @click="emit('goHome')"
          class="w-full py-2 text-white/40 hover:text-white/60 text-sm transition-colors touch-manipulation"
        >
          Back to Menu
        </button>
      </div>
    </div>
  </div>
</template>
