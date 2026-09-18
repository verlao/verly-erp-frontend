import { describe, expect, it } from 'vitest'
import { formatFreshness, freshnessBand, freshnessStamp } from './leadFreshness'

// The lead that exposed the bug: created in July, answered on WhatsApp at 16:57 the
// day before, inspected at 01:00. The list rendered it as "15 de jul.".
const answeredYesterday = { createdDate: '2026-07-15T09:12:00', lastActivityDate: '2026-09-17T16:57:29' }
// Created and never touched again.
const neverTouched = { createdDate: '2026-08-14T11:03:00', lastActivityDate: '2026-08-14T11:03:00' }
const inspectedAt1am = new Date('2026-09-18T01:00:00')

describe('freshnessStamp', () => {
  it('prefers activity over birth', () => {
    expect(freshnessStamp(answeredYesterday)).toBe('2026-09-17T16:57:29')
  })

  it('falls back to birth when the lead has no activity', () => {
    expect(freshnessStamp({ createdDate: '2026-07-15T09:12:00' })).toBe('2026-07-15T09:12:00')
  })
})

describe('formatFreshness', () => {
  it('ages a July lead by its WhatsApp reply, not by its birth date', () => {
    expect(formatFreshness(answeredYesterday, inspectedAt1am)).toBe('há 8h')
  })

  it('still shows an absolute date for a lead nobody touched', () => {
    expect(formatFreshness(neverTouched, inspectedAt1am)).toBe('14 de ago.')
  })

  it('clamps a future stamp instead of rendering a negative age', () => {
    const skewed = { createdDate: '2026-09-18T02:00:00', lastActivityDate: '2026-09-18T02:00:00' }
    expect(formatFreshness(skewed, inspectedAt1am)).toBe('agora')
  })

  it('returns empty for a lead with no usable stamp', () => {
    expect(formatFreshness({ createdDate: undefined as unknown as string })).toBe('')
    expect(formatFreshness({ createdDate: 'not-a-date' })).toBe('')
  })
})

describe('freshnessBand', () => {
  it('does not drop yesterday work into the unlabelled remainder at 01:00', () => {
    expect(freshnessBand(answeredYesterday, inspectedAt1am)).toBe('week')
  })

  it('keeps same-day activity in today', () => {
    const answeredToday = { createdDate: '2026-07-15T09:12:00', lastActivityDate: '2026-09-18T00:30:00' }
    expect(freshnessBand(answeredToday, inspectedAt1am)).toBe('today')
  })

  it('bands a lead with no recent activity as older', () => {
    expect(freshnessBand(neverTouched, inspectedAt1am)).toBe('older')
  })

  it('treats an unparseable stamp as older rather than throwing', () => {
    expect(freshnessBand({ createdDate: 'not-a-date' }, inspectedAt1am)).toBe('older')
  })
})
