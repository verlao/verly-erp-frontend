import { describe, expect, it } from 'vitest'
import { friendlyError } from './errors'

const FALLBACK = 'Ação falhou'
const withStatus = (status: number, message = 'Erro interno: NPE em OrderService:42') => ({
  response: { status, data: { message } },
})

describe('friendlyError', () => {
  it('maps a missing response (network error) to the offline message', () => {
    expect(friendlyError(new Error('Network Error'), FALLBACK)).toBe(
      'Sem conexão. Confira a internet e tente de novo.',
    )
    expect(friendlyError(undefined, FALLBACK)).toContain('Sem conexão')
    expect(friendlyError(null, FALLBACK)).toContain('Sem conexão')
  })

  it('maps 401, 403 and 404', () => {
    expect(friendlyError(withStatus(401), FALLBACK)).toBe('Sua sessão acabou. Entre de novo.')
    expect(friendlyError(withStatus(403), FALLBACK)).toBe('Você não tem permissão para fazer isso.')
    expect(friendlyError(withStatus(404), FALLBACK)).toBe(
      'Não encontramos isso. Pode ter sido apagado.',
    )
  })

  it('maps every 5xx to the system-failure message', () => {
    for (const status of [500, 502, 503, 504]) {
      expect(friendlyError(withStatus(status), FALLBACK)).toBe(
        'O sistema falhou. Tente de novo em instantes.',
      )
    }
  })

  it('returns the fallback for 400, 409 and 422', () => {
    for (const status of [400, 409, 422]) {
      expect(friendlyError(withStatus(status), FALLBACK)).toBe(FALLBACK)
    }
  })

  it('never leaks the backend message', () => {
    for (const status of [400, 401, 403, 404, 409, 422, 500]) {
      expect(friendlyError(withStatus(status, 'SEGREDO-do-backend'), FALLBACK)).not.toContain(
        'SEGREDO',
      )
    }
  })

  it('treats a response without a numeric status as the fallback', () => {
    expect(friendlyError({ response: {} }, FALLBACK)).toBe(FALLBACK)
  })
})
