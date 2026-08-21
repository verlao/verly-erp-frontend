import api, { apiUrl } from './api'
import type { PaginationParams } from './order'

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST'
export type LeadPriority = 'HIGH' | 'MEDIUM' | 'LOW'
export type LeadTier = '$' | '$$' | '$$$'

export interface LeadItemDTO {
  id?: number
  productType?: string
  widthCm?: number
  heightCm?: number
  sheets?: number
  color?: string
  quantity: number
  estimatedValue?: number
  estimatedProfit?: number

  // Medição/variantes (paralelo ao backend) — ausentes em itens antigos.
  pendingMeasurement?: boolean
  // Itens com o mesmo variantGroup são alternativas A/B que o cliente pediu
  // pra comparar; só a variantSelected deve entrar no total/orçamento.
  variantGroup?: string | null
  variantSelected?: boolean
}

export interface LeadDTO {
  id: number
  name: string
  phone: string
  email: string
  description: string
  city: string
  neighborhood: string
  data: string
  createdDate: string
  // V2_37: último create OU re-síntese do bot; ancora o bloco "Novos hoje" do inbox.
  lastActivityDate?: string
  userAgent?: string
  latitude?: string
  longitude?: string
  screenWidth?: string
  screenHeight?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  referrer?: string
  submissionDate?: string
  deviceType?: string
  consent?: boolean
  status?: LeadStatus
  isRead?: boolean
  priority?: LeadPriority
  tags?: string[]
  lastContactDate?: string
  assignedTo?: string
  notes?: string[]

  // V2_17 backend additions
  items?: LeadItemDTO[]
  totalEstimatedValue?: number
  totalEstimatedProfit?: number
  tier?: LeadTier
  sourceExtractionId?: number
  source?: string

  // Suggested next-best-question (deterministic ladder, computed on the backend).
  // suggestedReply is null when nothing essential is missing.
  suggestedReply?: string | null
  missingFields?: string[]

  // V2_28: medição/visita técnica
  measurementStatus?: MeasurementStatus
  measurementDate?: string

  // V2_31: cliente afirmou pagamento por texto mas o comprovante ainda não chegou.
  paymentAwaitingReceipt?: boolean
}

export type MeasurementStatus = 'NONE' | 'NEEDED' | 'SCHEDULED' | 'DONE'

/** Per-status monetary SUM. Same keys as the count fields. */
export interface LeadStatusTotals {
  all: number
  new: number
  contacted: number
  qualified: number
  converted: number
  lost: number
}

/**
 * Nested `partners` segment on GET /leads/counts — counterparties already
 * excluded from the top-level sales keys (suppliers and the installer).
 * Optional end-to-end so a stale cached client cannot NaN the strip.
 */
export interface LeadPartnerCounts {
  all?: number
  new?: number
  contacted?: number
  qualified?: number
  converted?: number
  lost?: number
  totals?: LeadStatusTotals
  measuredTotals?: LeadStatusTotals
}

/**
 * GET /leads/counts.
 * `totals`, `measuredTotals`, and `partners` are optional so a stale cached
 * client or local backend cannot NaN the stat.
 *
 * Top-level keys already exclude partner-linked leads; those live under
 * `partners`. `measuredTotals` is items with both width and height;
 * `totals` includes unmeasured placeholders.
 */
export interface LeadCounts {
  all: number
  new: number
  contacted: number
  qualified: number
  converted: number
  lost: number
  totals?: LeadStatusTotals
  measuredTotals?: LeadStatusTotals
  partners?: LeadPartnerCounts
}

// Leads colapsados por contato (telefone) + funil, tudo resolvido no backend.
export interface LeadContactDTO {
  phone: string
  name: string
  leadCount: number
  totalEstimatedValue?: number
  tier?: LeadTier
  latestDate: string
  hasNew: boolean
  openQuotes: number
  closedOrders: number
  leads: LeadDTO[]
}

const leadService = {
  getAll: async (params?: PaginationParams) => {
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
    
    // Se tem parâmetros de paginação, usa o endpoint paginado
    if (params && (params.page !== undefined || params.size !== undefined)) {
      const url = `/leads/paginated?${queryParams.toString()}`
      const response = await api.get(url)
      return response.data
    }
    
    // Senão, usa o endpoint normal para compatibilidade
    const response = await api.get('/leads')
    return response.data
  },
  
  getAllNonPaginated: async () => {
    const response = await api.get('/leads')
    return response.data
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/leads/${id}`)
    return response.data
  },
  
  create: async (lead: LeadDTO) => {
    const response = await api.post('/leads', lead)
    return response.data
  },
  
  update: async (id: number, lead: LeadDTO) => {
    const response = await api.put(`/leads/${id}`, lead)
    return response.data
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/leads/${id}`)
    return response.data
  },

  // Novos métodos para inbox-style
  updateStatus: async (id: number, status: LeadStatus) => {
    const response = await api.patch(`/leads/${id}/status`, { status })
    return response.data
  },

  // fetch + keepalive so the PATCH survives the tab being backgrounded when
  // WhatsApp opens (axios XHR is not guaranteed to complete in that case).
  updateStatusKeepalive: async (id: number, status: LeadStatus) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const token = localStorage.getItem('token')
    if (token) headers.Authorization = `Bearer ${token}`

    const response = await fetch(`${apiUrl}/leads/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
      keepalive: true
    })

    if (!response.ok) {
      throw new Error(`Failed to update lead status (${response.status})`)
    }

    try {
      return await response.json()
    } catch {
      return undefined
    }
  },

  // V2_28: transição de medição (kanban "Precisa medir")
  updateMeasurement: async (id: number, status: MeasurementStatus, date?: string) => {
    const body: Record<string, string> = { status }
    if (date) body.date = date
    const response = await api.patch(`/leads/${id}/measurement`, body)
    return response.data
  },

  markAsRead: async (id: number) => {
    const response = await api.patch(`/leads/${id}/read`, { isRead: true })
    return response.data
  },

  markAsUnread: async (id: number) => {
    const response = await api.patch(`/leads/${id}/read`, { isRead: false })
    return response.data
  },

  convertToCustomer: async (id: number) => {
    const response = await api.post(`/leads/${id}/convert`)
    return response.data
  },

  bulkAction: async (ids: number[], action: string, data?: any) => {
    const response = await api.post('/leads/bulk', { ids, action, data })
    return response.data
  },

  getCounts: async (): Promise<LeadCounts> => {
    const response = await api.get('/leads/counts')
    return response.data
  },

  // Contatos colapsados (agrupados por telefone) + funil — heavy lifting no backend.
  getContacts: async (
    page: number,
    size: number,
    filters?: { status?: string; tier?: string; search?: string }
  ): Promise<PaginatedResponse<LeadContactDTO>> => {
    const qs = new URLSearchParams({ page: String(page), size: String(size) })
    if (filters?.status && filters.status !== 'all') qs.append('status', filters.status)
    if (filters?.tier && filters.tier !== 'all') qs.append('tier', filters.tier)
    if (filters?.search) qs.append('search', filters.search)
    const response = await api.get(`/leads/contacts?${qs.toString()}`)
    return response.data
  }
}

export default leadService