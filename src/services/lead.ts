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

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST'
export type LeadPriority = 'HIGH' | 'MEDIUM' | 'LOW'
export type LeadTier = '$' | '$$' | '$$$'

export interface LeadItemDTO {
  id?: number
  productType?: string
  widthCm?: number
  heightCm?: number
  sheets?: number
  color?: string
  quantity: number
  estimatedValue?: number
  estimatedProfit?: number
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
  status?: LeadStatus
  isRead?: boolean
  priority?: LeadPriority
  tags?: string[]
  lastContactDate?: string
  assignedTo?: string
  notes?: string[]

  // V2_17 backend additions
  items?: LeadItemDTO[]
  totalEstimatedValue?: number
  totalEstimatedProfit?: number
  tier?: LeadTier
  sourceExtractionId?: number
  source?: string
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
  },

  // Novos métodos para inbox-style
  updateStatus: async (id: number, status: LeadStatus) => {
    const response = await api.patch(`/leads/${id}/status`, { status })
    return response.data
  },

  markAsRead: async (id: number) => {
    const response = await api.patch(`/leads/${id}/read`, { isRead: true })
    return response.data
  },

  markAsUnread: async (id: number) => {
    const response = await api.patch(`/leads/${id}/read`, { isRead: false })
    return response.data
  },

  convertToCustomer: async (id: number) => {
    const response = await api.post(`/leads/${id}/convert`)
    return response.data
  },

  bulkAction: async (ids: number[], action: string, data?: any) => {
    const response = await api.post('/leads/bulk', { ids, action, data })
    return response.data
  },

  getCounts: async () => {
    const response = await api.get('/leads/counts')
    return response.data
  }
}

export default leadService