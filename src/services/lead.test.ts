import { beforeEach, describe, expect, it, vi } from 'vitest'
import leadService from './lead'
import api, { apiUrl } from './api'

describe('leadService.updateStatusKeepalive', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('PATCHes with keepalive so the request survives the tab being backgrounded', async () => {
    localStorage.setItem('token', 'test-token')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 7, status: 'CONTACTED' })
    })
    vi.stubGlobal('fetch', fetchMock)

    await leadService.updateStatusKeepalive(7, 'CONTACTED')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${apiUrl}/leads/7/status`)
    expect(init.method).toBe('PATCH')
    expect(init.keepalive).toBe(true)
    expect(init.body).toBe(JSON.stringify({ status: 'CONTACTED' }))
    expect(init.headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-token'
    })
  })

  it('throws when the PATCH fails so the caller can revert optimistic UI', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))

    await expect(leadService.updateStatusKeepalive(7, 'CONTACTED')).rejects.toThrow(
      'Failed to update lead status (500)'
    )
  })
})

describe('leadService — filas operacionais', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('getQueues sem parâmetro chama GET /leads/queues e devolve uma chave por fila', async () => {
    const payload = {
      CONFIRM_PURCHASE: { count: 2, totalValue: 1500.5 },
      QUOTE_REGISTERED: { count: 0, totalValue: null },
      REPLY_NOW: { count: 4, totalValue: null },
      QUOTE_NOW: { count: 1, totalValue: 320 },
      COMPLETE_MEASURES: { count: 3, totalValue: null },
      REVIEW_DATA: { count: 5, totalValue: null }
    }
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({ data: payload })

    const result = await leadService.getQueues()

    expect(getSpy).toHaveBeenCalledWith('/leads/queues')
    expect(result.CONFIRM_PURCHASE.count).toBe(2)
    // Fila sem valor confiável: soma null, não zero.
    expect(result.QUOTE_REGISTERED.totalValue).toBeNull()
  })

  it('getQueues repassa includePartnerLeads quando informado', async () => {
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({ data: {} })

    await leadService.getQueues(true)

    expect(getSpy).toHaveBeenCalledWith('/leads/queues?includePartnerLeads=true')
  })

  it('getQueue chama GET /leads/queues/{queue} sem query quando não há parâmetros', async () => {
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({
      data: { content: [], totalElements: 0, totalPages: 0, size: 20, number: 0, first: true, last: true }
    })

    const result = await leadService.getQueue('REPLY_NOW')

    expect(getSpy).toHaveBeenCalledWith('/leads/queues/REPLY_NOW')
    expect(result.totalElements).toBe(0)
  })

  it('getQueue envia page, size e includePartnerLeads como query', async () => {
    const getSpy = vi.spyOn(api, 'get').mockResolvedValue({ data: { content: [] } })

    await leadService.getQueue('COMPLETE_MEASURES', { page: 1, size: 10, includePartnerLeads: false })

    expect(getSpy).toHaveBeenCalledWith(
      '/leads/queues/COMPLETE_MEASURES?page=1&size=10&includePartnerLeads=false'
    )
  })
})
