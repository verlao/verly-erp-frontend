import { beforeEach, describe, expect, it, vi } from 'vitest'
import leadService, { type LeadDTO } from './lead'
import quoteService from './quote'
import { confirmLeadExtraction } from './extractionConfirmation'

vi.mock('./lead', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./lead')>()
  return {
    ...actual,
    default: {
      ...actual.default,
      getFreshById: vi.fn(),
    },
  }
})

vi.mock('./quote', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./quote')>()
  return {
    ...actual,
    default: {
      ...actual.default,
      createFromLead: vi.fn(),
    },
  }
})

const payload = {
  leadId: 42,
  items: [{
    type: 'PORTA',
    category: 'VIDRO_TEMPERADO',
    color: 'INCOLOR',
    sheets: 1,
    width: 80,
    height: 210,
    quantity: 13,
  }],
}

const confirmedLead: LeadDTO = {
  id: 42,
  name: 'Maria',
  phone: '21999990000',
  email: '',
  description: 'Porta',
  city: 'Rio de Janeiro',
  neighborhood: 'Centro',
  data: '{}',
  createdDate: '2026-09-02T18:00:00Z',
  extractionConfirmedAt: '2026-09-02T22:00:00',
  items: [{ productType: 'PORTA', quantity: 13, estimatedValue: 3250 }],
  totalEstimatedValue: 3250,
  tier: '$$$',
}

describe('confirmLeadExtraction', () => {
  beforeEach(() => {
    vi.mocked(quoteService.createFromLead).mockReset()
    vi.mocked(leadService.getFreshById).mockReset()
  })

  it('uses the deployed confirmation command and returns only server-confirmed lead data', async () => {
    vi.mocked(quoteService.createFromLead).mockResolvedValue({ id: 99 })
    vi.mocked(leadService.getFreshById).mockResolvedValue(confirmedLead)

    await expect(confirmLeadExtraction(payload)).resolves.toEqual({
      quote: { id: 99 },
      lead: confirmedLead,
    })
    expect(quoteService.createFromLead).toHaveBeenCalledWith(payload)
    expect(leadService.getFreshById).toHaveBeenCalledWith(42)
  })

  it('does not read or expose a confirmed lead when the save is rejected', async () => {
    vi.mocked(quoteService.createFromLead).mockRejectedValue(new Error('API recusou'))

    await expect(confirmLeadExtraction(payload)).rejects.toThrow('API recusou')
    expect(leadService.getFreshById).not.toHaveBeenCalled()
  })

  it('rejects success when the fresh server response has no confirmation timestamp', async () => {
    vi.mocked(quoteService.createFromLead).mockResolvedValue({ id: 99 })
    vi.mocked(leadService.getFreshById).mockResolvedValue({
      ...confirmedLead,
      extractionConfirmedAt: null,
    })

    await expect(confirmLeadExtraction(payload)).rejects.toThrow(
      'A API não confirmou a atualização do lead',
    )
  })
})
