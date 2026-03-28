<script setup lang="ts">
const emit = defineEmits<{
  resume: []
  quit: []
}>()
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div class="bg-[#1a1a2e] border border-white/10 rounded-3xl p-8 max-w-xs w-full shadow-2xl text-center">
      <h2 class="text-2xl font-bold text-white mb-6">Paused</h2>

      <div class="space-y-3">
        <button
          @click="emit('resume')"
          class="w-full py-3 px-4 rounded-xl bg-accent text-white font-bold text-lg
                 hover:bg-accent/90 active:scale-[0.98] transition-all touch-manipulation"
        >
          Resume
        </button>
        <button
          @click="emit('quit')"
          class="w-full py-2.5 px-4 rounded-xl bg-white/10 text-white/60 font-medium
                 hover:bg-white/15 active:scale-[0.98] transition-all touch-manipulation"
        >
          Quit to Menu
        </button>
      </div>
    </div>
  </div>
</template>
