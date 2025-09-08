<script setup lang="ts">
import { RouterView } from 'vue-router'
import NotificationContainer from './components/ui/NotificationContainer.vue'
</script>

<template>
  <RouterView />
  <NotificationContainer />
</template>

<style>
/* Os estilos já são importados no main.ts */
</style>
