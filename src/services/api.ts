import axios from 'axios'

// Configuração de URL - alterne entre produção e desenvolvimento conforme necessário
// export const apiUrl = 'https://verly-service-production.up.railway.app/verly-service'
export const apiUrl = 'http://localhost:8080/verly-service'

// Para desenvolvimento, você pode usar a variável de ambiente:
// export const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/verly-service'

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