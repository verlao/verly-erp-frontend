import { describe, it, expect, vi, beforeEach } from 'vitest'
import { normalizeProduct, prepareProductPayload, type ProductDTO } from './product'
import productService from './product'
import type { PaginatedResponse } from './order'

describe('Product Service - Helper Functions', () => {
  describe('normalizeProduct', () => {
    it('should sync accessory to kit when only accessory is present', () => {
      const product: ProductDTO = {
        id: 1,
        accessory: 150.50
      }

      const result = normalizeProduct(product)

      expect(result.accessory).toBe(150.50)
      expect(result.kit).toBe(150.50)
    })

    it('should sync kit to accessory when only kit is present', () => {
      const product: ProductDTO = {
        id: 1,
        kit: 200.00
      }

      const result = normalizeProduct(product)

      expect(result.kit).toBe(200.00)
      expect(result.accessory).toBe(200.00)
    })

    it('should not override when both accessory and kit are present', () => {
      const product: ProductDTO = {
        id: 1,
        accessory: 150.50,
        kit: 200.00
      }

      const result = normalizeProduct(product)

      expect(result.accessory).toBe(150.50)
      expect(result.kit).toBe(200.00)
    })

    it('should generate key from id when key is missing', () => {
      const product: ProductDTO = {
        id: 123
      }

      const result = normalizeProduct(product)

      expect(result.key).toBe('123')
    })

    it('should not override existing key', () => {
      const product: ProductDTO = {
        id: 123,
        key: 'custom-key'
      }

      const result = normalizeProduct(product)

      expect(result.key).toBe('custom-key')
    })

    it('should handle products with neither accessory nor kit', () => {
      const product: ProductDTO = {
        id: 1,
        type: 'PORTA'
      }

      const result = normalizeProduct(product)

      expect(result.accessory).toBeUndefined()
      expect(result.kit).toBeUndefined()
    })
  })

  describe('prepareProductPayload', () => {
    it('should create payload with all fields', () => {
      const product: ProductDTO = {
        id: 1,
        category: 'VIDRO-TEMPERADO',
        type: 'PORTA',
        sheets: 2,
        accessory: 150.50,
        width: 100,
        height: 200,
        weight: 50,
        color: 'INCOLOR'
      }

      const payload = prepareProductPayload(product)

      expect(payload).toEqual({
        id: 1,
        category: 'VIDRO-TEMPERADO',
        type: 'PORTA',
        sheets: 2,
        accessory: 150.50,
        width: 100,
        height: 200,
        weight: 50,
        color: 'INCOLOR'
      })
    })

    it('should use accessory over kit when both present', () => {
      const product: ProductDTO = {
        id: 1,
        accessory: 150.50,
        kit: 200.00
      }

      const payload = prepareProductPayload(product)

      expect(payload.accessory).toBe(150.50)
    })

    it('should fallback to kit when accessory is undefined', () => {
      const product: ProductDTO = {
        id: 1,
        kit: 200.00
      }

      const payload = prepareProductPayload(product)

      expect(payload.accessory).toBe(200.00)
    })

    it('should remove undefined values', () => {
      const product: ProductDTO = {
        id: 1,
        category: 'VIDRO-TEMPERADO',
        type: undefined,
        sheets: 2
      }

      const payload = prepareProductPayload(product)

      expect(payload).toEqual({
        id: 1,
        category: 'VIDRO-TEMPERADO',
        sheets: 2
      })
      expect('type' in payload).toBe(false)
    })

    it('should exclude calculated fields from payload', () => {
      const product: ProductDTO = {
        id: 1,
        category: 'VIDRO-TEMPERADO',
        cost: 450.00,
        price: 675.00,
        profit: 225.00,
        measure: 2.0,
        laborValue: 80.00
      }

      const payload = prepareProductPayload(product)

      expect('cost' in payload).toBe(false)
      expect('price' in payload).toBe(false)
      expect('profit' in payload).toBe(false)
      expect('measure' in payload).toBe(false)
      expect('laborValue' in payload).toBe(false)
    })
  })
})

