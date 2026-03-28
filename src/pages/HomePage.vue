<script setup lang="ts">
import { useRouter } from 'vue-router'
import MainMenu from '../components/MainMenu.vue'

const router = useRouter()

function handleStartGame(modeId: string): void {
  router.push({ name: 'game', params: { mode: modeId } })
}
</script>

<template>
  <MainMenu @start-game="handleStartGame" />
</template>
