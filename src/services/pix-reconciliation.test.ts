import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './api'
import pixReconciliationService, { type PixReconciliationRowDTO } from './pix-reconciliation'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

const row: PixReconciliationRowDTO = {
  receiptId: 12,
  sourceExtractionId: 'ext-demo-12',
  movementDate: '2026-10-01',
  amount: 150,
  direction: 'OUT',
  directionBasis: 'text',
  directionConfidence: 0.9,
  counterpartyType: 'PJ',
  counterpartyPhone: null,
  partnerId: null,
  partnerName: null,
  partnerType: null,
  siblingCount: 1,
  state: 'READY',
  blockReason: 'NONE',
  ledgerId: null,
  ledgerStatus: null,
  accountCodeOverride: null,
  overriddenBy: null,
  overrideReason: null,
  amountAtBridge: null,
  directionAtBridge: null,
  accountCodeAtBridge: null,
  bridgedBy: null,
}

describe('pixReconciliationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('list sem filtros chama GET /pix-reconciliation sem query string', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { total: 0, receipts: [] } })

    const result = await pixReconciliationService.list()

    expect(api.get).toHaveBeenCalledWith('/pix-reconciliation')
    expect(result).toEqual({ total: 0, receipts: [] })
  })

  it('list envia state e limit como query params', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} })

    await pixReconciliationService.list({ state: 'NEEDS_REVIEW', limit: 50 })

    expect(api.get).toHaveBeenCalledWith('/pix-reconciliation?state=NEEDS_REVIEW&limit=50')
  })

  it('get busca um comprovante pelo id', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: row })

    const result = await pixReconciliationService.get(12)

    expect(api.get).toHaveBeenCalledWith('/pix-reconciliation/12')
    expect(result).toEqual(row)
  })

  it('bridge posta createdBy, acknowledgeDuplicate e note no caminho /bridge', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { ...row, ledgerId: 77, state: 'BRIDGED' } })

    const result = await pixReconciliationService.bridge(12, {
      createdBy: 'Ana Teste',
      acknowledgeDuplicate: true,
      note: 'Dois pagamentos reais do mesmo fornecedor',
    })

    expect(api.post).toHaveBeenCalledWith('/pix-reconciliation/12/bridge', {
      createdBy: 'Ana Teste',
      acknowledgeDuplicate: true,
      note: 'Dois pagamentos reais do mesmo fornecedor',
    })
    expect(result.ledgerId).toBe(77)
  })

  it('bridge preserva os vínculos opcionais de pedido e cliente no contrato novo', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { ...row, state: 'BRIDGED', ledgerId: 77 } })

    await pixReconciliationService.bridge(12, {
      createdBy: 'Ana Teste',
      orderId: 31,
      customerId: 42,
    })

    expect(api.post).toHaveBeenCalledWith('/pix-reconciliation/12/bridge', {
      createdBy: 'Ana Teste',
      orderId: 31,
      customerId: 42,
    })
  })

  it('mantém estado DISMISSED e auditoria recebida, inclusive campos nulos', async () => {
    const dismissedRow: PixReconciliationRowDTO = {
      ...row,
      state: 'DISMISSED',
      dismissedAt: '2026-10-14T15:00:00',
      dismissedBy: 'Ana Teste',
      dismissedReason: null,
    }
    vi.mocked(api.get).mockResolvedValue({ data: dismissedRow })

    const result = await pixReconciliationService.get(12)

    expect(result).toEqual(dismissedRow)
    expect(result.dismissedReason).toBeNull()
  })

  it('dismiss posta autor e motivo e retorna o DTO do comprovante', async () => {
    const dismissedRow: PixReconciliationRowDTO = {
      ...row,
      state: 'DISMISSED',
      dismissedAt: '2026-10-14T15:00:00',
      dismissedBy: 'Ana Teste',
      dismissedReason: 'Não é pagamento',
    }
    vi.mocked(api.post).mockResolvedValue({ data: dismissedRow })

    const result = await pixReconciliationService.dismiss(12, {
      dismissedBy: 'Ana Teste',
      reason: 'Não é pagamento',
    })

    expect(api.post).toHaveBeenCalledWith('/pix-reconciliation/12/dismiss', {
      dismissedBy: 'Ana Teste',
      reason: 'Não é pagamento',
    })
    expect(result).toEqual(dismissedRow)
  })

  it('undoDismiss usa DELETE e retorna o DTO restaurado', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: row })

    const result = await pixReconciliationService.undoDismiss(12)

    expect(api.delete).toHaveBeenCalledWith('/pix-reconciliation/12/dismiss')
    expect(result).toEqual(row)
  })

  it.each([404, 409])('propaga resposta HTTP %s do dismiss sem mascarar o erro', async (status) => {
    const error = { response: { status } }
    vi.mocked(api.post).mockRejectedValue(error)

    await expect(pixReconciliationService.dismiss(12, { dismissedBy: 'Ana Teste' })).rejects.toBe(error)
  })

  it('overrideClassification envia accountCode, reason e overriddenBy na rota /classification', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { ...row, accountCodeOverride: 'MATERIAL' } })

    const result = await pixReconciliationService.overrideClassification(12, {
      accountCode: 'MATERIAL',
      reason: 'Compra de vidro para obra',
      overriddenBy: 'Bruno Exemplo',
    })

    expect(api.post).toHaveBeenCalledWith('/pix-reconciliation/12/classification', {
      accountCode: 'MATERIAL',
      reason: 'Compra de vidro para obra',
      overriddenBy: 'Bruno Exemplo',
    })
    expect(result.accountCodeOverride).toBe('MATERIAL')
  })

  it('overrideClassification aceita accountCode nulo para limpar a correção', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: row })

    await pixReconciliationService.overrideClassification(12, {
      accountCode: null,
      reason: 'Voltar à regra derivada',
      overriddenBy: 'Bruno Exemplo',
    })

    expect(api.post).toHaveBeenCalledWith(
      '/pix-reconciliation/12/classification',
      expect.objectContaining({ accountCode: null })
    )
  })
})