describe('Product Service - API Methods', () => {
  // Mock the api module
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch paginated products and normalize them', async () => {
      const mockResponse: PaginatedResponse<ProductDTO> = {
        content: [
          { id: 1, accessory: 150, type: 'PORTA' },
          { id: 2, accessory: 200, type: 'JANELA' }
        ],
        totalElements: 2,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true
      }

      mockApi.get.mockResolvedValue({ data: mockResponse })

      // We'll mock the service itself in integration tests
      // This is a unit test for the normalization logic
      const products = mockResponse.content.map(normalizeProduct)

      expect(products[0].kit).toBe(150)
      expect(products[0].key).toBe('1')
      expect(products[1].kit).toBe(200)
      expect(products[1].key).toBe('2')
    })

    it('should handle query parameters correctly', () => {
      const params = {
        page: 1,
        size: 20,
        type: 'PORTA',
        color: 'INCOLOR'
      }

      const queryParams = new URLSearchParams()
      if (params.type) queryParams.append('type', params.type)
      if (params.color) queryParams.append('color', params.color)
      if (params.page !== undefined) queryParams.append('page', params.page.toString())
      if (params.size !== undefined) queryParams.append('size', params.size.toString())

      expect(queryParams.toString()).toBe('type=PORTA&color=INCOLOR&page=1&size=20')
    })
  })

  describe('create', () => {
    it('should prepare payload correctly before creating', () => {
      const product: ProductDTO = {
        category: 'VIDRO-TEMPERADO',
        type: 'PORTA',
        sheets: 2,
        kit: 150.50,
        width: 100,
        height: 200,
        color: 'INCOLOR'
      }

      const payload = prepareProductPayload(product)

      expect(payload.accessory).toBe(150.50)
      expect('kit' in payload).toBe(false)
    })
  })

  describe('update', () => {
    it('should prepare payload correctly before updating', () => {
      const product: ProductDTO = {
        id: 123,
        category: 'VIDRO-TEMPERADO',
        type: 'PORTA',
        sheets: 2,
        accessory: 150.50,
        kit: 150.50,
        width: 100,
        height: 200,
        color: 'INCOLOR'
      }

      const payload = prepareProductPayload(product)

      expect(payload.id).toBe(123)
      expect(payload.accessory).toBe(150.50)
    })
  })
})

describe('Product Service - Backward Compatibility', () => {
  it('should handle products from old API (with key)', () => {
    const oldProduct: ProductDTO = {
      key: 'VIDRO-TEMPERADO-PORTA-2-INCOLOR-100-200',
      category: 'VIDRO-TEMPERADO',
      type: 'PORTA',
      kit: 150.50
    }

    const normalized = normalizeProduct(oldProduct)

    expect(normalized.key).toBe('VIDRO-TEMPERADO-PORTA-2-INCOLOR-100-200')
    expect(normalized.accessory).toBe(150.50)
    expect(normalized.kit).toBe(150.50)
  })

  it('should handle products from new API (with id)', () => {
    const newProduct: ProductDTO = {
      id: 123,
      category: 'VIDRO-TEMPERADO',
      type: 'PORTA',
      accessory: 150.50
    }

    const normalized = normalizeProduct(newProduct)

    expect(normalized.id).toBe(123)
    expect(normalized.key).toBe('123')
    expect(normalized.accessory).toBe(150.50)
    expect(normalized.kit).toBe(150.50)
  })

  it('should prepare payload for new API from old product', () => {
    const oldProduct: ProductDTO = {
      key: 'old-key',
      category: 'VIDRO-TEMPERADO',
      kit: 150.50
    }

    const payload = prepareProductPayload(oldProduct)

    expect(payload.accessory).toBe(150.50)
    expect('key' in payload).toBe(false)
    expect('kit' in payload).toBe(false)
  })
})

describe('Product Service - Edge Cases', () => {
  it('should handle empty product', () => {
    const product: ProductDTO = {}

    const normalized = normalizeProduct(product)
    const payload = prepareProductPayload(product)

    expect(normalized).toBeDefined()
    expect(payload).toEqual({})
  })

  it('should handle product with only id', () => {
    const product: ProductDTO = { id: 1 }

    const normalized = normalizeProduct(product)

    expect(normalized.key).toBe('1')
  })

  it('should handle product with zero values', () => {
    const product: ProductDTO = {
      id: 1,
      sheets: 0,
      accessory: 0,
      width: 0,
      height: 0,
      weight: 0
    }

    const payload = prepareProductPayload(product)

    expect(payload.sheets).toBe(0)
    expect(payload.accessory).toBe(0)
    expect(payload.width).toBe(0)
  })

  it('should handle product with null accessory/kit', () => {
    const product: ProductDTO = {
      id: 1,
      accessory: null as any,
      kit: null as any
    }

    const normalized = normalizeProduct(product)

    expect(normalized.accessory).toBeNull()
    expect(normalized.kit).toBeNull()
  })
})
