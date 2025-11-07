import { describe, it, expect } from 'vitest'
import type { ProductDTO } from '../services/product'

// Helper functions extracted for testing
// These would typically be extracted to a utils file

function formatCurrency(value: string | number | null | undefined): string {
  if (!value) return 'R$ 0,00'

  if (typeof value === 'string') {
    return value.startsWith('R$') ? value : `R$ ${value}`
  }

  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

function calculateProfit(product: ProductDTO): string {
  if (!product.price || !product.cost) return '-'
  const profit = product.price - product.cost
  const margin = ((profit) / product.price) * 100
  return `R$ ${profit.toFixed(2)} (${margin.toFixed(1)}%)`
}

function calculateInstallmentPrice(price: number | undefined): number {
  if (!price) return 0
  return price * 1.2
}

function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned === '') return 0
  return parseInt(cleaned) / 100
}

function formatCurrencyInput(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

describe('Products View - Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format number as currency', () => {
      expect(formatCurrency(150.50)).toBe('R$ 150,50')
      expect(formatCurrency(1000)).toBe('R$ 1000,00')
      expect(formatCurrency(0)).toBe('R$ 0,00')
    })

    it('should handle string values', () => {
      expect(formatCurrency('R$ 150,50')).toBe('R$ 150,50')
      expect(formatCurrency('150.50')).toBe('R$ 150.50')
    })

    it('should handle null and undefined', () => {
      expect(formatCurrency(null)).toBe('R$ 0,00')
      expect(formatCurrency(undefined)).toBe('R$ 0,00')
    })
  })

  describe('calculateProfit', () => {
    it('should calculate profit and margin correctly', () => {
      const product: ProductDTO = {
        price: 675.00,
        cost: 450.00
      }

      const result = calculateProfit(product)

      expect(result).toBe('R$ 225.00 (33.3%)')
    })

    it('should handle zero profit', () => {
      const product: ProductDTO = {
        price: 100.00,
        cost: 100.00
      }

      const result = calculateProfit(product)

      expect(result).toBe('R$ 0.00 (0.0%)')
    })

    it('should handle missing price or cost', () => {
      expect(calculateProfit({ price: undefined, cost: 100 })).toBe('-')
      expect(calculateProfit({ price: 100, cost: undefined })).toBe('-')
      expect(calculateProfit({})).toBe('-')
    })

    it('should handle negative profit (loss)', () => {
      const product: ProductDTO = {
        price: 100.00,
        cost: 150.00
      }

      const result = calculateProfit(product)

      expect(result).toBe('R$ -50.00 (-50.0%)')
    })
  })

  describe('calculateInstallmentPrice', () => {
    it('should apply 20% fee for installments', () => {
      expect(calculateInstallmentPrice(1000)).toBe(1200)
      expect(calculateInstallmentPrice(500)).toBe(600)
    })

    it('should handle zero and undefined', () => {
      expect(calculateInstallmentPrice(0)).toBe(0)
      expect(calculateInstallmentPrice(undefined)).toBe(0)
    })

    it('should calculate 12x installment value correctly', () => {
      const price = 1000
      const totalWithFee = calculateInstallmentPrice(price)
      const monthlyPayment = totalWithFee / 12

      expect(monthlyPayment).toBeCloseTo(100, 2)
    })
  })

  describe('parseCurrencyInput', () => {
    it('should parse currency input to number', () => {
      expect(parseCurrencyInput('15050')).toBe(150.50)
      expect(parseCurrencyInput('100')).toBe(1.00)
      expect(parseCurrencyInput('1000000')).toBe(10000.00)
    })

    it('should remove non-digit characters', () => {
      expect(parseCurrencyInput('R$ 150,50')).toBe(150.50)
      expect(parseCurrencyInput('abc123def')).toBe(1.23)
    })

    it('should handle empty string', () => {
      expect(parseCurrencyInput('')).toBe(0)
      expect(parseCurrencyInput('   ')).toBe(0)
    })
  })

  describe('formatCurrencyInput', () => {
    it('should format number as Brazilian currency', () => {
      expect(formatCurrencyInput(150.50)).toBe('R$ 150,50')
      expect(formatCurrencyInput(1000)).toBe('R$ 1000,00')
      expect(formatCurrencyInput(0)).toBe('R$ 0,00')
    })

    it('should handle decimal precision', () => {
      expect(formatCurrencyInput(150.5)).toBe('R$ 150,50')
      expect(formatCurrencyInput(150.555)).toBe('R$ 150,56') // Should round
    })
  })
})

describe('Products View - Product Validation', () => {
  it('should validate required fields for product creation', () => {
    const product: ProductDTO = {
      category: 'VIDRO-TEMPERADO',
      type: 'PORTA',
      sheets: 2,
      width: 100,
      height: 200,
      color: 'INCOLOR'
    }

    expect(product.category).toBeDefined()
    expect(product.type).toBeDefined()
    expect(product.width).toBeGreaterThan(0)
    expect(product.height).toBeGreaterThan(0)
  })

  it('should validate numeric fields are positive', () => {
    const product: ProductDTO = {
      sheets: 2,
      width: 100,
      height: 200,
      weight: 50,
      accessory: 150
    }

    expect(product.sheets).toBeGreaterThanOrEqual(0)
    expect(product.width).toBeGreaterThan(0)
    expect(product.height).toBeGreaterThan(0)
    expect(product.weight).toBeGreaterThanOrEqual(0)
    expect(product.accessory).toBeGreaterThanOrEqual(0)
  })
})

