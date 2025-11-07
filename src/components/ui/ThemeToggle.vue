<script setup lang="ts">
import { computed } from 'vue'
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import { useTheme, type ThemeMode } from '../../composables/useTheme'
import Button from './Button.vue'
import DropdownMenu from './DropdownMenu.vue'

const { themeMode, setThemeMode } = useTheme()

const currentIcon = computed(() => {
  switch (themeMode.value) {
    case 'light':
      return Sun
    case 'dark':
      return Moon
    case 'system':
      return Monitor
    default:
      return Monitor
  }
})

const themes: Array<{ value: ThemeMode; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

const isOpen = defineModel<boolean>('isOpen', { default: false })

const selectTheme = (theme: ThemeMode) => {
  setThemeMode(theme)
  isOpen.value = false
}
</script>

<template>
  <DropdownMenu class="relative">
    <Button
      variant="ghost"
      size="icon"
      @click="isOpen = !isOpen"
      aria-label="Toggle theme"
      class="relative"
    >
      <component :is="currentIcon" class="h-5 w-5" />
    </Button>

    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-card shadow-lg ring-1 ring-border focus:outline-none"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="theme-menu"
      >
        <div class="py-1" role="none">
          <button
            v-for="theme in themes"
            :key="theme.value"
            @click="selectTheme(theme.value)"
            :class="[
              'flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors',
              themeMode === theme.value
                ? 'bg-accent text-accent-foreground'
                : 'text-foreground hover:bg-accent hover:text-accent-foreground'
            ]"
            role="menuitem"
            :aria-label="`Set theme to ${theme.label}`"
          >
            <component :is="theme.icon" class="h-4 w-4" />
            <span>{{ theme.label }}</span>
            <span
              v-if="themeMode === theme.value"
              class="ml-auto text-xs"
              aria-hidden="true"
            >
              ✓
            </span>
          </button>
        </div>
      </div>
    </Transition>
  </DropdownMenu>
</template>
