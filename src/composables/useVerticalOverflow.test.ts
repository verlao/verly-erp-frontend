import { describe, expect, it } from 'vitest'
import {
  getVerticalOverflowState,
  verticalOverflowMask,
} from './useVerticalOverflow'

describe('vertical overflow affordance', () => {
  it('does not show a fade when all navigation items fit', () => {
    const state = getVerticalOverflowState(0, 336, 320)

    expect(state).toEqual({ up: false, down: false })
    expect(verticalOverflowMask(state)).toBe('none')
  })

  it('signals that more destinations exist below the fold', () => {
    const state = getVerticalOverflowState(0, 240, 320)

    expect(state).toEqual({ up: false, down: true })
    expect(verticalOverflowMask(state)).toContain('calc(100% - 2rem)')
  })

  it('signals both directions while the navigation is between its limits', () => {
    const state = getVerticalOverflowState(40, 240, 320)
    const mask = verticalOverflowMask(state)

    expect(state).toEqual({ up: true, down: true })
    expect(mask).toContain('transparent, black 2rem')
    expect(mask).toContain('calc(100% - 2rem), transparent')
  })

  it('signals only the destinations above at the end', () => {
    const state = getVerticalOverflowState(80, 240, 320)

    expect(state).toEqual({ up: true, down: false })
    expect(verticalOverflowMask(state)).toBe(
      'linear-gradient(to bottom, transparent, black 2rem)',
    )
  })

  it('ignores subpixel rounding at either edge', () => {
    expect(getVerticalOverflowState(0.5, 240, 320)).toEqual({
      up: false,
      down: true,
    })
    expect(getVerticalOverflowState(79.5, 240, 320)).toEqual({
      up: true,
      down: false,
    })
  })
})
