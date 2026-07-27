import api from './api'

export interface OrderDTO {
  id?: number
  customerId: number
  products: Record<number, number> // Map of productId to quantity
  status: string
  deliveryDate?: string
  cost: number
  price: number
  debt: number
  profit: number
}

// Set canônico pós-V2_29 (coluna segue string; tolerante a legados)
export type OrderStatus = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO' | string

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface PaginationParams {
  page?: number
  size?: number
  sort?: string
}

const orderService = {
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
    
    const url = queryParams.toString() ? `/orders?${queryParams.toString()}` : '/orders'
    const response = await api.get(url)
    return response.data
  },

  getAllNonPaginated: async () => {
    const response = await api.get('/orders')
    return response.data
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },
  
  create: async (order: OrderDTO) => {
    const response = await api.post('/orders', order)
    return response.data
  },
  
  update: async (id: number, order: OrderDTO) => {
    const response = await api.put(`/orders/${id}`, order)
    return response.data
  },

  // V2_29: transição de status validada pelo backend (400 em valor inválido)
  updateStatus: async (id: number, status: OrderStatus) => {
    const response = await api.patch(`/orders/${id}/status`, { status })
    return response.data
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/orders/${id}`)
    return response.data
  }
}

export default orderService