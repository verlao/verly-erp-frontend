import { computed, onBeforeUnmount, onMounted, ref, type CSSProperties } from 'vue'

const OVERFLOW_TOLERANCE_PX = 1
const FADE_HEIGHT = '2rem'

export interface VerticalOverflowState {
  up: boolean
  down: boolean
}

export function getVerticalOverflowState(
  scrollTop: number,
  clientHeight: number,
  scrollHeight: number,
): VerticalOverflowState {
  const maxScrollTop = Math.max(0, scrollHeight - clientHeight)
  const hasOverflow = maxScrollTop > OVERFLOW_TOLERANCE_PX

  return {
    up: hasOverflow && scrollTop > OVERFLOW_TOLERANCE_PX,
    down: hasOverflow && scrollTop < maxScrollTop - OVERFLOW_TOLERANCE_PX,
  }
}

export function verticalOverflowMask({ up, down }: VerticalOverflowState): string {
  if (up && down) {
    return `linear-gradient(to bottom, transparent, black ${FADE_HEIGHT}, black calc(100% - ${FADE_HEIGHT}), transparent)`
  }
  if (up) return `linear-gradient(to bottom, transparent, black ${FADE_HEIGHT})`
  if (down) {
    return `linear-gradient(to bottom, black calc(100% - ${FADE_HEIGHT}), transparent)`
  }
  return 'none'
}

export function useVerticalOverflow() {
  const containerRef = ref<HTMLElement | null>(null)
  const canScrollUp = ref(false)
  const canScrollDown = ref(false)

  let resizeObserver: ResizeObserver | undefined
  let mutationObserver: MutationObserver | undefined

  const maskStyle = computed<CSSProperties>(() => {
    const maskImage = verticalOverflowMask({
      up: canScrollUp.value,
      down: canScrollDown.value,
    })

    return {
      maskImage,
      WebkitMaskImage: maskImage,
    }
  })

  function updateOverflow() {
    const element = containerRef.value
    if (!element) return

    const state = getVerticalOverflowState(
      element.scrollTop,
      element.clientHeight,
      element.scrollHeight,
    )
    canScrollUp.value = state.up
    canScrollDown.value = state.down
  }

  function scheduleOverflowUpdate() {
    requestAnimationFrame(updateOverflow)
  }

  function scroll(direction: 'up' | 'down') {
    const element = containerRef.value
    if (!element) return

    element.scrollBy({
      top: (direction === 'up' ? -1 : 1) * Math.max(32, element.clientHeight * 0.75),
      behavior: 'smooth',
    })
  }

  function observeCurrentChildren() {
    const element = containerRef.value
    if (!element || !resizeObserver) return

    resizeObserver.disconnect()
    resizeObserver.observe(element)
    for (const child of element.children) resizeObserver.observe(child)
  }

  onMounted(() => {
    const element = containerRef.value
    if (!element) return

    element.addEventListener('scroll', updateOverflow, { passive: true })
    window.addEventListener('resize', scheduleOverflowUpdate)

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(scheduleOverflowUpdate)
      observeCurrentChildren()
    }

    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        observeCurrentChildren()
        updateOverflow()
      })
      mutationObserver.observe(element, {
        childList: true,
        subtree: true,
      })
    }

    updateOverflow()
    requestAnimationFrame(scheduleOverflowUpdate)
    void document.fonts?.ready.then(scheduleOverflowUpdate)
  })

  onBeforeUnmount(() => {
    containerRef.value?.removeEventListener('scroll', updateOverflow)
    window.removeEventListener('resize', scheduleOverflowUpdate)
    resizeObserver?.disconnect()
    mutationObserver?.disconnect()
  })

  return {
    containerRef,
    canScrollUp,
    canScrollDown,
    maskStyle,
    scroll,
    updateOverflow,
  }
}
