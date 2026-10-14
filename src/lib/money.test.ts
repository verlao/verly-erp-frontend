import { describe, expect, it } from 'vitest'
import { formatBRL, multiplyCents, parseBRL, sumCents, toCents } from './money'

const norm = (s: string) => s.replace(/ /g, ' ')

describe('toCents', () => {
  it('converts numbers and strings without float error', () => {
    expect(toCents(1.005)).toBe(101) // float math would give 100
    expect(toCents(0.1 + 0.2)).toBe(30)
    expect(toCents('856.35')).toBe(85635)
    expect(toCents(3.15)).toBe(315)
    expect(toCents(5)).toBe(500)
    expect(toCents('0.5')).toBe(50)
  })
  it('rounds half up (away from zero) at the third decimal', () => {
    expect(toCents('1.234')).toBe(123)
    expect(toCents('1.235')).toBe(124)
    expect(toCents('-1.235')).toBe(-124)
    expect(toCents('-0.004')).toBe(0)
  })
  it('handles exponent notation and rejects garbage', () => {
    expect(toCents(1e-7)).toBe(0)
    expect(toCents(1.5e3)).toBe(150000)
    expect(() => toCents('abc')).toThrow(RangeError)
    expect(() => toCents(NaN)).toThrow(RangeError)
  })
})

describe('multiplyCents', () => {
  it('85635 x 1.30 -> 111326 (float would give 1.113,25)', () => {
    expect(multiplyCents(85635, 1.3)).toBe(111326)
    expect(multiplyCents(85635, '1.30')).toBe(111326)
  })
  it('handles zero, negatives and ties', () => {
    expect(multiplyCents(0, 1.3)).toBe(0)
    expect(multiplyCents(-85635, 1.3)).toBe(-111326)
    expect(multiplyCents(1, 0.5)).toBe(1)
    expect(multiplyCents(3, 0.5)).toBe(2)
  })
  it('rejects non-integer cents', () => {
    expect(() => multiplyCents(1.5, 2)).toThrow(RangeError)
  })
})

describe('sumCents', () => {
  it('sums variadic and array forms', () => {
    expect(sumCents(1, 2, 3)).toBe(6)
    expect(sumCents([1, 2, 3])).toBe(6)
    expect(sumCents()).toBe(0)
  })
})

describe('worked examples', () => {
  it('149 x 3,15 + 120 + 267 = 856,35', () => {
    const cost = sumCents(multiplyCents(toCents(3.15), 149), toCents(120), toCents(267))
    expect(cost).toBe(85635)
    expect(norm(formatBRL(cost))).toBe('R$ 856,35')
  })
  it('(180 x 3,15 + 120 + 267) x 1,30 = R$ 1.240,20', () => {
    const cost = sumCents(multiplyCents(toCents(3.15), 180), toCents(120), toCents(267))
    expect(cost).toBe(95400)
    const price = multiplyCents(cost, 1.3)
    expect(price).toBe(124020)
    expect(norm(formatBRL(price))).toBe('R$ 1.240,20')
  })
  it('856,35 x 1,30 = R$ 1.113,26', () => {
    expect(norm(formatBRL(multiplyCents(85635, 1.3)))).toBe('R$ 1.113,26')
  })
})

describe('formatBRL / parseBRL', () => {
  it('formats cents', () => {
    expect(norm(formatBRL(0))).toBe('R$ 0,00')
    expect(norm(formatBRL(111326))).toBe('R$ 1.113,26')
  })
  it('parses pt-BR text', () => {
    expect(parseBRL('1.113,26')).toBe(111326)
    expect(parseBRL('R$ 1.113,26')).toBe(111326)
    expect(parseBRL('1113,26')).toBe(111326)
    expect(parseBRL('12')).toBe(1200)
    expect(parseBRL('0,5')).toBe(50)
    expect(parseBRL('-10,00')).toBe(-1000)
  })
  it('returns null when unparseable', () => {
    expect(parseBRL('')).toBeNull()
    expect(parseBRL('abc')).toBeNull()
    expect(parseBRL('1,2,3')).toBeNull()
  })
  it('round-trips', () => {
    expect(parseBRL(formatBRL(111326))).toBe(111326)
  })
})
