import { computed, onBeforeUnmount, onMounted, ref, type CSSProperties } from 'vue'

const OVERFLOW_TOLERANCE_PX = 1
const FADE_WIDTH = '1.5rem'

export interface HorizontalOverflowState {
  left: boolean
  right: boolean
}

export function getHorizontalOverflowState(
  scrollLeft: number,
  clientWidth: number,
  scrollWidth: number,
): HorizontalOverflowState {
  const maxScrollLeft = Math.max(0, scrollWidth - clientWidth)
  const hasOverflow = maxScrollLeft > OVERFLOW_TOLERANCE_PX

  return {
    left: hasOverflow && scrollLeft > OVERFLOW_TOLERANCE_PX,
    right: hasOverflow && scrollLeft < maxScrollLeft - OVERFLOW_TOLERANCE_PX,
  }
}

export function horizontalOverflowMask({ left, right }: HorizontalOverflowState): string {
  if (left && right) {
    return `linear-gradient(to right, transparent, black ${FADE_WIDTH}, black calc(100% - ${FADE_WIDTH}), transparent)`
  }
  if (left) return `linear-gradient(to right, transparent, black ${FADE_WIDTH})`
  if (right) {
    return `linear-gradient(to right, black calc(100% - ${FADE_WIDTH}), transparent)`
  }
  return 'none'
}

export function useHorizontalOverflow() {
  const containerRef = ref<HTMLElement | null>(null)
  const canScrollLeft = ref(false)
  const canScrollRight = ref(false)

  let resizeObserver: ResizeObserver | undefined
  let mutationObserver: MutationObserver | undefined

  const maskStyle = computed<CSSProperties>(() => {
    const maskImage = horizontalOverflowMask({
      left: canScrollLeft.value,
      right: canScrollRight.value,
    })

    return {
      maskImage,
      WebkitMaskImage: maskImage,
    }
  })

  function updateOverflow() {
    const element = containerRef.value
    if (!element) return

    const state = getHorizontalOverflowState(
      element.scrollLeft,
      element.clientWidth,
      element.scrollWidth,
    )
    canScrollLeft.value = state.left
    canScrollRight.value = state.right
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

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateOverflow)
      observeCurrentChildren()
    }

    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        observeCurrentChildren()
        updateOverflow()
      })
      mutationObserver.observe(element, {
        childList: true,
        characterData: true,
        subtree: true,
      })
    }

    updateOverflow()
    void document.fonts?.ready.then(updateOverflow)
  })

  onBeforeUnmount(() => {
    containerRef.value?.removeEventListener('scroll', updateOverflow)
    resizeObserver?.disconnect()
    mutationObserver?.disconnect()
  })

  return {
    containerRef,
    canScrollLeft,
    canScrollRight,
    maskStyle,
    updateOverflow,
  }
}
