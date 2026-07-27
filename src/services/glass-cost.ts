import api from './api'

export interface GlassCostDTO {
  id?: number
  color: string
  costPerSquareMeter: number
  // Custo por m² pra corte FORA do catálogo (não-padrão). Catálogo usa o padrão;
  // a Calculadora Rápida (dimensão fora do catálogo) usa este.
  costPerSquareMeterNaoPadrao?: number
  supplier?: string
  effectiveDate?: string
  expiryDate?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

// Célula da matriz de preço do m² por (cor × tipo × padrão/não-padrão)
export interface GlassPriceDTO {
  id?: number
  color: string
  type: string
  standard: boolean
  costPerM2: number
  active?: boolean
}

// Painel de configuração consolidado: custos de vidro + PVC/m².
export interface CostConfigDTO {
  glassCosts: GlassCostDTO[]
  pvcCostPerSquareMeter: number | null
}

const glassCostService = {
  getAll: async (): Promise<GlassCostDTO[]> => {
    const response = await api.get('/api/glass-cost')
    return response.data
  },

  // Matriz de preço por (cor × tipo × padrão/não-padrão)
  getMatrix: async (): Promise<GlassPriceDTO[]> => {
    const response = await api.get('/api/glass-cost/matrix')
    return response.data
  },

  updateMatrixPrice: async (
    color: string,
    type: string,
    standard: boolean,
    newPrice: number
  ): Promise<GlassPriceDTO> => {
    const response = await api.put('/api/glass-cost/matrix', null, {
      params: { color, type, standard, newPrice: newPrice.toFixed(2) }
    })
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
  
  // Atualiza SÓ o custo não-padrão de uma cor: busca a linha atual e faz upsert
  // (POST createOrUpdate) preservando o padrão. Não há endpoint dedicado /price.
  updateNonStandardByColor: async (color: string, newPrice: number): Promise<void> => {
    const current = await glassCostService.getByColor(color)
    await api.post('/api/glass-cost', {
      ...current,
      costPerSquareMeterNaoPadrao: Number(newPrice.toFixed(2)),
    })
  },

  // Painel de configuração consolidado: custos de vidro (padrão + não-padrão) + PVC/m².
  getConfig: async (): Promise<CostConfigDTO> => {
    const response = await api.get('/api/glass-cost/config')
    return response.data
  },

  getPvcCost: async (): Promise<number | null> => {
    const response = await api.get('/api/glass-cost/pvc')
    return response.data?.costPerSquareMeter ?? null
  },

  updatePvcCost: async (costPerSquareMeter: number): Promise<void> => {
    await api.put('/api/glass-cost/pvc', {
      costPerSquareMeter: Number(costPerSquareMeter.toFixed(2)),
    })
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/glass-cost/${id}`)
  },
}

export default glassCostService

