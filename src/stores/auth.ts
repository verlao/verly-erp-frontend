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
      console.log('=== STORE INITIALIZATION ===')
      console.log('userStr from localStorage:', userStr)

      if (userStr && userStr !== 'undefined' && userStr !== 'null') {
        user = JSON.parse(userStr);
        console.log('Parsed user:', user)
        console.log('User roles:', user?.roles)
        console.log('User roles type:', typeof user?.roles)
        console.log('User roles isArray:', Array.isArray(user?.roles))
      } else {
        console.log('No valid user in localStorage')
      }
      console.log('============================')
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
    isAdmin: (state) => state.user?.roles.includes('ROLE_ADMIN') || false
  },
  actions: {
    async login(username: string, password: string) {
      this.loading = true
      this.error = null

      try {
        // Importar a instância api configurada
        const api = (await import('../services/api')).default
        const response = await api.post('/login-v2', { username, password })

        // Logs detalhados para debug
        console.log('=== LOGIN DEBUG ===')
        console.log('Response completo:', response)
        console.log('Response.data:', response.data)
        console.log('Response.data type:', typeof response.data)
        console.log('Response.data.roles:', response.data?.roles)
        console.log('Response.data.roles type:', typeof response.data?.roles)
        console.log('Response.data.roles isArray:', Array.isArray(response.data?.roles))
        console.log('===================')

        // Verificar se a resposta contém os dados necessários
        if (!response.data || !response.data.accessToken) {
          throw new Error('Resposta de autenticação inválida')
        }

        const responseData = response.data
        const accessToken = responseData.accessToken
        const responseUsername = responseData.username
        const responseRoles = responseData.roles || [] // Pegar roles do backend

        console.log('Roles extraídos:', responseRoles)
        console.log('Roles extraídos length:', responseRoles.length)

        const token = accessToken
        const user = { username: responseUsername, id: 0, roles: responseRoles }

        console.log('User object criado:', user)
        console.log('User.roles:', user.roles)

        this.token = token
        this.user = user

        // Limpar localStorage antes de adicionar novos valores
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        // Salvar novos valores
        localStorage.setItem('token', token)
        const userJson = JSON.stringify(user)
        console.log('Salvando user no localStorage:', userJson)
        localStorage.setItem('user', userJson)

        // Verificar o que foi salvo
        const savedUser = localStorage.getItem('user')
        console.log('User salvo no localStorage:', savedUser)
        console.log('User parsed do localStorage:', JSON.parse(savedUser!))

        // Não precisa configurar axios.defaults aqui
        // O interceptor em api.ts já pega o token do localStorage automaticamente
        // axios.defaults.headers.common['Authorization'] = `Bearer ${token}` // REMOVIDO

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
      
      // Não precisa deletar axios.defaults, o interceptor cuida disso
      // delete axios.defaults.headers.common['Authorization'] // REMOVIDO
    },
    
    initializeAuth() {
      // O interceptor em api.ts já pega o token automaticamente
      // Não precisa configurar axios.defaults aqui
      const token = localStorage.getItem('token')
      console.log('initializeAuth: token encontrado =', !!token)
      // if (token) {
      //   axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // }
    }
  }
})