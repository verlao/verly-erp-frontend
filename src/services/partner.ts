import api from './api'
import type { PaginationParams } from './order'
import type { PaginatedResponse } from './lead'

export type PartnerType = 'SUPPLIER' | 'SERVICE_PROVIDER'

// Labels de exibição (pt-BR) por tipo de parceiro.
export const partnerTypeLabels: Record<PartnerType, string> = {
  SUPPLIER: 'Fornecedor',
  SERVICE_PROVIDER: 'Mão de obra',
}

export interface PartnerDTO {
  id: number
  type: PartnerType
  name: string
  phone?: string
  cnpj?: string
  defaulter?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface PartnerQueryParams extends PaginationParams {
  type?: PartnerType
}

const partnerService = {
  getAllPaginated: async (
    params?: PartnerQueryParams
  ): Promise<PaginatedResponse<PartnerDTO>> => {
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
    if (params?.type) {
      queryParams.append('type', params.type)
    }

    const response = await api.get(`/partners/paginated?${queryParams.toString()}`)
    return response.data
  },

  remove: async (id: number) => {
    const response = await api.delete(`/partners/${id}`)
    return response.data
  },
}

export default partnerService
