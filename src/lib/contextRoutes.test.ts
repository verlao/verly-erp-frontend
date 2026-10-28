import { describe, expect, it } from 'vitest'
import {
  customerOrdersRoute, leadQuoteRoute, newQuoteRoute, parseContextId, parseContextQuery, withoutContextKey,
} from './contextRoutes'

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

describe('parseContextQuery', () => {
  it('keeps conflicting identities separate and drops invalid ones', () => {
    expect(parseContextQuery({ leadId: '7', customerId: '7', orderId: 'x', partnerId: ['1'] })).toEqual({
      leadId: 7, customerId: 7, quoteId: null, orderId: null, partnerId: null,
    })
  })
})

describe('route builders', () => {
  it('builds typed routes', () => {
    expect(customerOrdersRoute(5)).toEqual({ path: '/orders', query: { customerId: '5' } })
    expect(leadQuoteRoute(9)).toEqual({ path: '/leads/9/orcamento' })
    expect(newQuoteRoute({ leadId: 3 })).toEqual({ path: '/new-quote', query: { leadId: '3' } })
    expect(newQuoteRoute({ customerId: 4 })).toEqual({ path: '/new-quote', query: { customerId: '4' } })
  })
  it('refuses invalid ids', () => {
    expect(() => customerOrdersRoute(0)).toThrow(RangeError)
    expect(() => leadQuoteRoute(1.5)).toThrow(RangeError)
  })
  it('round-trips through the parser', () => {
    const route = customerOrdersRoute(12) as { query: Record<string, string> }
    expect(parseContextQuery(route.query).customerId).toBe(12)
  })
})

describe('withoutContextKey', () => {
  it('removes only the given key', () => {
    expect(withoutContextKey({ customerId: '1', x: 'y' }, 'customerId')).toEqual({ x: 'y' })
  })
})
