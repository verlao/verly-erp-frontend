import { describe, expect, it } from 'vitest'
import { pipelineTotal } from './leadPipeline'

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
