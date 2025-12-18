import api from './api'

export interface LaborCostDTO {
  id?: number
  type: string
  sheets: number
  laborValue: number
  createdAt?: string
  updatedAt?: string
}

const laborCostService = {
  getAll: async (): Promise<LaborCostDTO[]> => {
    const response = await api.get('/api/labor-costs')
    return response.data
  },
  
  getById: async (id: number): Promise<LaborCostDTO> => {
    const response = await api.get(`/api/labor-costs/${id}`)
    return response.data
  },
  
  getByType: async (type: string): Promise<LaborCostDTO[]> => {
    const response = await api.get(`/api/labor-costs/by-type/${type}`)
    return response.data
  },
  
  getBySheets: async (sheets: number): Promise<LaborCostDTO[]> => {
    const response = await api.get(`/api/labor-costs/by-sheets/${sheets}`)
    return response.data
  },
  
  getAvailableTypes: async (): Promise<string[]> => {
    const response = await api.get('/api/labor-costs/types')
    return response.data
  },
  
  getAvailableSheets: async (): Promise<number[]> => {
    const response = await api.get('/api/labor-costs/sheets')
    return response.data
  },
  
  create: async (laborCost: Omit<LaborCostDTO, 'id'>): Promise<LaborCostDTO> => {
    const response = await api.post('/api/labor-costs', laborCost)
    return response.data
  },
  
  update: async (id: number, laborCost: Partial<LaborCostDTO>): Promise<LaborCostDTO> => {
    const response = await api.put(`/api/labor-costs/${id}`, laborCost)
    return response.data
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/labor-costs/${id}`)
  }
}

export default laborCostService
