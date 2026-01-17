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
  createdBy?: string
  updatedBy?: string
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
  
  getByTypeAndSheets: async (type: string, sheets: number): Promise<GainDTO> => {
    const response = await api.get(`/api/gains/search?type=${type}&sheets=${sheets}`)
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

