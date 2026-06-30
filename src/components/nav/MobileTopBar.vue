<template>
  <header
    class="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border flex items-center justify-between px-4 pt-[env(safe-area-inset-top)]"
    style="height: calc(3.5rem + env(safe-area-inset-top))"
  >
    <h2 class="text-lg font-semibold text-foreground truncate">{{ title }}</h2>
    <DropdownMenu>
      <template #trigger>
        <button class="flex items-center gap-2 p-1 rounded-md hover:bg-accent">
          <div
            class="w-8 h-8 bg-primary rounded-full flex items-center justify-center"
          >
            <span class="text-primary-foreground font-semibold text-sm">
              {{ user?.username?.charAt(0)?.toUpperCase() }}
            </span>
          </div>
        </button>
      </template>
      <template #content>
        <div class="w-48 bg-popover border border-border rounded-md shadow-lg">
          <div
            class="px-4 py-2 text-sm text-muted-foreground border-b border-border"
          >
            <span class="font-semibold">{{ user?.username }}</span>
          </div>
          <button
            @click="emit('logout')"
            class="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            Sair
          </button>
        </div>
      </template>
    </DropdownMenu>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import DropdownMenu from '../ui/DropdownMenu.vue'

interface Props {
  title: string
}
defineProps<Props>()
const emit = defineEmits<{ logout: [] }>()

const authStore = useAuthStore()
const user = computed(() => authStore.getUser)
</script>