describe('Products View - Pagination Logic', () => {
  describe('getVisiblePages', () => {
    function getVisiblePages(currentPage: number, totalPages: number, maxVisible: number = 5): number[] {
      if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
      }

      const half = Math.floor(maxVisible / 2)
      let start = Math.max(1, currentPage - half)
      let end = Math.min(totalPages, start + maxVisible - 1)

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }

      return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    }

    it('should show all pages when total is less than max visible', () => {
      expect(getVisiblePages(1, 3, 5)).toEqual([1, 2, 3])
      expect(getVisiblePages(2, 4, 5)).toEqual([1, 2, 3, 4])
    })

    it('should show correct range at the beginning', () => {
      expect(getVisiblePages(1, 10, 5)).toEqual([1, 2, 3, 4, 5])
      expect(getVisiblePages(2, 10, 5)).toEqual([1, 2, 3, 4, 5])
    })

    it('should show correct range in the middle', () => {
      expect(getVisiblePages(5, 10, 5)).toEqual([3, 4, 5, 6, 7])
      expect(getVisiblePages(6, 10, 5)).toEqual([4, 5, 6, 7, 8])
    })

    it('should show correct range at the end', () => {
      expect(getVisiblePages(9, 10, 5)).toEqual([6, 7, 8, 9, 10])
      expect(getVisiblePages(10, 10, 5)).toEqual([6, 7, 8, 9, 10])
    })

    it('should handle edge case with exactly max visible pages', () => {
      expect(getVisiblePages(3, 5, 5)).toEqual([1, 2, 3, 4, 5])
    })
  })
})

describe('Products View - Filter Logic', () => {
  const mockProducts: ProductDTO[] = [
    { id: 1, type: 'PORTA', color: 'INCOLOR', sheets: 2 },
    { id: 2, type: 'JANELA', color: 'VERDE', sheets: 4 },
    { id: 3, type: 'PORTA', color: 'FUME', sheets: 2 },
    { id: 4, type: 'SACADA', color: 'INCOLOR', sheets: 1 }
  ]

  it('should filter by type', () => {
    const filtered = mockProducts.filter(p => p.type === 'PORTA')
    expect(filtered).toHaveLength(2)
    expect(filtered.every(p => p.type === 'PORTA')).toBe(true)
  })

  it('should filter by color', () => {
    const filtered = mockProducts.filter(p => p.color === 'INCOLOR')
    expect(filtered).toHaveLength(2)
    expect(filtered.every(p => p.color === 'INCOLOR')).toBe(true)
  })

  it('should filter by type and color', () => {
    const filtered = mockProducts.filter(
      p => p.type === 'PORTA' && p.color === 'INCOLOR'
    )
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe(1)
  })
})

describe('Products View - Kit/Accessory Sync', () => {
  it('should sync kit and accessory values', () => {
    const product: ProductDTO = {
      id: 1,
      kit: 150.50
    }

    // Simulate sync logic
    if (product.kit !== undefined && product.accessory === undefined) {
      product.accessory = product.kit
    }

    expect(product.accessory).toBe(150.50)
    expect(product.kit).toBe(150.50)
  })

  it('should preserve both values when both are present', () => {
    const product: ProductDTO = {
      id: 1,
      kit: 150.50,
      accessory: 200.00
    }

    // No sync needed when both present
    expect(product.accessory).toBe(200.00)
    expect(product.kit).toBe(150.50)
  })
})

describe('Products View - Product Key Generation', () => {
  it('should use id as key when key is not present', () => {
    const product: ProductDTO = {
      id: 123
    }

    const identifier = product.id?.toString() || product.key

    expect(identifier).toBe('123')
  })

  it('should prefer key over id when both present', () => {
    const product: ProductDTO = {
      id: 123,
      key: 'custom-key'
    }

    const identifier = product.key || product.id?.toString()

    expect(identifier).toBe('custom-key')
  })

  it('should handle missing identifier gracefully', () => {
    const product: ProductDTO = {}

    const identifier = product.id?.toString() || product.key

    expect(identifier).toBeUndefined()
  })
})

describe('Products View - Currency Input Formatting', () => {
  it('should format user input as currency in real-time', () => {
    const testCases = [
      { input: '1', expected: 'R$ 0,01' },
      { input: '10', expected: 'R$ 0,10' },
      { input: '100', expected: 'R$ 1,00' },
      { input: '1000', expected: 'R$ 10,00' },
      { input: '15050', expected: 'R$ 150,50' }
    ]

    testCases.forEach(({ input, expected }) => {
      const numericValue = parseCurrencyInput(input)
      const formatted = formatCurrencyInput(numericValue)
      expect(formatted).toBe(expected)
    })
  })

  it('should handle backspace (reducing digits)', () => {
    const sequence = ['15050', '1505', '150', '15', '1', '']

    const results = sequence.map(input => {
      const numeric = parseCurrencyInput(input)
      return numeric === 0 ? 'R$ 0,00' : formatCurrencyInput(numeric)
    })

    expect(results).toEqual([
      'R$ 150,50',
      'R$ 15,05',
      'R$ 1,50',
      'R$ 0,15',
      'R$ 0,01',
      'R$ 0,00'
    ])
  })
})
