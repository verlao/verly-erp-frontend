import api from './api'

export interface CepResponse {
  cep: string
  logradouro: string
  complemento?: string
  bairro: string
  localidade: string
  uf: string
  ibge?: string
  gia?: string
  ddd?: string
  siafi?: string
}

export interface CepValidationResponse {
  valido: boolean
  endereco?: CepResponse
  erro?: string
}

class CepService {
  async buscarCep(cep: string): Promise<CepResponse | null> {
    try {
      const response = await api.get(`/cep/${cep}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      return null
    }
  }

  async buscarCepComEstrategia(cep: string, estrategia: string = 'default'): Promise<CepResponse | null> {
    try {
      const response = await api.get(`/cep/buscar`, {
        params: { cep, estrategia }
      })
      return response.data
    } catch (error) {
      console.error('Erro ao buscar CEP com estratégia:', error)
      return null
    }
  }

  async validarCep(cep: string): Promise<CepValidationResponse> {
    try {
      const response = await api.post(`/cep/validar`, { cep })
      return response.data
    } catch (error) {
      console.error('Erro ao validar CEP:', error)
      return {
        valido: false,
        erro: 'Erro ao validar CEP'
      }
    }
  }

  async verificarStatusServicos(): Promise<string> {
    try {
      const response = await api.get(`/cep/status`)
      return response.data.status
    } catch (error) {
      console.error('Erro ao verificar status dos serviços:', error)
      return 'Erro ao verificar status'
    }
  }

  formatarCep(cep: string): string {
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/[^0-9]/g, '')
    
    // Aplica máscara XXXXX-XXX
    if (cepLimpo.length === 8) {
      return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`
    }
    
    return cepLimpo
  }

  validarFormatoCep(cep: string): boolean {
    const cepLimpo = cep.replace(/[^0-9]/g, '')
    return cepLimpo.length === 8
  }
}

export default new CepService()