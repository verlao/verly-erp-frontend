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
  orderId?: number
  customerId?: number
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

  recordPayment: async (orderId: number, customerId: number, amount: number, paymentMethod: string, receivedBy: string): Promise<LedgerResponseDTO> => {
    const response = await api.post('/ledgers/payment', null, {
      params: { orderId, customerId, amount, paymentMethod, receivedBy }
    })
    return response.data
  },

  recordExpense: async (description: string, amount: number, expenseAccount: string, paymentAccount: string, createdBy: string): Promise<LedgerResponseDTO> => {
    const response = await api.post('/ledgers/expense', null, {
      params: { description, amount, expenseAccount, paymentAccount, createdBy }
    })
    return response.data
  }
}

export default ledgerService
