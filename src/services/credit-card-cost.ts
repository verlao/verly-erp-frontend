import api from './api'

export interface CreditCardCostDTO {
  id?: number
  debit: number
  tax1x: number
  tax2x: number
  tax3x: number
  tax4x: number
  tax5x: number
  tax6x: number
  tax7x: number
  tax8x: number
  tax9x: number
  tax10x: number
  tax11x: number
  tax12x: number
  tax13x: number
  tax14x: number
  tax15x: number
  tax16x: number
  tax17x: number
  tax18x: number
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