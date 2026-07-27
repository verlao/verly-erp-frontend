import api from './api'

export interface EntryLineDTO {
  accountCode: string
  entryType: 'DEBIT' | 'CREDIT'
  amount: number
  description: string
}

export interface CreateLedgerDTO {
  entryDate: string // ISO date format
  description: string
  documentType: string
  documentNumber?: string
  orderId?: number
  customerId?: number
  notes?: string
  entries: EntryLineDTO[]
  createdBy: string
}

export interface LedgerEntryResponse {
  id: number
  lineNumber: number
  accountCode: string
  accountName: string
  entryType: string
  amount: number
  description: string
}

export interface LedgerResponseDTO {
  id: number
  transactionId: string
  entryDate: string
  description: string
  documentType: string
  documentNumber?: string
  paymentMethod?: string
  orderId?: number
  customerId?: number
  customerName?: string
  orderReference?: string
  leadId?: number
  source?: 'WHATSAPP' | string
  totalAmount: number
  status: 'PENDING' | 'POSTED' | 'REVERSED' | 'CANCELLED'
  reversedById?: number
  reversalDate?: string
  reversalReason?: string
  notes?: string
  createdAt: string
  createdBy: string
  entries: LedgerEntryResponse[]
}

export interface ReverseEntryDTO {
  reason: string
  createdBy: string
}

export interface LedgerSummaryDTO {
  totalRevenue: number
  totalExpenses: number
  balance: number
  count: number
  pixIn: number
  pixOut: number
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

const ledgerService = {
  getAll: async (): Promise<LedgerResponseDTO[]> => {
    const response = await api.get('/ledgers')
    return response.data
  },

  getById: async (id: number): Promise<LedgerResponseDTO> => {
    const response = await api.get(`/ledgers/${id}`)
    return response.data
  },

  getByTransactionId: async (transactionId: string): Promise<LedgerResponseDTO> => {
    const response = await api.get(`/ledgers/transaction/${transactionId}`)
    return response.data
  },

  getByOrderId: async (orderId: number): Promise<LedgerResponseDTO[]> => {
    const response = await api.get(`/ledgers/order/${orderId}`)
    return response.data
  },

  getByDateRange: async (startDate: string, endDate: string): Promise<LedgerResponseDTO[]> => {
    const response = await api.get(`/ledgers/period?startDate=${startDate}&endDate=${endDate}`)
    return response.data
  },

  getAccountBalance: async (accountId: number): Promise<number> => {
    const response = await api.get(`/ledgers/accounts/${accountId}/balance`)
    return response.data
  },

  getAccountBalanceForPeriod: async (accountId: number, startDate: string, endDate: string): Promise<number> => {
    const response = await api.get(`/ledgers/accounts/${accountId}/balance/period?startDate=${startDate}&endDate=${endDate}`)
    return response.data
  },

  create: async (ledger: CreateLedgerDTO): Promise<LedgerResponseDTO> => {
    const response = await api.post('/ledgers', ledger)
    return response.data
  },

  post: async (id: number): Promise<LedgerResponseDTO> => {
    const response = await api.post(`/ledgers/${id}/post`)
    return response.data
  },

  reverse: async (id: number, dto: ReverseEntryDTO): Promise<LedgerResponseDTO> => {
    const response = await api.post(`/ledgers/${id}/reverse`, dto)
    return response.data
  },

  cancel: async (id: number): Promise<void> => {
    await api.post(`/ledgers/${id}/cancel`)
  },

  /**
   * Lançamentos PENDING por origem (ex.: WHATSAPP). Fallback: se o backend ainda
   * não expõe /ledgers/pending (404), filtra client-side os últimos 30 dias.
   */
  getPendingBySource: async (source: string): Promise<LedgerResponseDTO[]> => {
    try {
      const response = await api.get(`/ledgers/pending?source=${encodeURIComponent(source)}`)
      return response.data
    } catch (e: any) {
      if (e?.response?.status !== 404) throw e
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 30)
      const iso = (d: Date) => d.toISOString().slice(0, 10)
      const all = await ledgerService.getByDateRange(iso(start), iso(end))
      return all.filter(l => l.status === 'PENDING' && l.source === source)
    }
  },

  getSummary: async (startDate: string, endDate: string): Promise<LedgerSummaryDTO> => {
    const response = await api.get(`/ledgers/summary?startDate=${startDate}&endDate=${endDate}`)
    return response.data
  },

  getByDateRangePaginated: async (startDate: string, endDate: string, page: number, size: number): Promise<PaginatedResponse<LedgerResponseDTO>> => {
    const response = await api.get(`/ledgers/period/paginated?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}&sort=entryDate,desc`)
    return response.data
  },

  recordPayment: async (data: { amount: number, paymentMethod: string, receivedBy: string, customerName?: string, orderReference?: string, orderId?: number | null, customerId?: number | null }): Promise<LedgerResponseDTO> => {
    const body: Record<string, any> = { amount: data.amount, paymentMethod: data.paymentMethod, receivedBy: data.receivedBy }
    if (data.orderId) body.orderId = data.orderId
    if (data.customerId) body.customerId = data.customerId
    if (data.customerName) body.customerName = data.customerName
    if (data.orderReference) body.orderReference = data.orderReference
    const response = await api.post('/ledgers/payment', body)
    return response.data
  },

  recordExpense: async (description: string, amount: number, expenseAccount: string, paymentAccount: string, createdBy: string): Promise<LedgerResponseDTO> => {
    const response = await api.post('/ledgers/expense', { description, amount, expenseAccount, paymentAccount, createdBy })
    return response.data
  }
}

export default ledgerService
