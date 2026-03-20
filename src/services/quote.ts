import api from './api'

export interface QuoteDTO {
  id?: number
  customerId: number
  products: Record<string, number>  // Map: productId -> quantity
  status?: 'VALID' | 'EXPIRED' | 'CONVERTED' | 'CANCELED'
  expirationDate?: string  // ISO LocalDateTime
  observations?: string
  
  // Campos de resposta (calculados pelo backend)
  totalCost?: number
  totalPrice?: number
  totalProfit?: number
  createdDate?: string
  updateDate?: string
  convertedOrderId?: number
  isExpired?: boolean
  daysUntilExpiration?: number
}

const quoteService = {
  create: async (quote: QuoteDTO) => {
    const response = await api.post('/quotes', quote)
    return response.data
  },

  getAll: async () => {
    const response = await api.get('/quotes')
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/quotes/${id}`)
    return response.data
  },

  getByCustomer: async (customerId: number) => {
    const response = await api.get(`/quotes/customer/${customerId}`)
    return response.data
  },

  getValidQuotes: async () => {
    const response = await api.get('/quotes/valid')
    return response.data
  },

  update: async (id: number, quote: QuoteDTO) => {
    const response = await api.put(`/quotes/${id}`, quote)
    return response.data
  },

  cancel: async (id: number) => {
    const response = await api.put(`/quotes/${id}/cancel`)
    return response.data
  },

  convertToOrder: async (id: number) => {
    const response = await api.post(`/quotes/${id}/convert`)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete(`/quotes/${id}`)
    return response.data
  },

  getPDF: async (id: number) => {
    const response = await api.get(`/quotes/${id}/pdf`, {
      responseType: 'blob'
    })
    return response.data
  }
}

export default quoteService

