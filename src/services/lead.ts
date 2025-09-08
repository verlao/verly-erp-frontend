import api from './api'
import type { PaginationParams } from './order'

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface LeadDTO {
  id: number
  name: string
  phone: string
  email: string
  description: string
  city: string
  neighborhood: string
  data: string
  createdDate: string
  userAgent?: string
  latitude?: string
  longitude?: string
  screenWidth?: string
  screenHeight?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  referrer?: string
  submissionDate?: string
  deviceType?: string
  consent?: boolean
}

const leadService = {
  getAll: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams()
    
    if (params?.page !== undefined) {
      queryParams.append('page', params.page.toString())
    }
    if (params?.size !== undefined) {
      queryParams.append('size', params.size.toString())
    }
    if (params?.sort) {
      queryParams.append('sort', params.sort)
    }
    
    // Se tem parâmetros de paginação, usa o endpoint paginado
    if (params && (params.page !== undefined || params.size !== undefined)) {
      const url = `/leads/paginated?${queryParams.toString()}`
      const response = await api.get(url)
      return response.data
    }
    
    // Senão, usa o endpoint normal para compatibilidade
    const response = await api.get('/leads')
    return response.data
  },
  
  getAllNonPaginated: async () => {
    const response = await api.get('/leads')
    return response.data
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/leads/${id}`)
    return response.data
  },
  
  create: async (lead: LeadDTO) => {
    const response = await api.post('/leads', lead)
    return response.data
  },
  
  update: async (id: number, lead: LeadDTO) => {
    const response = await api.put(`/leads/${id}`, lead)
    return response.data
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/leads/${id}`)
    return response.data
  }
}

export default leadService