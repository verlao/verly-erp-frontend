<script setup lang="ts">
import { RouterView } from 'vue-router'
import NotificationContainer from './components/ui/NotificationContainer.vue'
import PwaUpdatePrompt from './components/PwaUpdatePrompt.vue'
import { useTheme } from './composables/useTheme'

// Initialize theme on app load
useTheme()
</script>

<template>
  <RouterView />
  <NotificationContainer />
  <PwaUpdatePrompt />
</template>

<style>
/* Os estilos já são importados no main.ts */
</style>
