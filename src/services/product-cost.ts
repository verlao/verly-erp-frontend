import api from './api'

export interface ProductCostDTO {
  id?: number
  incolor: number
  fume: number
  verde: number
  bronze?: number
  ganhoPorta2Folhas: number
  ganhoPorta4Folhas: number
  ganhoPorta1Folha: number
  ganhoBox2Folhas: number
  ganhoBox4Folhas: number
  ganhoBox1Folha: number
  ganhoJanela2Folhas: number
  ganhoJanela4Folhas: number
  ganhoJanela1Folha: number
  box1FolhaMDO: number
  box2FolhasMDO: number
  box4FolhasMDO: number
  janela1FolhaMDO: number
  janela2FolhasMDO: number
  janela4FolhasMDO: number
  porta1FolhaMDO: number
  porta2FolhasMDO: number
  porta4FolhasMDO: number
  // Novos campos simplificados
  gainDoor?: number
  laborDoor?: number
  gainWindow?: number
  laborWindow?: number
  gainBalcony?: number
  laborBalcony?: number
  gainTilting?: number
  laborTilting?: number
  gainFixed?: number
  laborFixed?: number
  gainBox?: number
  laborBox?: number
}

const productCostService = {
  getAll: async () => {
    const response = await api.get('/product-costs')
    return response.data
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/product-costs/${id}`)
    return response.data
  },
  
  create: async (productCost: Omit<ProductCostDTO, 'id'>) => {
    const response = await api.post('/product-costs', productCost)
    return response.data
  },
  
  update: async (productCost: ProductCostDTO) => {
    console.log('productCostService.update chamado com:', productCost)
    console.log('URL completa da requisição:', `${api.defaults.baseURL}/product-costs/${productCost.id}`)
    try {
      const response = await api.put(`/product-costs/${productCost.id}`, productCost)
      console.log('productCostService.update - resposta:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Erro em productCostService.update:', error)
      console.error('Detalhes do erro:', error.response?.data)
      console.error('Status do erro:', error.response?.status)
      throw error
    }
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/product-costs/${id}`)
    return response.data
  }
}

export default productCostService