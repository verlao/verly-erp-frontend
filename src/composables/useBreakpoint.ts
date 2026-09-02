import { onBeforeUnmount, onMounted, ref } from 'vue'

// Singleton: um único resize listener pro app inteiro.
// Todos os componentes que consomem useBreakpoint() veem o mesmo ref reativo.
const isMobile = ref(false)
const isWide = ref(false)
let refCount = 0

const update = () => {
  if (typeof window === 'undefined') return
  const w = window.innerWidth
  isMobile.value = w < 768
  isWide.value = w >= 1280
}

// Detecção inicial síncrona (antes do primeiro render) — evita flash de
// layout errado em SSR/hidratação ou no primeiro frame.
if (typeof window !== 'undefined') {
  update()
}

/**
 * Reactive viewport breakpoint detection.
 *
 * Breakpoints:
 * - isMobile: width < 768 (Tailwind md breakpoint)
 * - isWide: width ≥ 1280 (Tailwind xl breakpoint)
 */
export function useBreakpoint() {
  onMounted(() => {
    if (refCount === 0) {
      update()
      window.addEventListener('resize', update)
    }
    refCount++
  })
  onBeforeUnmount(() => {
    refCount--
    if (refCount === 0) {
      window.removeEventListener('resize', update)
    }
  })
  return { isMobile, isWide }
}
