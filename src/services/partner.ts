import api from './api'
import type { PaginationParams } from './order'
import type { PaginatedResponse } from './lead'

export type PartnerType = 'SUPPLIER' | 'SERVICE_PROVIDER'

// Labels de exibição (pt-BR) por tipo de parceiro.
export const partnerTypeLabels: Record<PartnerType, string> = {
  SUPPLIER: 'Fornecedor',
  SERVICE_PROVIDER: 'Mão de obra',
}

export interface PartnerDTO {
  id: number
  type: PartnerType
  name: string
  phone?: string
  cnpj?: string
  defaulter?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface PartnerQueryParams extends PaginationParams {
  type?: PartnerType
}


// Identidade de contraparte (espelha application/dto/PartnerIdentifier*DTO.java).
export type PartnerIdentifierKind = 'PHONE' | 'CPF' | 'CNPJ' | 'PIX_KEY' | 'LEGAL_NAME' | 'ALIAS'
export type PartnerIdentifierSource = 'MANUAL' | 'OWNER_COMMAND' | 'OCR_RECEIPT' | 'CONVERSATION'
export type PartnerResolutionStatus = 'MATCH' | 'MATCH_WEAK' | 'AMBIGUOUS' | 'CONFLICT' | 'NO_MATCH'

export interface PartnerIdentifierDTO {
  id: number
  partnerId: number
  kind: PartnerIdentifierKind
  valueRaw: string
  valueNormalized: string
  source: PartnerIdentifierSource
  confidence: number | null
  primary: boolean | null
  firstSeen: string | null
  lastSeen: string | null
  retiredAt: string | null
  retiredReason: string | null
  sourceRawMessageId: number | null
  notes: string | null
}

// Um identificador afirmado por quem chama (com máscara, como apareceu).
export interface PartnerIdentifierInputDTO {
  kind: PartnerIdentifierKind
  value: string
  source: PartnerIdentifierSource
  confidence?: number
  primary?: boolean
  sourceRawMessageId?: number
  notes?: string
}

// Um identificador oferecido para resolução (leitura pura, sem source/confidence).
export interface PartnerIdentifierProbeDTO {
  kind: PartnerIdentifierKind
  value: string
}

export interface PartnerResolutionCandidateDTO {
  partnerId: number
  name: string | null
  legalName: string | null
  displayName: string | null
  strong: boolean | null
  matchedBy: PartnerIdentifierDTO[]
}

export interface PartnerResolutionDTO {
  status: PartnerResolutionStatus
  // Null em CONFLICT e AMBIGUOUS, por desenho.
  partnerId: number | null
  candidates: PartnerResolutionCandidateDTO[]
  unknownIdentifiers: PartnerIdentifierProbeDTO[]
  invalidIdentifiers: PartnerIdentifierProbeDTO[]
  explanation: string | null
}

// Espelha PartnerFinancialsDTO. Somas medidas são null (não zero) quando nada foi medido.
// Valores em dinheiro são BigDecimal em reais: a UI converte para centavos inteiros na borda (src/lib/money.ts, PR #58).
export interface PartnerFinancialsDTO {
  partnerId: number | null
  partnerName: string | null
  partnerType: string | null
  counterpartyPhone: string | null
  counterpartyType: string | null
  partnerMatchCount: number
  entryCount: number
  measuredInflow: number | null
  measuredOutflow: number | null
  measuredBalance: number | null
  measuredInflowCount: number
  measuredOutflowCount: number
  unmeasuredCount: number
  unclassifiedCount: number
  withoutAmountCount: number
  complete: boolean
  lastMovementDate: string | null
}

export interface PartnerFinancialsEntryDTO {
  receiptId: number
  movementDate: string | null
  amount: number | null
  direction: string | null
  directionBasis: string | null
  directionConfidence: number | null
  counterpartyType: string | null
  directionKnown: boolean
}

export interface PartnerFinancialsStatementDTO {
  summary: PartnerFinancialsDTO
  entries: PartnerFinancialsEntryDTO[]
}

export interface PartnerFinancialsReportDTO {
  startDate: string | null
  endDate: string | null
  counterparties: PartnerFinancialsDTO[]
  totals: {
    counterpartyCount: number
    registeredCount: number
    unregisteredCount: number
    ambiguousCount: number
    entryCount: number
    measuredInflow: number | null
    measuredOutflow: number | null
    measuredBalance: number | null
    measuredInflowCount: number
    measuredOutflowCount: number
    unmeasuredCount: number
    unclassifiedCount: number
    withoutAmountCount: number
    complete: boolean
  }
}

export interface PartnerFinancialsParams {
  startDate?: string
  endDate?: string
}

export interface PartnerFinancialsReportParams extends PartnerFinancialsParams {
  includeUnregistered?: boolean
}

// Resolução devolve 409 em CONFLICT/AMBIGUOUS com o MESMO corpo; aceitamos os dois.
const RESOLVE_STATUSES = (status: number) => status === 200 || status === 409

const partnerService = {
  getAllPaginated: async (
    params?: PartnerQueryParams
  ): Promise<PaginatedResponse<PartnerDTO>> => {
    const queryParams = new URLSearchParams()

    if (params?.page !== undefined) {
      queryParams.append('page', params.page.toString())
    }
    if (params?.size !== undefined) {
      queryParams.append('size', params.size.toString())
    }
    if (params?.sort) {
      queryParams.append('sort', params.sort)
    }
    if (params?.type) {
      queryParams.append('type', params.type)
    }

    const response = await api.get(`/partners/paginated?${queryParams.toString()}`)
    return response.data
  },

  listIdentifiers: async (id: number, includeRetired = false): Promise<PartnerIdentifierDTO[]> => {
    const response = await api.get(`/partners/${id}/identifiers?includeRetired=${includeRetired}`)
    return response.data
  },

  // Cadastra N identificadores numa transação. 409 se um identificador forte já tem dono.
  addIdentifiers: async (
    id: number,
    identifiers: PartnerIdentifierInputDTO[]
  ): Promise<PartnerIdentifierDTO[]> => {
    const response = await api.post(`/partners/${id}/identifiers`, { identifiers })
    return response.data
  },

  // Baixa lógica: o identificador fica no histórico com retiredAt.
  removeIdentifier: async (id: number, identifierId: number, reason?: string): Promise<PartnerIdentifierDTO> => {
    const qs = reason ? `?reason=${encodeURIComponent(reason)}` : ''
    const response = await api.delete(`/partners/${id}/identifiers/${identifierId}${qs}`)
    return response.data
  },

  resolve: async (identifiers: PartnerIdentifierProbeDTO[]): Promise<PartnerResolutionDTO> => {
    const response = await api.post(
      '/partners/resolve',
      { identifiers },
      { validateStatus: RESOLVE_STATUSES }
    )
    return response.data
  },

  financials: async (params?: PartnerFinancialsReportParams): Promise<PartnerFinancialsReportDTO> => {
    const query = new URLSearchParams()
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)
    if (params?.includeUnregistered !== undefined) {
      query.append('includeUnregistered', String(params.includeUnregistered))
    }
    const qs = query.toString()
    const response = await api.get(`/partners/financials${qs ? `?${qs}` : ''}`)
    return response.data
  },

  partnerFinancials: async (id: number, params?: PartnerFinancialsParams): Promise<PartnerFinancialsStatementDTO> => {
    const query = new URLSearchParams()
    if (params?.startDate) query.append('startDate', params.startDate)
    if (params?.endDate) query.append('endDate', params.endDate)
    const qs = query.toString()
    const response = await api.get(`/partners/${id}/financials${qs ? `?${qs}` : ''}`)
    return response.data
  },

  remove: async (id: number) => {
    const response = await api.delete(`/partners/${id}`)
    return response.data
  },
}

export default partnerService
