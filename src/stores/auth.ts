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
      // Verificar se há um item 'user' no localStorage e se é uma string válida
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== 'undefined' && userStr !== 'null') {
        user = JSON.parse(userStr);
      }
    } catch (e) {
      console.error('Erro ao fazer parse do usuário:', e);
      // Limpar o item inválido do localStorage
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
    isAdmin: (state) => state.user?.roles.includes('ADMIN') || false
  },
  actions: {
    async login(username: string, password: string) {
      this.loading = true
      this.error = null
      
      try {
        // Importar a instância api configurada
        const api = (await import('../services/api')).default
        const response = await api.post('/login-v2', { username, password })
        console.log('Login response:', response.data) // Adicionado para depuração
        
        // Verificar se a resposta contém os dados necessários
        if (!response.data || !response.data.accessToken) {
          throw new Error('Resposta de autenticação inválida')
        }
        
        const responseData = response.data
        const accessToken = responseData.accessToken
        const responseUsername = responseData.username
        const token = accessToken
        const user = { username: responseUsername, id: 0, roles: [] } // Criar objeto user básico
        
        this.token = token
        this.user = user
        
        // Limpar localStorage antes de adicionar novos valores
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        // Salvar novos valores
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        return true
      } catch (error: any) {
        // Limpar localStorage em caso de erro
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        
        this.error = error.response?.data?.message || 'Credenciais inválidas. Por favor, verifique seu usuário e senha.'
        console.error('Erro de login:', error)
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