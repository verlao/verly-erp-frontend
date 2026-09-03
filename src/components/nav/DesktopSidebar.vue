<template>
  <aside
    :class="[
      'bg-sidebar border-r border-border fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out',
      collapsed ? 'w-16' : 'w-64',
    ]"
  >
    <div class="p-4 border-b border-border flex items-center justify-between shrink-0">
      <h1
        :class="[
          'font-bold text-foreground transition-opacity duration-300',
          collapsed ? 'opacity-0 w-0' : 'opacity-100 text-xl',
        ]"
      >
        Verly ERP
      </h1>
      <button
        class="h-11 w-11 rounded-md hover:bg-accent transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        :title="collapsed ? 'Expandir menu' : 'Recolher menu'"
        :aria-label="collapsed ? 'Expandir menu' : 'Recolher menu'"
        @click="emit('update:collapsed', !collapsed)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          :class="['transition-transform duration-300', collapsed ? 'rotate-180' : '']"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
    </div>

    <div class="relative mt-4 flex-1 min-h-0">
      <nav
        ref="containerRef"
        :style="maskStyle"
        :class="[
          'h-full space-y-1 px-2 overflow-y-auto',
          collapsed
            ? '[&>[data-navigation-item]]:h-8 [&>[data-navigation-item]]:min-h-8'
            : '[&>[data-navigation-item]]:min-h-11',
        ]"
      >
        <router-link
          v-for="item in sidebarItems"
          :key="String(item.name)"
          :to="{ name: item.name }"
          custom
          v-slot="{ navigate, isActive }"
        >
          <Button
            data-navigation-item
            class="w-full justify-start"
            :variant="isActive ? 'secondary' : 'ghost'"
            :title="item.accessibleLabel ?? item.label"
            :aria-label="item.accessibleLabel ?? item.label"
            @click="navigate"
          >
            <span class="mr-2">
              <NavigationIcon :icon="item.icon" :size="16" />
            </span>
            <span :class="{ 'sr-only': collapsed }">{{ item.label }}</span>
          </Button>
        </router-link>
      </nav>

      <button
        v-if="canScrollUp"
        type="button"
        class="absolute right-1 top-1 z-10 h-8 w-8 rounded-full border border-border bg-sidebar shadow-md flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        title="Ver destinos anteriores"
        aria-label="Ver destinos anteriores"
        @click="scrollNavigation('up')"
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
      <button
        v-if="canScrollDown"
        type="button"
        class="absolute right-1 bottom-1 z-10 h-8 w-8 rounded-full border border-border bg-sidebar shadow-md flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        title="Ver mais destinos"
        aria-label="Ver mais destinos"
        @click="scrollNavigation('down')"
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </div>

    <div class="p-4 border-t border-border shrink-0">
      <Button
        variant="ghost"
        class="w-full min-h-11 justify-start text-destructive hover:text-destructive-foreground hover:bg-destructive"
        title="Sair"
        aria-label="Sair"
        @click="emit('logout')"
      >
        <span class="mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
        </span>
        <span :class="{ 'sr-only': collapsed }">Sair</span>
      </Button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useVerticalOverflow } from '../../composables/useVerticalOverflow'
import {
  canAccessNavigationItem,
  navigationItemsFor,
} from '../../router/navigation'
import { routes } from '../../router/routes'
import { useAuthStore } from '../../stores/auth'
import Button from '../ui/Button.vue'
import NavigationIcon from './NavigationIcon.vue'

interface Props {
  collapsed: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  'update:collapsed': [value: boolean]
  logout: []
}>()

const authStore = useAuthStore()
const sidebarItems = computed(() =>
  navigationItemsFor(routes, 'sidebar').filter((item) =>
    canAccessNavigationItem(item, authStore.isAdmin),
  ),
)
const {
  containerRef,
  canScrollUp,
  canScrollDown,
  maskStyle,
  scroll: scrollNavigation,
} = useVerticalOverflow()
</script>
