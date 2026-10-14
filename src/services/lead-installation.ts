import api from './api'

export type LeadInstallationStatus = 'SCHEDULED' | 'DONE' | 'CANCELLED'

// Espelha application/dto/LeadInstallationDTO.java.
export interface LeadInstallationDTO {
  id: number
  leadId: number
  orderId: number | null
  scheduledAt: string
  address: string | null
  responsible: string | null
  status: LeadInstallationStatus
  createdAt: string
  updatedAt: string
}

// O backend permite limpar os campos opcionais com null. Status null/omitido
// preserva o estado atual no PUT; no POST o backend aplica SCHEDULED.
export interface LeadInstallationRequestDTO {
  scheduledAt: string
  orderId?: number | null
  address?: string | null
  responsible?: string | null
  status?: LeadInstallationStatus | null
}

export interface LeadInstallationListParams {
  start?: string
  end?: string
  status?: LeadInstallationStatus
}

const listQuery = (params?: LeadInstallationListParams): string => {
  const query = new URLSearchParams()
  if (params?.start !== undefined) query.append('start', params.start)
  if (params?.end !== undefined) query.append('end', params.end)
  if (params?.status !== undefined) query.append('status', params.status)
  const search = query.toString()
  return search ? `?${search}` : ''
}

const leadInstallationService = {
  list: async (params?: LeadInstallationListParams): Promise<LeadInstallationDTO[]> => {
    const response = await api.get(`/lead-installations${listQuery(params)}`)
    return response.data
  },

  listByLead: async (
    leadId: number,
    params?: LeadInstallationListParams
  ): Promise<LeadInstallationDTO[]> => {
    const response = await api.get(`/leads/${leadId}/installations${listQuery(params)}`)
    return response.data
  },

  get: async (leadId: number, id: number): Promise<LeadInstallationDTO> => {
    const response = await api.get(`/leads/${leadId}/installations/${id}`)
    return response.data
  },

  create: async (
    leadId: number,
    dto: LeadInstallationRequestDTO
  ): Promise<LeadInstallationDTO> => {
    const response = await api.post(`/leads/${leadId}/installations`, dto)
    return response.data
  },

  update: async (
    leadId: number,
    id: number,
    dto: LeadInstallationRequestDTO
  ): Promise<LeadInstallationDTO> => {
    const response = await api.put(`/leads/${leadId}/installations/${id}`, dto)
    return response.data
  },

  cancel: async (leadId: number, id: number): Promise<void> => {
    await api.delete(`/leads/${leadId}/installations/${id}`)
  },
}

export default leadInstallationService
