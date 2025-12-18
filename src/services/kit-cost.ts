import api from './api'

export interface KitCostDTO {
  id?: number
  type: string
  sheets: number
  kitValue: number
  active?: boolean
  description?: string
  createdAt?: string
  updatedAt?: string
}

const kitCostService = {
  getAll: async (): Promise<KitCostDTO[]> => {
    const response = await api.get('/api/kit-costs')
    return response.data
  },
  
  getById: async (id: number): Promise<KitCostDTO> => {
    const response = await api.get(`/api/kit-costs/${id}`)
    return response.data
  },
  
  getByType: async (type: string): Promise<KitCostDTO[]> => {
    const response = await api.get(`/api/kit-costs/by-type/${type}`)
    return response.data
  },
  
  getBySheets: async (sheets: number): Promise<KitCostDTO[]> => {
    const response = await api.get(`/api/kit-costs/by-sheets/${sheets}`)
    return response.data
  },
  
  getAvailableTypes: async (): Promise<string[]> => {
    const response = await api.get('/api/kit-costs/types')
    return response.data
  },
  
  getAvailableSheets: async (): Promise<number[]> => {
    const response = await api.get('/api/kit-costs/sheets')
    return response.data
  },
  
  create: async (kitCost: Omit<KitCostDTO, 'id'>): Promise<KitCostDTO> => {
    const response = await api.post('/api/kit-costs', kitCost)
    return response.data
  },
  
  update: async (id: number, kitCost: Partial<KitCostDTO>): Promise<KitCostDTO> => {
    const response = await api.put(`/api/kit-costs/${id}`, kitCost)
    return response.data
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/kit-costs/${id}`)
  }
}

export default kitCostService
