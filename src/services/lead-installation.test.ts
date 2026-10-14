import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './api'
import leadInstallationService, {
  type LeadInstallationDTO,
  type LeadInstallationRequestDTO,
} from './lead-installation'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const installation: LeadInstallationDTO = {
  id: 31,
  leadId: 8,
  orderId: 42,
  scheduledAt: '2026-10-15T09:30:00',
  address: 'Rua Exemplo, 123',
  responsible: 'Equipe Demo',
  status: 'SCHEDULED',
  createdAt: '2026-10-14T14:00:00',
  updatedAt: '2026-10-14T14:00:00',
}

describe('leadInstallationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lista a agenda global sem filtros sem acrescentar query string', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [installation] })

    const result = await leadInstallationService.list()

    expect(api.get).toHaveBeenCalledWith('/lead-installations')
    expect(result).toEqual([installation])
  })

  it('envia filtros globais, codifica datas locais e preserva os valores', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })

    await leadInstallationService.list({
      start: '2026-10-15T09:30:00',
      end: '2026-10-15T17:00:00',
      status: 'SCHEDULED',
    })

    expect(api.get).toHaveBeenCalledWith(
      '/lead-installations?start=2026-10-15T09%3A30%3A00&end=2026-10-15T17%3A00%3A00&status=SCHEDULED'
    )
  })

  it('lista instalações de um lead com filtro parcial', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [installation] })

    const result = await leadInstallationService.listByLead(8, { status: 'CANCELLED' })

    expect(api.get).toHaveBeenCalledWith('/leads/8/installations?status=CANCELLED')
    expect(result).toEqual([installation])
  })

  it('busca uma instalação pela combinação de lead e id', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: installation })

    const result = await leadInstallationService.get(8, 31)

    expect(api.get).toHaveBeenCalledWith('/leads/8/installations/31')
    expect(result).toEqual(installation)
  })

  it('cria instalação enviando data local sem conversão', async () => {
    const request: LeadInstallationRequestDTO = {
      scheduledAt: '2026-10-15T09:30:00',
      orderId: 42,
      address: 'Rua Exemplo, 123',
      responsible: 'Equipe Demo',
    }
    vi.mocked(api.post).mockResolvedValue({ data: installation })

    const result = await leadInstallationService.create(8, request)

    expect(api.post).toHaveBeenCalledWith('/leads/8/installations', request)
    expect(result).toEqual(installation)
  })

  it('preserva nulls explícitos e status omitido no PUT', async () => {
    const request: LeadInstallationRequestDTO = {
      scheduledAt: '2026-10-16T10:15:00',
      orderId: null,
      address: null,
      responsible: null,
    }
    vi.mocked(api.put).mockResolvedValue({ data: { ...installation, ...request } })

    await leadInstallationService.update(8, 31, request)

    expect(api.put).toHaveBeenCalledWith('/leads/8/installations/31', request)
    expect(request).not.toHaveProperty('status')
    expect(request.orderId).toBeNull()
    expect(request.address).toBeNull()
    expect(request.responsible).toBeNull()
  })

  it('permite enviar status explicitamente nulo para preservar status atual', async () => {
    const request: LeadInstallationRequestDTO = {
      scheduledAt: '2026-10-16T10:15:00',
      status: null,
    }
    vi.mocked(api.put).mockResolvedValue({ data: installation })

    await leadInstallationService.update(8, 31, request)

    expect(api.put).toHaveBeenCalledWith('/leads/8/installations/31', request)
    expect(request.status).toBeNull()
  })

  it('cancela via DELETE e resolve void para a resposta 204', async () => {
    vi.mocked(api.delete).mockResolvedValue({ status: 204 })

    const result = await leadInstallationService.cancel(8, 31)

    expect(api.delete).toHaveBeenCalledWith('/leads/8/installations/31')
    expect(result).toBeUndefined()
  })

  it('propaga erros da API sem transformá-los', async () => {
    const notFound = { response: { status: 404 } }
    vi.mocked(api.get).mockRejectedValueOnce(notFound)

    await expect(leadInstallationService.get(999, 31)).rejects.toBe(notFound)

    const badRequest = { response: { status: 400 } }
    vi.mocked(api.post).mockRejectedValueOnce(badRequest)

    await expect(
      leadInstallationService.create(8, { scheduledAt: '2026-10-15T09:30:00' })
    ).rejects.toBe(badRequest)
  })
})
