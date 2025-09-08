import api from './api'
import type { PaginatedResponse, PaginationParams } from './order'

export interface ProductDTO {
  id?: number
  key?: string
  name?: string
  category?: string
  type?: string
  sheets?: number
  kit?: number
  width?: number
  height?: number
  weight?: number
  measure?: number
  color?: string
  cost?: number
  price?: number
  profit?: number
  laborValue?: number
  createdDate?: string
  installments?: any[]
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
    console.log('getAll - Response data:', response.data)
    if (response.data?.content && response.data.content.length > 0) {
      console.log('getAll - First product kit:', response.data.content[0]?.kit)
    }
    return response.data
  },
  
  getAllNonPaginated: async (params?: { type?: string; color?: string }) => {
    const queryParams = new URLSearchParams()
    
    if (params?.type) queryParams.append('type', params.type)
    if (params?.color) queryParams.append('color', params.color)
    
    const url = queryParams.toString() ? `/products?${queryParams.toString()}` : '/products'
    const response = await api.get(url)
    return response.data
  },
  
  getByKey: async (key: string) => {
    const response = await api.get(`/products/${key}`)
    console.log('getByKey - Response data:', response.data)
    console.log('getByKey - Kit value:', response.data?.kit)
    return response.data
  },
  
  create: async (product: ProductDTO) => {
    const response = await api.post('/products', product)
    return response.data
  },
  
  update: async (key: string, product: ProductDTO) => {
    console.log('ProductService.update - Key:', key)
    console.log('ProductService.update - Product payload:', JSON.stringify(product, null, 2))
    console.log('ProductService.update - Kit value:', product.kit)
    const response = await api.put(`/products/${key}`, product)
    return response.data
  },
  
  delete: async (key: string) => {
    const response = await api.delete(`/products/${key}`)
    return response.data
  },
  
  search: async (params: { query: string; type?: string; color?: string; page?: number; size?: number }) => {
    const response = await api.get('/products/search', { params })
    return response.data
  }
}

export default productService