import api from './api'

export interface GlassCostDTO {
  id?: number
  color: string
  costPerSquareMeter: number
  supplier?: string
  effectiveDate?: string
  expiryDate?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

const glassCostService = {
  getAll: async (): Promise<GlassCostDTO[]> => {
    const response = await api.get('/api/glass-cost')
    return response.data
  },
  
  getById: async (id: number): Promise<GlassCostDTO> => {
    const response = await api.get(`/api/glass-cost/${id}`)
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
  
  create: async (glassCost: Omit<GlassCostDTO, 'id'>): Promise<GlassCostDTO> => {
    const response = await api.post('/api/glass-cost', glassCost)
    return response.data
  },
  
  update: async (id: number, glassCost: Partial<GlassCostDTO>): Promise<GlassCostDTO> => {
    const response = await api.put(`/api/glass-cost/${id}`, glassCost)
    return response.data
  },

  updatePriceByColor: async (color: string, newPrice: number): Promise<void> => {
    // Backend espera BigDecimal, então enviamos como string com 2 casas decimais
    const formattedPrice = newPrice.toFixed(2)
    
    console.log('📡 glass-cost.updatePriceByColor:', {
      color,
      newPrice,
      formattedPrice,
      supplier: 'DEFAULT',
      url: `/api/glass-cost/color/${color}/price`
    })
    
    const response = await api.put(`/api/glass-cost/color/${color}/price`, null, {
      params: { 
        newPrice: formattedPrice,
        supplier: 'DEFAULT'
      }
    })
    
    console.log('✅ Response:', response.status, response.data)
    return response.data
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/glass-cost/${id}`)
  }
}

export default glassCostService

