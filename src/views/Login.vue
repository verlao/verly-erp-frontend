<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="max-w-md w-full p-6 bg-card rounded-lg shadow-md border border-border">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-foreground">Verly ERP</h1>
        <p class="text-muted-foreground mt-2">Faça login para acessar o sistema</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div v-if="authStore.error" class="p-4 mb-4 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-lg">
          {{ authStore.error }}
        </div>
        
        <div>
          <label for="username" class="block text-sm font-medium text-foreground">Usuário</label>
          <input 
            id="username" 
            v-model="username" 
            type="text" 
            required 
            class="mt-1 block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-foreground">Senha</label>
          <input 
            id="password" 
            v-model="password" 
            type="password" 
            required 
            class="mt-1 block w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
          />
        </div>
        
        <div>
          <button 
            type="submit" 
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="authStore.loading"
          >
            <span v-if="authStore.loading">Carregando...</span>
            <span v-else>Entrar</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const redirectPath = ref('/dashboard')

// Capturar o caminho de redirecionamento se existir
onMounted(() => {
  if (route.query.redirect) {
    redirectPath.value = route.query.redirect as string
    // Se houver um redirecionamento, significa que o usuário tentou acessar uma página protegida
    // Só mostrar mensagem se não houver token (usuário não está autenticado)
    if (!authStore.token && !authStore.error) {
      authStore.error = 'Por favor, faça login para acessar o sistema'
    }
  }
})

const handleLogin = async () => {
  // Limpar mensagens de erro anteriores
  authStore.error = null
  
  const success = await authStore.login(username.value, password.value)
  if (success) {
    // Redirecionar para a página que o usuário tentou acessar ou para o dashboard
    router.push(redirectPath.value)
  } else {
    // Se o login falhar, limpar a senha para facilitar nova tentativa
    password.value = ''
  }
}
</script>