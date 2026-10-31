import { describe, expect, it } from 'vitest'
import { customerOrdersRoute, leadQuoteRoute, parseContextId, withoutContextKey } from './contextRoutes'

describe('parseContextId', () => {
  it.each(['1', '42', '9007199254740991'])('accepts %s', (v) => {
    expect(parseContextId(v)).toBe(Number(v))
  })
  it.each(['', '0', '-1', '1.5', 'abc', '1e3', '01', ' 1', '9007199254740993'])('rejects %j', (v) => {
    expect(parseContextId(v)).toBeNull()
  })
  it('rejects arrays, null, undefined and numbers', () => {
    expect(parseContextId(['1', '2'])).toBeNull()
    expect(parseContextId(null)).toBeNull()
    expect(parseContextId(undefined)).toBeNull()
    expect(parseContextId(5)).toBeNull()
  })
})

describe('route builders', () => {
  it('builds typed routes', () => {
    expect(customerOrdersRoute(5)).toEqual({ path: '/orders', query: { customerId: '5' } })
    expect(leadQuoteRoute(9)).toEqual({ path: '/leads/9/orcamento' })
  })
  it('refuses invalid ids', () => {
    expect(() => customerOrdersRoute(0)).toThrow(RangeError)
    expect(() => leadQuoteRoute(1.5)).toThrow(RangeError)
  })
})

describe('withoutContextKey', () => {
  it('removes only the given key', () => {
    expect(withoutContextKey({ customerId: '1', x: 'y' }, 'customerId')).toEqual({ x: 'y' })
  })
})
