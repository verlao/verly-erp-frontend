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
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response?.status === 401 && !error.config.url?.includes('/login')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default api