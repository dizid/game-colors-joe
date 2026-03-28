<script setup lang="ts">
import { PAINT_COLORS } from '../lib/color-palette'
import type { PaintColorId } from '../types/game'

defineProps<{
  selectedColorId: PaintColorId
}>()

const emit = defineEmits<{
  select: [colorId: PaintColorId]
}>()
</script>

<template>
  <div class="flex items-center gap-2 px-3 py-2">
    <button
      v-for="color in PAINT_COLORS"
      :key="color.id"
      @click="emit('select', color.id)"
      class="relative w-10 h-10 rounded-full transition-all duration-150 active:scale-90 touch-manipulation"
      :class="[
        selectedColorId === color.id
          ? 'ring-3 ring-white ring-offset-2 ring-offset-[#1a1a2e] scale-110'
          : 'opacity-70 hover:opacity-100 hover:scale-105'
      ]"
      :style="{ backgroundColor: color.hex }"
      :title="color.name"
      :aria-label="color.name"
    >
      <!-- Inner glow for selected -->
      <span
        v-if="selectedColorId === color.id"
        class="absolute inset-1 rounded-full border-2 border-white/30"
      />
    </button>
  </div>
</template>
