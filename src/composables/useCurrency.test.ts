import { describe, expect, it } from 'vitest'
import { useCurrency } from './useCurrency'

const { formatCurrency } = useCurrency()

describe('useCurrency.formatCurrency', () => {
  it('formats plain values in BRL with pt-BR separators', () => {
    expect(formatCurrency(150.5)).toBe('R$ 150,50')
    expect(formatCurrency(1234.5)).toBe('R$ 1.234,50')
    expect(formatCurrency(1000)).toBe('R$ 1.000,00')
    expect(formatCurrency(1000000)).toBe('R$ 1.000.000,00')
    expect(formatCurrency(0)).toBe('R$ 0,00')
  })

  it('uses a plain space between R$ and the amount (not Intl NBSP)', () => {
    const out = formatCurrency(1113.26)
    expect(out).toBe('R$ 1.113,26')
    expect(out).not.toContain(' ')
  })

  it('rounds half up from the decimal form, not from float noise', () => {
    // toFixed(2) on 1.005 gives "1.00"; the decimal form "1.005" rounds to 1,01
    expect(formatCurrency(1.005)).toBe('R$ 1,01')
    expect(formatCurrency(0.1 + 0.2)).toBe('R$ 0,30')
    expect(formatCurrency(2.675)).toBe('R$ 2,68')
  })

  it('keeps the negative sign after R$ as the old format did', () => {
    expect(formatCurrency(-1234.56)).toBe('R$ -1.234,56')
    expect(formatCurrency(-0.5)).toBe('R$ -0,50')
  })

  it('shows zero without a sign when the value rounds to zero', () => {
    expect(formatCurrency(-0.004)).toBe('R$ 0,00')
  })

  it('falls back to zero for null, undefined, NaN and non-finite values', () => {
    expect(formatCurrency(null)).toBe('R$ 0,00')
    expect(formatCurrency(undefined)).toBe('R$ 0,00')
    expect(formatCurrency(NaN)).toBe('R$ 0,00')
    expect(formatCurrency(Infinity)).toBe('R$ 0,00')
    expect(formatCurrency(-Infinity)).toBe('R$ 0,00')
  })
})
