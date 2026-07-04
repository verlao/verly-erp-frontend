import { ref, watch, onMounted } from 'vue'
import { useStorage } from '@vueuse/core'

export type ThemeMode = 'light' | 'dark' | 'system'

export function useTheme() {
  // Store the user's theme preference (light/dark/system)
  const themeMode = useStorage<ThemeMode>('theme-mode', 'light')

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

  // Determine if dark mode should be active based on themeMode.
  // Dark mode ainda não é suportado app-wide (só chrome dos navs tinha
  // estilo dark), então NÃO seguimos o prefers-color-scheme do SO: 'system'
  // e 'light' renderizam claro. Reativar quando o dark mode for completo.
  const resolveTheme = () => themeMode.value === 'dark'

  // Function to set theme mode
  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode
    applyTheme(resolveTheme())
  }

  // Watch for theme mode changes
  watch(themeMode, () => {
    applyTheme(resolveTheme())
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
