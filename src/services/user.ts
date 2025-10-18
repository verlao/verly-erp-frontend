import api from './api'
import type { PaginatedResponse, PaginationParams } from './order'

export interface UserDTO {
  id?: string
  username: string
  password?: string
  roles: string[]
}

export interface CreateUserRequest {
  username: string
  password: string
  roles: string[]
}

const userService = {
  // Listar usuários com paginação
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<UserDTO>> => {
    const queryParams = new URLSearchParams()

    if (params?.page !== undefined) queryParams.append('page', params.page.toString())
    if (params?.size !== undefined) queryParams.append('size', params.size.toString())
    if (params?.sort) queryParams.append('sort', params.sort)

    const url = queryParams.toString() ? `/users?${queryParams.toString()}` : '/users'
    const response = await api.get(url)
    return response.data
  },

  // Criar novo usuário
  create: async (user: CreateUserRequest): Promise<UserDTO> => {
    const response = await api.post('/user', user)
    return response.data
  }
}

export default userService
