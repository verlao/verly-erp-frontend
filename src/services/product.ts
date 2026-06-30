import api from './api'
import type { PaginatedResponse, PaginationParams } from './order'

export interface ProductDTO {
  id?: number
  key?: string // Deprecated - kept for backward compatibility
  name?: string // Optional display name
  category?: string
  type?: string
  sheets?: number
  accessory?: number // Renamed from "kit" to match backend
  kit?: number // Deprecated alias for accessory (for backward compatibility)
  width?: number
  height?: number
  weight?: number
  measure?: number // Calculated field from backend
  color?: string
  cost?: number // Calculated field from backend
  price?: number // Calculated field from backend (À vista dinheiro)
  profit?: number // Calculated field from backend
  laborValue?: number // Calculated field from backend
  gainValue?: number // Calculated field from backend
  createdDate?: string
  installments?: any[] // Calculated field from backend
  
  // Novas opções de preço (calculadas no backend)
  priceOptions?: {
    cashMoney?: number      // À vista dinheiro
    cashCard?: number       // À vista cartão
    installments4x?: number // Parcelado 4x
    installments6x?: number // Parcelado 6x
    installments10x?: number // Parcelado 10x
    installments12x?: number // Parcelado 12x
  }
}

// Helper function to normalize product data between old and new API contracts
export function normalizeProduct(product: ProductDTO): ProductDTO {
  // Sync accessory <-> kit for backward compatibility
  if (product.accessory !== undefined && product.kit === undefined) {
    product.kit = product.accessory
  } else if (product.kit !== undefined && product.accessory === undefined) {
    product.accessory = product.kit
  }

  // Use id as key if key is not present
  if (!product.key && product.id) {
    product.key = product.id.toString()
  }

  return product
}

// Helper function to prepare product payload for API
export function prepareProductPayload(product: ProductDTO): any {
  const payload: any = {
    id: product.id,
    category: product.category,
    type: product.type,
    sheets: product.sheets,
    accessory: product.accessory ?? product.kit, // Use accessory, fallback to kit
    width: product.width,
    height: product.height,
    weight: product.weight,
    color: product.color
  }

  // Remove undefined values
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined) {
      delete payload[key]
    }
  })

  return payload
}

const productService = {
  getAll: async (params?: PaginationParams & { type?: string; color?: string }): Promise<PaginatedResponse<ProductDTO>> => {
    const queryParams = new URLSearchParams()

    if (params?.type) queryParams.append('type', params.type)
    if (params?.color) queryParams.append('color', params.color)
    if (params?.page !== undefined) queryParams.append('page', params.page.toString())
    if (params?.size !== undefined) queryParams.append('size', params.size.toString())

    const url = queryParams.toString() ? `/products?${queryParams.toString()}` : '/products'
    const response = await api.get(url)

    // Normalize products for backward compatibility
    if (response.data?.content) {
      response.data.content = response.data.content.map(normalizeProduct)
    }

    return response.data
  },
  
  getAllNonPaginated: async (params?: { type?: string; color?: string }) => {
    const queryParams = new URLSearchParams()

    if (params?.type) queryParams.append('type', params.type)
    if (params?.color) queryParams.append('color', params.color)

    const url = queryParams.toString() ? `/products?${queryParams.toString()}` : '/products'
    const response = await api.get(url)

    // Normalize products for backward compatibility
    if (Array.isArray(response.data)) {
      response.data = response.data.map(normalizeProduct)
    }

    return response.data
  },

  getByKey: async (key: string) => {
    const response = await api.get(`/products/${key}`)
    return normalizeProduct(response.data)
  },

  create: async (product: ProductDTO) => {
    const payload = prepareProductPayload(product)
    const response = await api.post('/products', payload)
    return normalizeProduct(response.data)
  },

  update: async (key: string, product: ProductDTO) => {
    const payload = prepareProductPayload(product)
    const response = await api.put(`/products/${key}`, payload)
    return normalizeProduct(response.data)
  },
  
  delete: async (key: string) => {
    const response = await api.delete(`/products/${key}`)
    return response.data
  },
  
  search: async (params: { query: string; type?: string; color?: string; page?: number; size?: number }) => {
    const response = await api.get('/products/search', { params })

    // Normalize products for backward compatibility
    if (response.data?.content) {
      response.data.content = response.data.content.map(normalizeProduct)
    } else if (Array.isArray(response.data)) {
      response.data = response.data.map(normalizeProduct)
    }

    return response.data
  },

  /**
   * Calcula preço/custo/lucro pra dimensão fora do catálogo SEM persistir.
   * Usado pela calculadora rápida da página Products quando cliente pede
   * combinação tipo+cor+folhas+dims que não está cadastrada.
   */
  calculate: async (input: Pick<ProductDTO, 'category' | 'type' | 'color' | 'sheets' | 'width' | 'height'>) => {
    const response = await api.post('/products/calculate', input)
    return normalizeProduct(response.data)
  }
}

export default productService