<template>
  <div class="min-h-screen">
    <!-- Sidebar -->
    <aside @click="handleSidebarClick" :class="['bg-sidebar border-r border-border transition-all duration-300 ease-in-out cursor-pointer fixed top-0 left-0 h-screen z-50', isSidebarCollapsed ? 'w-16' : 'w-64']">
      <div class="p-4 border-b border-border flex items-center justify-between">
        <h1 :class="['font-bold text-foreground transition-opacity duration-300', isSidebarCollapsed ? 'opacity-0' : 'opacity-100 text-xl']">Verly ERP</h1>
      </div>
      <nav class="mt-4 space-y-1 px-2">
        <router-link to="leads" custom v-slot="{ navigate, isActive }">
          <Button
            @click="navigate"
            :variant="isActive ? 'secondary' : 'ghost'"
            class="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <span class="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
            <span :class="{ 'sr-only': isSidebarCollapsed }">Leads</span>
          </Button>
        </router-link>
        
        <router-link to="dashboard" custom v-slot="{ navigate, isActive }">
          <Button
            @click="navigate"
            :variant="isActive ? 'secondary' : 'ghost'"
            class="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <span class="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-dashboard"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            </span>
            <span :class="{ 'sr-only': isSidebarCollapsed }">Dashboard</span>
          </Button>
        </router-link>
        
        <router-link to="customers" custom v-slot="{ navigate, isActive }">
          <Button
            @click="navigate"
            :variant="isActive ? 'secondary' : 'ghost'"
            class="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <span class="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
            <span :class="{ 'sr-only': isSidebarCollapsed }">Clientes</span>
          </Button>
        </router-link>
        
        <router-link to="products" custom v-slot="{ navigate, isActive }">
          <Button
            @click="navigate"
            :variant="isActive ? 'secondary' : 'ghost'"
            class="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <span class="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            </span>
            <span :class="{ 'sr-only': isSidebarCollapsed }">Produtos</span>
          </Button>
        </router-link>
        
        <router-link to="orders" custom v-slot="{ navigate, isActive }">
          <Button
            @click="navigate"
            :variant="isActive ? 'secondary' : 'ghost'"
            class="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <span class="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
            </span>
            <span :class="{ 'sr-only': isSidebarCollapsed }">Pedidos</span>
          </Button>
        </router-link>
        
        <router-link to="cash-flow" custom v-slot="{ navigate, isActive }">
          <Button
            @click="navigate"
            :variant="isActive ? 'secondary' : 'ghost'"
            class="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <span class="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-banknote"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
            </span>
            <span :class="{ 'sr-only': isSidebarCollapsed }">Fluxo de Caixa</span>
          </Button>
        </router-link>
        
        <router-link to="cost-selection" custom v-slot="{ navigate, isActive }">
          <Button
            @click="navigate"
            :variant="isActive ? 'secondary' : 'ghost'"
            class="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <span class="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calculator"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
            </span>
            <span :class="{ 'sr-only': isSidebarCollapsed }">Custos</span>
          </Button>
        </router-link>
        
        <router-link to="cart" custom v-slot="{ navigate, isActive }">
          <Button
            @click="navigate"
            :variant="isActive ? 'secondary' : 'ghost'"
            class="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <span class="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="m2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L23 6H6"/></svg>
            </span>
            <span :class="{ 'sr-only': isSidebarCollapsed }">Carrinho</span>
          </Button>
        </router-link>
      </nav>
      <div :class="['absolute bottom-0 p-4 border-t border-border', isSidebarCollapsed ? 'w-16' : 'w-64']">
        <Button @click="logout" variant="ghost" class="w-full justify-start text-destructive hover:text-destructive-foreground hover:bg-destructive">
          <span class="mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          </span>
          <span :class="{ 'sr-only': isSidebarCollapsed }">Sair</span>
        </Button>
      </div>
    </aside>

    <!-- Main Content -->
    <div :class="['min-h-screen flex flex-col transition-all duration-300 ease-in-out', isSidebarCollapsed ? 'ml-16' : 'ml-64']">
            <header class="bg-background shadow-sm z-10 border-b border-border">
        <div class="px-6 py-4 flex justify-between items-center">
          <h2 class="text-2xl font-bold text-foreground">{{ pageTitle }}</h2>
          <div class="flex items-center space-x-4">
            <CartIcon />

            <DropdownMenu>
              <template #trigger>
                <Button variant="ghost" class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span class="text-primary-foreground font-semibold text-sm">{{ user?.username?.charAt(0)?.toUpperCase() }}</span>
                  </div>
                  <span class="hidden md:block text-foreground">{{ user?.username }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down text-foreground">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </Button>
              </template>
              <template #content>
                <div class="w-48 bg-popover border border-border rounded-md shadow-lg">
                  <div class="px-4 py-2 text-sm text-muted-foreground border-b border-border">
                    Logado como <span class="font-semibold">{{ user?.username }}</span>
                  </div>
                  <button @click="logout" class="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors">
                    Sair
                  </button>
                </div>
              </template>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 h-[calc(100vh-80px)]">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import Button from '../components/ui/Button.vue'
import DropdownMenu from '../components/ui/DropdownMenu.vue'
import CartIcon from '../components/CartIcon.vue'


const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()


const user = computed(() => authStore.getUser)
const isSidebarCollapsed = ref(false)

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const handleSidebarClick = (event: Event) => {
  // Verifica se o clique foi em um botão ou elemento interativo
  const target = event.target as HTMLElement
  if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
    return // Não colapsa se clicou em um botão
  }
  toggleSidebar()
}



const pageTitle = computed(() => {
  if (route.path.endsWith('dashboard')) {
    return 'Dashboard'
  } else if (route.path.endsWith('customers')) {
    return 'Clientes'
  } else if (route.path.endsWith('products')) {
    return 'Produtos'
  } else if (route.path.endsWith('orders')) {
    return 'Pedidos'
  } else if (route.path.endsWith('cash-flow')) {
    return 'Fluxo de Caixa'
  } else if (route.path.endsWith('leads')) {
    return 'Leads'
  } else if (route.path.endsWith('cost-selection')) {
    return 'Gerenciar Custos'
  } else if (route.path.endsWith('costs')) {
    return 'Custos de Vidro'
  } else if (route.path.endsWith('credit-card-costs')) {
    return 'Taxas de Cartão'
  } else if (route.path.endsWith('cart')) {
    return 'Carrinho'
  } else {
    return 'Verly ERP'
  }
})

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script>