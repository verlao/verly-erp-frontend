import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import { useAuthStore } from './stores/auth'


const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Inicializar a autenticação antes de montar o app
const authStore = useAuthStore()
authStore.initializeAuth()

app.use(router)

// Inicializar o tema após montar o app
app.mount('#app')
