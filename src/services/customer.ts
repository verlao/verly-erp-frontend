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

export interface AddressDTO {
  id?: number
  cep?: string
  logradouro?: string
  number?: string
  complemento?: string
  bairro?: string
  localidade?: string
  reference?: string
  isPrimary?: boolean
  customerId?: number
}

export interface CustomerDTO {
  id?: number
  name: string
  cpf: string
  
  // Phone fields
  phoneOne?: string
  phoneTwo?: string
  
  defaulter?: boolean
  addresses?: AddressDTO[]
  createdAt?: number[]
}

const customerService = {
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
    
    // Adiciona cache busting
    queryParams.append('_t', Date.now().toString())
    
    // Se tem parâmetros de paginação, usa o endpoint paginado
    if (params && (params.page !== undefined || params.size !== undefined)) {
      const url = `/customers/paginated?${queryParams.toString()}`
      const response = await api.get(url)
      return response.data
    }
    
    // Senão, usa o endpoint normal para compatibilidade
    const response = await api.get(`/customers?${queryParams.toString()}`)
    return response.data
  },

  getAllNonPaginated: async () => {
    const response = await api.get(`/customers?_t=${Date.now()}`)
    return response.data
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/customers/${id}`)
    return response.data
  },
  
  create: async (customer: CustomerDTO) => {
    const response = await api.post('/customers', customer)
    return response.data
  },
  
  update: async (id: number, customer: CustomerDTO) => {
    const response = await api.put(`/customers/${id}`, customer)
    return response.data
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/customers/${id}`)
    return response.data
  }
}

export default customerService