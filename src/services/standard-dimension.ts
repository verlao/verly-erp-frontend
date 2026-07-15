import api from './api'

// Medida padrão de um tipo: produto que bate com ela é classificado como "padrão".
export interface StandardDimensionDTO {
  id?: number
  type: string // PORTA | JANELA | BOX
  sheets?: number | null // null = qualquer nº de folhas
  width: number
  height: number
  active?: boolean
}

const standardDimensionService = {
  getAll: async (): Promise<StandardDimensionDTO[]> => {
    const response = await api.get('/api/standard-dimensions')
    return response.data
  },

  create: async (dimension: Omit<StandardDimensionDTO, 'id'>): Promise<StandardDimensionDTO> => {
    const response = await api.post('/api/standard-dimensions', dimension)
    return response.data
  },

  update: async (id: number, dimension: Partial<StandardDimensionDTO>): Promise<StandardDimensionDTO> => {
    const response = await api.put(`/api/standard-dimensions/${id}`, dimension)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/standard-dimensions/${id}`)
  }
}

export default standardDimensionService
