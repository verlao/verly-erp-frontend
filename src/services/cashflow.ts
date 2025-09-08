import api from './api'

export interface CashFlowDTO {
  id?: number
  description: string
  cash: number
  orderId?: number
  person: string
  type: string
  createdDate?: string
  updatedDate?: string
  deleted?: boolean
}

const cashFlowService = {
  getAll: async () => {
    const response = await api.get('/cash-flow')
    return response.data
  },
  
  getByDateRange: async (startDate: string, endDate: string) => {
    const response = await api.get(`/cash-flow/date-range?startDate=${startDate}&endDate=${endDate}`)
    return response.data
  },
  
  create: async (cashFlow: CashFlowDTO) => {
    const response = await api.post('/cash-flow', cashFlow)
    return response.data
  },
  
  update: async (id: number, cashFlow: CashFlowDTO) => {
    const response = await api.patch(`/cash-flow/${id}`, cashFlow)
    return response.data
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/cash-flow/${id}`)
    return response.data
  }
}

export default cashFlowService