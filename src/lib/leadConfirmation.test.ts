import { describe, expect, it } from 'vitest'
import type { LeadDTO } from '../services/lead'
import {
  preserveConfirmedExtraction,
  reconcileLeadList,
} from './leadConfirmation'

function lead(overrides: Partial<LeadDTO> = {}): LeadDTO {
  return {
    id: 42,
    name: 'Maria',
    phone: '21999990000',
    email: '',
    description: 'Porta',
    city: 'Rio de Janeiro',
    neighborhood: 'Centro',
    data: '{}',
    createdDate: '2026-09-02T18:00:00Z',
    ...overrides,
  }
}

describe('lead confirmation reconciliation', () => {
  it('does not let a late cached response erase corrected items, totals, tier or badge', () => {
    const confirmed = lead({
      extractionConfirmedAt: '2026-09-02T22:00:00',
      items: [{ productType: 'PORTA', quantity: 13 }],
      totalEstimatedValue: 3250,
      totalEstimatedProfit: 1000,
      tier: '$$$',
    })
    const stale = lead({
      description: 'Resumo novo que ainda pode ser aproveitado',
      extractionConfirmedAt: null,
      items: [
        { productType: 'PORTA', quantity: 12 },
        { productType: 'PORTA', quantity: 1 },
      ],
      totalEstimatedValue: 2500,
      tier: '$$',
    })

    expect(preserveConfirmedExtraction(confirmed, stale)).toMatchObject({
      description: 'Resumo novo que ainda pode ser aproveitado',
      extractionConfirmedAt: '2026-09-02T22:00:00',
      items: [{ productType: 'PORTA', quantity: 13 }],
      totalEstimatedValue: 3250,
      totalEstimatedProfit: 1000,
      tier: '$$$',
    })
  })

  it('accepts a newer response when the backend also marks it confirmed', () => {
    const current = lead({
      extractionConfirmedAt: '2026-09-02T22:00:00',
      totalEstimatedValue: 3250,
    })
    const incoming = lead({
      extractionConfirmedAt: '2026-09-02T22:10:00',
      totalEstimatedValue: 4000,
    })

    expect(preserveConfirmedExtraction(current, incoming)).toBe(incoming)
  })

  it('reconciles list refreshes by lead id', () => {
    const confirmed = lead({ extractionConfirmedAt: '2026-09-02T22:00:00' })
    const other = lead({ id: 7, name: 'João' })

    expect(reconcileLeadList([confirmed], [lead(), other])).toEqual([
      confirmed,
      other,
    ])
  })
})
