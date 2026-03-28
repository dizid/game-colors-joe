<script setup lang="ts">
import { getAvailableModes } from '../modes'
import { getBestScore } from '../lib/storage'

const modes = getAvailableModes()

const emit = defineEmits<{
  startGame: [modeId: string]
}>()

function getBest(modeId: string): number {
  return getBestScore(modeId)
}
</script>

<template>
  <div class="min-h-full flex flex-col items-center justify-center px-4 py-8 bg-deep-navy">
    <!-- Title with paint drip effect -->
    <div class="text-center mb-10 relative">
      <!-- Paint splats decoration -->
      <div class="absolute -top-8 -left-6 w-16 h-16 rounded-full bg-bangkok-blue/30 blur-xl" />
      <div class="absolute -top-4 right-0 w-12 h-12 rounded-full bg-tuk-tuk-red/30 blur-xl" />
      <div class="absolute -bottom-6 left-1/4 w-14 h-14 rounded-full bg-temple-yellow/30 blur-xl" />

      <h1 class="text-5xl sm:text-6xl font-bold text-white relative">
        <span class="block">Joe's</span>
        <span class="block text-accent" style="text-shadow: 0 0 30px rgba(255,107,53,0.5)">
          Splat Factory
        </span>
      </h1>
      <p class="text-white/50 mt-3 text-sm">
        Fling paint. Make art. Get messy.
      </p>
    </div>

    <!-- Game mode cards -->
    <div class="w-full max-w-sm space-y-3">
      <button
        v-for="mode in modes"
        :key="mode.id"
        @click="emit('startGame', mode.id)"
        class="w-full p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10
               hover:bg-white/10 hover:border-white/20 transition-all duration-200
               active:scale-[0.98] touch-manipulation text-left group"
      >
        <div class="flex items-center gap-3">
          <span class="text-3xl">{{ mode.icon }}</span>
          <div class="flex-1">
            <div class="text-white font-semibold text-lg group-hover:text-accent transition-colors">
              {{ mode.name }}
            </div>
            <div class="text-white/50 text-sm">
              {{ mode.description }}
            </div>
            <div v-if="getBest(mode.id) > 0" class="text-accent/70 text-xs mt-1 font-mono">
              Best: {{ getBest(mode.id).toLocaleString() }}
            </div>
          </div>
          <svg class="w-5 h-5 text-white/30 group-hover:text-accent/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </div>

    <!-- Footer -->
    <div class="mt-12 text-center">
      <p class="text-white/20 text-xs">
        Inspired by Joe's street art in Thailand
      </p>
    </div>
  </div>
</template>
