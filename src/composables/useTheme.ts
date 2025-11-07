import { useDark, useStorage, usePreferredDark } from '@vueuse/core'
import { watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

export function useTheme() {
  // Store the user's theme preference (light/dark/system)
  const themeMode = useStorage<ThemeMode>('theme-mode', 'system')

  // Get system dark mode preference
  const preferredDark = usePreferredDark()

  // Determine if dark mode should be active
  const isDark = useDark({
    selector: 'html',
    attribute: 'class',
    valueDark: 'dark',
    valueLight: 'light',
    storageKey: 'theme-mode-internal',
    onChanged: (dark: boolean) => {
      // Apply theme class to document element
      const html = document.documentElement
      if (dark) {
        html.classList.add('dark')
        html.classList.remove('light')
      } else {
        html.classList.add('light')
        html.classList.remove('dark')
      }
    },
  })

  // Function to set theme mode
  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode

    if (mode === 'system') {
      // Follow system preference
      isDark.value = preferredDark.value
    } else {
      // Set explicit light or dark
      isDark.value = mode === 'dark'
    }
  }

  // Watch for system preference changes when in system mode
  watch(preferredDark, (newPreferredDark) => {
    if (themeMode.value === 'system') {
      isDark.value = newPreferredDark
    }
  })

  // Initialize theme on load
  const initTheme = () => {
    if (themeMode.value === 'system') {
      isDark.value = preferredDark.value
    } else {
      isDark.value = themeMode.value === 'dark'
    }
  }

  // Initialize immediately
  initTheme()

  return {
    themeMode,
    isDark,
    setThemeMode,
    initTheme,
  }
}
