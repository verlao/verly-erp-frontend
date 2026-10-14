import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './api'
import partnerService, { type PartnerIdentifierDTO, type PartnerResolutionDTO } from './partner'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

const identifier: PartnerIdentifierDTO = {
  id: 5,
  partnerId: 3,
  kind: 'CNPJ',
  valueRaw: '12.345.678/0001-90',
  valueNormalized: '12345678000190',
  source: 'MANUAL',
  confidence: null,
  primary: true,
  firstSeen: '2026-10-01T10:00:00',
  lastSeen: null,
  retiredAt: null,
  retiredReason: null,
  sourceRawMessageId: null,
  notes: null,
}

describe('partnerService — identidade', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listIdentifiers omite retirados por padrão', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [identifier] })

    const result = await partnerService.listIdentifiers(3)

    expect(api.get).toHaveBeenCalledWith('/partners/3/identifiers?includeRetired=false')
    expect(result).toEqual([identifier])
  })

  it('listIdentifiers pode pedir os retirados', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })

    await partnerService.listIdentifiers(3, true)

    expect(api.get).toHaveBeenCalledWith('/partners/3/identifiers?includeRetired=true')
  })

  it('addIdentifiers envia o corpo { identifiers } no caminho do parceiro', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: [identifier] })

    const result = await partnerService.addIdentifiers(3, [
      { kind: 'CNPJ', value: '12.345.678/0001-90', source: 'MANUAL', primary: true },
    ])

    expect(api.post).toHaveBeenCalledWith('/partners/3/identifiers', {
      identifiers: [{ kind: 'CNPJ', value: '12.345.678/0001-90', source: 'MANUAL', primary: true }],
    })
    expect(result).toEqual([identifier])
  })

  it('removeIdentifier faz baixa lógica com motivo codificado na query', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: { ...identifier, retiredReason: 'troca de CNPJ' } })

    const result = await partnerService.removeIdentifier(3, 5, 'troca de CNPJ')

    expect(api.delete).toHaveBeenCalledWith('/partners/3/identifiers/5?reason=troca%20de%20CNPJ')
    expect(result.retiredReason).toBe('troca de CNPJ')
  })

  it('removeIdentifier sem motivo não manda query', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: identifier })

    await partnerService.removeIdentifier(3, 5)

    expect(api.delete).toHaveBeenCalledWith('/partners/3/identifiers/5')
  })

  it('resolve aceita 409 (CONFLICT/AMBIGUOUS) e devolve o corpo com os candidatos', async () => {
    const conflict: PartnerResolutionDTO = {
      status: 'CONFLICT',
      partnerId: null,
      candidates: [],
      unknownIdentifiers: [],
      invalidIdentifiers: [],
      explanation: 'Dois parceiros diferentes para os identificadores informados',
    }
    vi.mocked(api.post).mockResolvedValue({ data: conflict })

    const result = await partnerService.resolve([{ kind: 'PHONE', value: '11999990000' }])

    expect(api.post).toHaveBeenCalledWith(
      '/partners/resolve',
      { identifiers: [{ kind: 'PHONE', value: '11999990000' }] },
      expect.objectContaining({ validateStatus: expect.any(Function) })
    )
    expect(result.partnerId).toBeNull()
    expect(result.status).toBe('CONFLICT')
  })

  it('resolve só aceita 200 e 409; outros códigos lançam como de costume', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} })
    await partnerService.resolve([{ kind: 'CPF', value: '52998224725' }])

    const config = vi.mocked(api.post).mock.calls[0][2] as { validateStatus: (s: number) => boolean }
    expect(config.validateStatus(200)).toBe(true)
    expect(config.validateStatus(409)).toBe(true)
    expect(config.validateStatus(400)).toBe(false)
    expect(config.validateStatus(500)).toBe(false)
  })
})

describe('partnerService — financeiro', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('financials sem parâmetros chama GET /partners/financials limpo', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { counterparties: [] } })

    const result = await partnerService.financials()

    expect(api.get).toHaveBeenCalledWith('/partners/financials')
    expect(result).toEqual({ counterparties: [] })
  })

  it('financials envia período e includeUnregistered', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} })

    await partnerService.financials({
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      includeUnregistered: false,
    })

    expect(api.get).toHaveBeenCalledWith(
      '/partners/financials?startDate=2026-10-01&endDate=2026-10-31&includeUnregistered=false'
    )
  })

  it('partnerFinancials chama o extrato do parceiro com período opcional', async () => {
    const statement = {
      summary: { partnerId: 3, entryCount: 0, measuredInflow: null, measuredOutflow: null },
      entries: [],
    }
    vi.mocked(api.get).mockResolvedValue({ data: statement })

    const result = await partnerService.partnerFinancials(3, { startDate: '2026-10-01' })

    expect(api.get).toHaveBeenCalledWith('/partners/3/financials?startDate=2026-10-01')
    // Parceiro sem comprovante: totais nulos, não zero.
    expect(result.summary.measuredInflow).toBeNull()
    expect(result.entries).toEqual([])
  })

  it('partnerFinancials sem período não manda query', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} })

    await partnerService.partnerFinancials(3)

    expect(api.get).toHaveBeenCalledWith('/partners/3/financials')
  })
})
