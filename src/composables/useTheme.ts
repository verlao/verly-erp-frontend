import { ref, watch, onMounted } from 'vue'
import { useStorage, usePreferredDark } from '@vueuse/core'

export type ThemeMode = 'light' | 'dark' | 'system'

export function useTheme() {
  // Store the user's theme preference (light/dark/system)
  const themeMode = useStorage<ThemeMode>('theme-mode', 'system')

  // Get system dark mode preference
  const preferredDark = usePreferredDark()

  // Current applied theme
  const isDark = ref(false)

  // Apply theme to document
  const applyTheme = (dark: boolean) => {
    const html = document.documentElement
    if (dark) {
      html.classList.add('dark')
      html.classList.remove('light')
    } else {
      html.classList.add('light')
      html.classList.remove('dark')
    }
    isDark.value = dark
  }

  // Determine if dark mode should be active based on themeMode
  const resolveTheme = () => {
    if (themeMode.value === 'dark') {
      return true
    } else if (themeMode.value === 'light') {
      return false
    } else {
      // system
      return preferredDark.value
    }
  }

  // Function to set theme mode
  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode
    applyTheme(resolveTheme())
  }

  // Watch for theme mode changes
  watch(themeMode, () => {
    applyTheme(resolveTheme())
  })

  // Watch for system preference changes when in system mode
  watch(preferredDark, (newPreferredDark) => {
    if (themeMode.value === 'system') {
      applyTheme(newPreferredDark)
    }
  })

  // Initialize theme
  onMounted(() => {
    applyTheme(resolveTheme())
  })

  // Also initialize immediately for SSR/hydration
  applyTheme(resolveTheme())

  return {
    themeMode,
    isDark,
    setThemeMode,
  }
}
