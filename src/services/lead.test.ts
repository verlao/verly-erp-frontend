import { beforeEach, describe, expect, it, vi } from 'vitest'
import leadService from './lead'
import { apiUrl } from './api'

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
