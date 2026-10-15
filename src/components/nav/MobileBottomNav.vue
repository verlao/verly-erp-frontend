<template>
  <nav class="font-verly-body fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-[#DDE4E1] bg-[#F8FAF9]/95 px-1 pt-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-3px_16px_rgba(20,26,31,.05)] backdrop-blur" style="height: calc(76px + env(safe-area-inset-bottom))" aria-label="Navegação inferior">
    <router-link v-for="item in bottomItems" :key="String(item.name)" :to="{ name: item.name }" custom v-slot="{ navigate, isActive }">
      <button :class="['relative mx-auto flex min-h-11 w-full max-w-[88px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D7A]', isActive ? 'bg-[#E4F1EF] text-[#1C625F]' : 'text-[#67736E] hover:bg-[#EDF3F1] hover:text-[#26312D]']" :aria-label="item.accessibleLabel ?? item.label" :aria-current="isActive ? 'page' : undefined" @click="navigate">
        <span :class="isActive ? 'text-[#1C625F]' : ''"><NavigationIcon :icon="item.icon" :size="21" /></span>
        <span :class="['max-w-full truncate text-[13px] leading-4', isActive ? 'font-semibold' : 'font-medium']">{{ item.label }}</span>
        <span v-if="isActive" class="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#2E7D7A]" aria-hidden="true" />
      </button>
    </router-link>
    <button class="mx-auto flex min-h-11 w-full max-w-[88px] flex-col items-center justify-center gap-0.5 rounded-xl text-[#67736E] transition hover:bg-[#EDF3F1] hover:text-[#26312D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D7A]" aria-label="Mais" @click="emit('openMore')">
      <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>
      <span class="text-[13px] font-medium leading-4">Mais</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { navigationItemsFor } from '../../router/navigation'
import { routes } from '../../router/routes'
import NavigationIcon from './NavigationIcon.vue'
const emit = defineEmits<{ openMore: [] }>()
const bottomItems = navigationItemsFor(routes, 'bottom')
</script>
