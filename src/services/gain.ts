import api from './api'

export interface GainDTO {
  id?: number
  type: string
  sheets: number
  gainValue: number
  active?: boolean
  description?: string
  createdDate?: string
  updatedDate?: string
}

const gainService = {
  getAll: async (): Promise<GainDTO[]> => {
    const response = await api.get('/api/gains')
    return response.data
  },
  
  getById: async (id: number): Promise<GainDTO> => {
    const response = await api.get(`/api/gains/${id}`)
    return response.data
  },
  
  getByType: async (type: string): Promise<GainDTO[]> => {
    const response = await api.get(`/api/gains/by-type/${type}`)
    return response.data
  },
  
  getBySheets: async (sheets: number): Promise<GainDTO[]> => {
    const response = await api.get(`/api/gains/by-sheets/${sheets}`)
    return response.data
  },
  
  getAvailableTypes: async (): Promise<string[]> => {
    const response = await api.get('/api/gains/types')
    return response.data
  },
  
  getAvailableSheets: async (): Promise<number[]> => {
    const response = await api.get('/api/gains/sheets')
    return response.data
  },
  
  create: async (gain: Omit<GainDTO, 'id'>): Promise<GainDTO> => {
    const response = await api.post('/api/gains', gain)
    return response.data
  },
  
  update: async (id: number, gain: Partial<GainDTO>): Promise<GainDTO> => {
    const response = await api.put(`/api/gains/${id}`, gain)
    return response.data
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/gains/${id}`)
  }
}

export default gainService
