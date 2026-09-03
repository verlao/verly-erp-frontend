<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border grid grid-cols-5 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(0,0,0,0.04)]"
    style="height: calc(4rem + env(safe-area-inset-bottom))"
  >
    <router-link
      v-for="item in bottomItems"
      :key="String(item.name)"
      :to="{ name: item.name }"
      custom
      v-slot="{ navigate, isActive }"
    >
      <button
        v-if="item.emphasis === 'primary'"
        class="relative flex flex-col items-center justify-center"
        :aria-label="item.accessibleLabel ?? item.label"
        @click="navigate"
      >
        <div
          class="absolute -top-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-lg transition-colors"
        >
          <NavigationIcon :icon="item.icon" :size="28" class="text-white" />
        </div>
        <span class="text-[10px] font-medium text-blue-600 mt-7">
          {{ item.label }}
        </span>
      </button>
      <button
        v-else
        :class="[
          'flex flex-col items-center justify-center gap-1 transition-colors',
          isActive
            ? 'text-blue-600'
            : 'text-muted-foreground hover:text-foreground',
        ]"
        :aria-label="item.accessibleLabel ?? item.label"
        @click="navigate"
      >
        <NavigationIcon :icon="item.icon" />
        <span class="text-[10px] font-medium">{{ item.label }}</span>
      </button>
    </router-link>

    <button
      class="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Mais"
      @click="emit('openMore')"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <line x1="4" x2="20" y1="12" y2="12" />
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="18" y2="18" />
      </svg>
      <span class="text-[10px] font-medium">Mais</span>
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
