import api from './api'

export interface LaborCostDTO {
  id?: number
  type: string
  sheets: number
  laborValue: number
  active?: boolean
  description?: string
  createdDate?: string
  updatedDate?: string
  createdBy?: string
  updatedBy?: string
}

export interface LaborCostInlineUpdateResponse {
  success: boolean
  id: number
  type: string
  sheets: number
  oldValue: number
  newValue: number
  message: string
  error?: string
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
  
  getByTypeAndSheets: async (type: string, sheets: number): Promise<LaborCostDTO> => {
    const response = await api.get(`/api/labor-costs/search?type=${type}&sheets=${sheets}`)
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
  
  // Atualiza mão de obra inline usando path variables + body
  // PATCH /api/labor-costs/inline/{type}/{sheets}
  // Body: { "laborValue": 175.50 }
  updateInline: async (type: string, sheets: number, laborValue: number): Promise<LaborCostInlineUpdateResponse> => {
    const response = await api.patch(`/api/labor-costs/inline/${type}/${sheets}`, {
      laborValue
    })
    return response.data
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/labor-costs/${id}`)
  }
}

export default laborCostService

