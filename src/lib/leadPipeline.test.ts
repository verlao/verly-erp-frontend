import { describe, expect, it } from 'vitest'
import { pipelineTotal, selectPipeline } from './leadPipeline'

describe('pipelineTotal', () => {
  it('sums non-terminal statuses when totals are present', () => {
    expect(
      pipelineTotal({
        all: 72034.88,
        new: 71706.68,
        contacted: 0,
        qualified: 328.2,
        converted: 0,
        lost: 0
      })
    ).toBeCloseTo(72034.88)
  })

  it('returns null when totals are absent so the caller can fall back', () => {
    expect(pipelineTotal(undefined)).toBeNull()
    expect(pipelineTotal(null)).toBeNull()
  })

  it('treats a missing status as 0', () => {
    expect(
      pipelineTotal({
        all: 100,
        new: 80,
        contacted: 20
        // qualified omitted
      })
    ).toBe(100)
  })

  it('returns 0 when every status is 0', () => {
    expect(
      pipelineTotal({
        all: 0,
        new: 0,
        contacted: 0,
        qualified: 0,
        converted: 0,
        lost: 0
      })
    ).toBe(0)
  })

  it('excludes CONVERTED and LOST even when they have value', () => {
    expect(
      pipelineTotal({
        all: 1500,
        new: 100,
        contacted: 200,
        qualified: 300,
        converted: 400,
        lost: 500
      })
    ).toBe(600)
  })
})

describe('selectPipeline', () => {
  const production = {
    totals: {
      all: 60961.22,
      new: 17470.36,
      contacted: 43490.86,
      qualified: 0,
      converted: 0,
      lost: 0
    },
    measuredTotals: {
      all: 39788.12,
      new: 12263.86,
      contacted: 27524.26,
      qualified: 0,
      converted: 0,
      lost: 0
    },
    partners: {
      all: 14,
      new: 0,
      contacted: 13,
      qualified: 1,
      converted: 0,
      lost: 0,
      totals: {
        all: 12552.79,
        new: 0,
        contacted: 12224.59,
        qualified: 328.2,
        converted: 0,
        lost: 0
      },
      measuredTotals: {
        all: 9428.89,
        new: 0,
        contacted: 9428.89,
        qualified: 0,
        converted: 0,
        lost: 0
      }
    }
  }

  it('uses measuredTotals for the headline when present', () => {
    const picked = selectPipeline(production)
    expect(picked.value).toBeCloseTo(39788.12)
    expect(picked.listed).toBeCloseTo(60961.22)
    expect(picked.unmeasured).toBeCloseTo(21173.1)
    expect(picked.partners).toBeCloseTo(9428.89)
  })

  it('falls back to totals when measuredTotals is absent', () => {
    const picked = selectPipeline({ totals: production.totals })
    expect(picked.value).toBeCloseTo(60961.22)
    expect(picked.listed).toBeCloseTo(60961.22)
    expect(picked.unmeasured).toBeNull()
    expect(picked.partners).toBeNull()
  })

  it('treats a missing status key as 0', () => {
    const picked = selectPipeline({
      measuredTotals: { all: 100, new: 80, contacted: 20 },
      totals: { all: 130, new: 100, contacted: 30 }
    })
    expect(picked.value).toBe(100)
    expect(picked.listed).toBe(130)
    expect(picked.unmeasured).toBe(30)
  })

  it('returns null partners when the partners segment is absent', () => {
    const picked = selectPipeline({
      totals: production.totals,
      measuredTotals: production.measuredTotals
    })
    expect(picked.value).toBeCloseTo(39788.12)
    expect(picked.partners).toBeNull()
  })

  it('returns zeros when every status is 0', () => {
    const zero = {
      all: 0,
      new: 0,
      contacted: 0,
      qualified: 0,
      converted: 0,
      lost: 0
    }
    const picked = selectPipeline({
      totals: zero,
      measuredTotals: zero,
      partners: { totals: zero, measuredTotals: zero }
    })
    expect(picked.value).toBe(0)
    expect(picked.listed).toBe(0)
    expect(picked.unmeasured).toBe(0)
    expect(picked.partners).toBe(0)
  })

  it('falls back to partner totals when partner measuredTotals is absent', () => {
    const picked = selectPipeline({
      measuredTotals: production.measuredTotals,
      partners: { totals: production.partners.totals }
    })
    expect(picked.partners).toBeCloseTo(12552.79)
  })

  it('returns null headline when neither measured nor listed series is present', () => {
    expect(selectPipeline({})).toEqual({
      value: null,
      listed: null,
      unmeasured: null,
      partners: null
    })
    expect(selectPipeline(undefined).value).toBeNull()
  })
})
