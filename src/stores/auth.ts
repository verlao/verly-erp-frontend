import { defineStore } from 'pinia'
import axios from 'axios'

interface User {
  id: number
  username: string
  roles: string[]
}

interface AuthState {
  token: string | null
  user: User | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    let user = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== 'undefined' && userStr !== 'null') {
        user = JSON.parse(userStr);
      }
    } catch (e) {
      console.error('Erro ao fazer parse do usuário:', e);
      localStorage.removeItem('user');
    }

    return {
      token: localStorage.getItem('token'),
      user,
      loading: false,
      error: null
    };
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    getUser: (state) => state.user,
    isAdmin: (state) => state.user?.roles.includes('ROLE_ADMIN') || false
  },
  actions: {
    async login(username: string, password: string) {
      this.loading = true
      this.error = null

      try {
        const api = (await import('../services/api')).default
        const response = await api.post('/login-v2', { username, password })

        if (!response.data || !response.data.accessToken) {
          throw new Error('Resposta de autenticação inválida')
        }

        const { accessToken, username: responseUsername, roles = [] } = response.data
        const user = { 
          username: responseUsername, 
          id: 0, 
          roles: Array.isArray(roles) ? roles : [] 
        }

        this.token = accessToken
        this.user = user

        localStorage.setItem('token', accessToken)
        localStorage.setItem('user', JSON.stringify(user))

        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

        return true
      } catch (error: any) {
        this.token = null
        this.user = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        // Definir mensagem de erro amigável
        if (error.response?.status === 401) {
          this.error = 'Usuário ou senha incorreta'
        } else if (error.code === 'ERR_NETWORK') {
          this.error = 'Erro de conexão. Verifique sua internet ou tente novamente mais tarde.'
        } else {
          this.error = error.response?.data?.message || 'Erro ao fazer login. Tente novamente.'
        }
        
        return false
      } finally {
        this.loading = false
      }
    },
    
    logout() {
      this.token = null
      this.user = null
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      delete axios.defaults.headers.common['Authorization']
    },
    
    initializeAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
    }
  }
})