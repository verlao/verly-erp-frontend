import { describe, expect, it } from 'vitest'
import {
  getHorizontalOverflowState,
  horizontalOverflowMask,
} from './useHorizontalOverflow'

describe('horizontal overflow affordance', () => {
  it('does not show a fade when all content fits', () => {
    const state = getHorizontalOverflowState(0, 800, 800)

    expect(state).toEqual({ left: false, right: false })
    expect(horizontalOverflowMask(state)).toBe('none')
  })

  it('shows only the right fade at the start of an overflowing row', () => {
    const state = getHorizontalOverflowState(0, 600, 900)

    expect(state).toEqual({ left: false, right: true })
    expect(horizontalOverflowMask(state)).toContain('calc(100% - 1.5rem)')
  })

  it('shows fades on both sides while the row is between its limits', () => {
    const state = getHorizontalOverflowState(150, 600, 900)
    const mask = horizontalOverflowMask(state)

    expect(state).toEqual({ left: true, right: true })
    expect(mask).toContain('transparent, black 1.5rem')
    expect(mask).toContain('calc(100% - 1.5rem), transparent')
  })

  it('shows only the left fade at the end of an overflowing row', () => {
    const state = getHorizontalOverflowState(300, 600, 900)

    expect(state).toEqual({ left: true, right: false })
    expect(horizontalOverflowMask(state)).toBe(
      'linear-gradient(to right, transparent, black 1.5rem)',
    )
  })

  it('ignores subpixel rounding at either edge', () => {
    expect(getHorizontalOverflowState(0.5, 600, 900)).toEqual({
      left: false,
      right: true,
    })
    expect(getHorizontalOverflowState(299.5, 600, 900)).toEqual({
      left: true,
      right: false,
    })
  })
})
