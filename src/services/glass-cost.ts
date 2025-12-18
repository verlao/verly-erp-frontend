import api from './api'

export interface GlassCostDTO {
  id?: number
  color: string
  cost: number
  supplier?: string
  active?: boolean
  createdAt?: string
  updatedAt?: string
}

const glassCostService = {
  getAll: async (): Promise<GlassCostDTO[]> => {
    const response = await api.get('/api/glass-cost')
    return response.data
  },
  
  getByColor: async (color: string): Promise<GlassCostDTO> => {
    const response = await api.get(`/api/glass-cost/color/${color}`)
    return response.data
  },
  
  getPriceByColor: async (color: string): Promise<number> => {
    const response = await api.get(`/api/glass-cost/price/${color}`)
    return response.data
  },
  
  getHistory: async (color: string): Promise<GlassCostDTO[]> => {
    const response = await api.get(`/api/glass-cost/history/${color}`)
    return response.data
  },
  
  existsByColor: async (color: string): Promise<boolean> => {
    const response = await api.get(`/api/glass-cost/exists/${color}`)
    return response.data
  },
  
  create: async (glassCost: Omit<GlassCostDTO, 'id'>): Promise<GlassCostDTO> => {
    const response = await api.post('/api/glass-cost', glassCost)
    return response.data
  },
  
  update: async (id: number, glassCost: Partial<GlassCostDTO>): Promise<GlassCostDTO> => {
    const response = await api.put(`/api/glass-cost/${id}`, glassCost)
    return response.data
  },
  
  updatePriceByColor: async (color: string, newPrice: number, supplier?: string): Promise<GlassCostDTO> => {
    const params: any = { newPrice }
    if (supplier) params.supplier = supplier
    const response = await api.put(`/api/glass-cost/color/${color}/price`, null, { params })
    return response.data
  },
  
  delete: async (color: string): Promise<void> => {
    await api.delete(`/api/glass-cost/color/${color}`)
  }
}

export default glassCostService
