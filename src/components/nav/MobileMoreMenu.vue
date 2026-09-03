<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-[60] bg-white flex flex-col">
        <div class="px-4 py-4 border-b border-border flex items-center justify-between">
          <h1 class="text-xl font-bold text-foreground">Verly ERP</h1>
          <button
            class="p-2 rounded-md hover:bg-accent transition-colors"
            aria-label="Fechar menu"
            @click="close"
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <nav class="flex-1 overflow-y-auto py-2">
          <router-link
            v-for="item in moreItems"
            :key="String(item.name)"
            :to="{ name: item.name }"
            custom
            v-slot="{ navigate, isActive }"
          >
            <button
              :class="[
                'w-full text-left px-6 py-4 text-base flex items-center gap-3 transition-colors',
                isActive
                  ? 'bg-accent text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent/50',
              ]"
              @click="navAndClose(navigate)"
            >
              <NavigationIcon :icon="item.icon" />
              {{ item.label }}
            </button>
          </router-link>
        </nav>

        <div class="px-4 py-4 border-t border-border">
          <button
            class="w-full text-left px-2 py-3 text-base text-destructive flex items-center gap-3 rounded-md hover:bg-destructive/10 transition-colors"
            @click="emit('logout'); close()"
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            Sair
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  canAccessNavigationItem,
  navigationItemsFor,
} from '../../router/navigation'
import { routes } from '../../router/routes'
import { useAuthStore } from '../../stores/auth'
import NavigationIcon from './NavigationIcon.vue'

interface Props {
  open: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  logout: []
}>()

const authStore = useAuthStore()
const moreItems = computed(() =>
  navigationItemsFor(routes, 'more').filter((item) =>
    canAccessNavigationItem(item, authStore.isAdmin),
  ),
)
const close = () => emit('update:open', false)
const navAndClose = (navigate: () => void) => {
  close()
  navigate()
}
</script>
