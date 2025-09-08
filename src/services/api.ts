import axios from 'axios'

// Configuração de URL usando variáveis de ambiente
// Para produção: VITE_API_URL=https://api.verlyvidracaria.com/verly-service
// Para desenvolvimento: usa localhost como fallback
export const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/verly-service'

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use(
  config => {
    console.log('Interceptor de requisição:', config.method?.toUpperCase(), config.url)
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Token adicionado à requisição')
    } else {
      console.log('Nenhum token encontrado')
    }
    return config
  },
  error => {
    console.error('Erro no interceptor de requisição:', error)
    return Promise.reject(error)
  }
)

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default api