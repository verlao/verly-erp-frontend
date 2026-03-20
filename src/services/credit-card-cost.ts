import api from './api'

export interface CreditCardCostDTO {
  id?: number
  debit: number
  [key: string]: number | undefined  // Permite taxNx dinâmico (tax1x, tax4x, tax6x, etc)
}

const creditCardCostService = {
  getAll: async () => {
    const response = await api.get('/credit-card-costs')
    return response.data
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/credit-card-costs/${id}`)
    return response.data
  },
  
  create: async (creditCardCost: Omit<CreditCardCostDTO, 'id'>) => {
    const response = await api.post('/credit-card-costs', creditCardCost)
    return response.data
  },
  
  update: async (creditCardCost: CreditCardCostDTO) => {
    const response = await api.put(`/credit-card-costs/${creditCardCost.id}`, creditCardCost)
    return response.data
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/credit-card-costs/${id}`)
    return response.data
  }
}

export default creditCardCostService