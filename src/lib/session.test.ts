import { describe, it, expect } from 'vitest'
import { shouldLogout } from './session'

function makeToken(expSecondsFromNow: number): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '')
  const exp = Math.floor(Date.now() / 1000) + expSecondsFromNow
  return `${b64({ alg: 'HS256' })}.${b64({ sub: 'maria', exp })}.sig`
}

describe('shouldLogout', () => {
  const expired = makeToken(-60)
  const valid = makeToken(3600)

  it('logs out on 401', () => {
    expect(shouldLogout(401, valid)).toBe(true)
    expect(shouldLogout(401, null)).toBe(true)
  })

  it('logs out on 403 with expired token', () => {
    expect(shouldLogout(403, expired)).toBe(true)
  })

  it('does not log out on 403 with valid token', () => {
    expect(shouldLogout(403, valid)).toBe(false)
  })

  it('does not log out on 403 without token', () => {
    expect(shouldLogout(403, null)).toBe(false)
  })

  it('does not log out on 500 or missing status', () => {
    expect(shouldLogout(500, expired)).toBe(false)
    expect(shouldLogout(undefined, expired)).toBe(false)
  })
})
