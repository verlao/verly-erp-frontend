import api from './api'

// Espelha application/enums/PixReconciliationState.java
export type PixReconciliationState = 'UNMEASURED' | 'NEEDS_REVIEW' | 'READY' | 'BRIDGED'

// Espelha application/enums/PixReconciliationBlock.java
export type PixReconciliationBlock =
  | 'NONE'
  | 'MISSING_DIRECTION'
  | 'MISSING_AMOUNT'
  | 'MISSING_DIRECTION_AND_AMOUNT'
  | 'DUPLICATE_SUSPECT'

// Espelha application/dto/PixReconciliationRowDTO.java.
// amount/direction chegam null quando o extrator não produziu o dado (nunca 0 por default).
// amount é BigDecimal no backend, em reais: a UI converte para centavos inteiros na borda (src/lib/money.ts, PR #58).
export interface PixReconciliationRowDTO {
  receiptId: number
  sourceExtractionId: string | null
  movementDate: string | null
  amount: number | null
  direction: string | null
  directionBasis: string | null
  directionConfidence: number | null
  counterpartyType: string | null
  counterpartyPhone: string | null
  partnerId: number | null
  partnerName: string | null
  partnerType: string | null
  siblingCount: number
  state: PixReconciliationState
  blockReason: PixReconciliationBlock
  ledgerId: number | null
  // Estado CONTÁBIL do lançamento (PENDING / POSTED / REVERSED), diferente de `state`.
  ledgerStatus: string | null
  // Conta de DESPESA escolhida à mão para uma SAÍDA (não é "de quem é").
  accountCodeOverride: string | null
  overriddenBy: string | null
  overrideReason: string | null
  amountAtBridge: number | null
  directionAtBridge: string | null
  accountCodeAtBridge: string | null
  bridgedBy: string | null
}

// Espelha application/dto/PixReconciliationReportDTO.java
export interface PixReconciliationReportDTO {
  startDate: string | null
  endDate: string | null
  countsByState: Record<PixReconciliationState, number>
  readyToBridge: number
  unmeasured: number
  total: number
  receipts: PixReconciliationRowDTO[]
}

export interface PixReconciliationListParams {
  state?: PixReconciliationState
  limit?: number
}

// Espelha application/dto/BridgePixReceiptDTO.java
export interface BridgePixReceiptDTO {
  createdBy: string
  acknowledgeDuplicate?: boolean
  // Obrigatória na prática quando acknowledgeDuplicate = true.
  note?: string
}

// Espelha application/dto/OverridePixClassificationDTO.java.
// accountCode é a conta de despesa de uma SAÍDA; null/vazio limpa a correção.
export interface OverridePixClassificationDTO {
  accountCode?: string | null
  reason: string
  overriddenBy: string
}

const pixReconciliationService = {
  list: async (params?: PixReconciliationListParams): Promise<PixReconciliationReportDTO> => {
    const query = new URLSearchParams()
    if (params?.state) query.append('state', params.state)
    if (params?.limit !== undefined) query.append('limit', params.limit.toString())
    const qs = query.toString()
    const response = await api.get(`/pix-reconciliation${qs ? `?${qs}` : ''}`)
    return response.data
  },

  get: async (receiptId: number): Promise<PixReconciliationRowDTO> => {
    const response = await api.get(`/pix-reconciliation/${receiptId}`)
    return response.data
  },

  // Cria o lançamento PENDING (não posta). 409 = comprovante não medido ou duplicata não reconhecida.
  bridge: async (
    receiptId: number,
    dto: BridgePixReceiptDTO
  ): Promise<PixReconciliationRowDTO> => {
    const response = await api.post(`/pix-reconciliation/${receiptId}/bridge`, dto)
    return response.data
  },

  // Corrige a conta de despesa de uma saída. Não cria nem posta lançamento.
  overrideClassification: async (
    receiptId: number,
    dto: OverridePixClassificationDTO
  ): Promise<PixReconciliationRowDTO> => {
    const response = await api.post(`/pix-reconciliation/${receiptId}/classification`, dto)
    return response.data
  },
}

export default pixReconciliationService
