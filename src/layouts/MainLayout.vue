<template>
  <div class="min-h-screen">
    <!-- Mobile overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobile && isMobileMenuOpen"
        class="fixed inset-0 bg-black/50 z-40"
        @click="isMobileMenuOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <aside :class="sidebarClasses">
      <div class="p-4 border-b border-border flex items-center justify-between">
        <h1 :class="['font-bold text-foreground transition-opacity duration-300', sidebarNarrow ? 'opacity-0 w-0' : 'opacity-100 text-xl']">Verly ERP</h1>
        <!-- Close button mobile / Collapse button desktop -->
        <button
          @click="isMobile ? (isMobileMenuOpen = false) : toggleSidebar()"
          class="p-1.5 rounded-md hover:bg-accent transition-colors flex-shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="['transition-transform duration-300', !isMobile && isSidebarCollapsed ? 'rotate-180' : '']"
          >
            <path v-if="isMobile" d="M18 6 6 18M6 6l12 12"/>
            <path v-else d="m15 18-6-6 6-6"/>
          </svg>
        </button>
      </div>
      <nav class="mt-4 space-y-1 px-2">
        <router-link to="leads" custom v-slot="{ navigate, isActive }">
          <Button
            @click="handleNavClick(navigate)"
            :variant="isActive ? 'secondary' : 'ghost'"
            class="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <span class="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
            <span :class="{ 'sr-only': sidebarNarrow }">Leads</span>
          </Button>
        </router-link>

        <router-link to="customers" custom v-slot="{ navigate, isActive }">
          <Button
            @click="handleNavClick(navigate)"
            :variant="isActive ? 'secondary' : 'ghost'"
            class="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <span class="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
            <span :class="{ 'sr-only': sidebarNarrow }">Clientes</span>
          </Button>
        </router-link>

        <router-link to="products" custom v-slot="{ navigate, isActive }">
          <Button
            @click="handleNavClick(navigate)"
            :variant="isActive ? 'secondary' : 'ghost'"
            class="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <span class="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            </span>
            <span :class="{ 'sr-only': sidebarNarrow }">Produtos</span>
          </Button>
        </router-link>

        <router-link to="quotes" custom v-slot="{ navigate, isActive }">
          <Button
            @click="handleNavClick(navigate)"
            :variant="isActive ? 'secondary' : 'ghost'"
            class="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <span class="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
              </svg>
            </span>
            <span :class="{ 'sr-only': sidebarNarrow }">Orçamentos</span>
          </Button>
        </router-link>

        <router-link to="orders" custom v-slot="{ navigate, isActive }">
          <Button
            @click="handleNavClick(navigate)"
            :variant="isActive ? 'secondary' : 'ghost'"
            class="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <span class="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
            </span>
            <span :class="{ 'sr-only': sidebarNarrow }">Pedidos</span>
          </Button>
        </router-link>

        <router-link to="ledger" custom v-slot="{ navigate, isActive }">
          <Button
            @click="handleNavClick(navigate)"
            :variant="isActive ? 'secondary' : 'ghost'"
            class="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <span class="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-text"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
            </span>
            <span :class="{ 'sr-only': sidebarNarrow }">Lançamentos</span>
          </Button>
        </router-link>

        <router-link v-if="authStore.isAdmin" to="users" custom v-slot="{ navigate, isActive }">
          <Button
            @click="handleNavClick(navigate)"
            :variant="isActive ? 'secondary' : 'ghost'"
            class="w-full justify-start transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <span class="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
            </span>
            <span :class="{ 'sr-only': sidebarNarrow }">Usuários</span>
          </Button>
        </router-link>
      </nav>
      <div :class="['absolute bottom-0 p-4 border-t border-border', sidebarNarrow ? 'w-16' : 'w-64']">
        <Button @click="logout" variant="ghost" class="w-full justify-start text-destructive hover:text-destructive-foreground hover:bg-destructive">
          <span class="mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          </span>
          <span :class="{ 'sr-only': sidebarNarrow }">Sair</span>
        </Button>
      </div>
    </aside>

    <!-- Main Content -->
    <div :class="['min-h-screen flex flex-col transition-all duration-300 ease-in-out', isMobile ? 'ml-0' : (isSidebarCollapsed ? 'ml-16' : 'ml-64')]">
      <header class="bg-background shadow-sm z-10 border-b border-border">
        <div class="px-4 md:px-6 py-4 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <!-- Hamburger button (mobile only) -->
            <button
              v-if="isMobile"
              @click="isMobileMenuOpen = true"
              class="p-1.5 rounded-md hover:bg-accent transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
              </svg>
            </button>
            <h2 class="text-xl md:text-2xl font-bold text-foreground">{{ pageTitle }}</h2>
          </div>
          <div class="flex items-center space-x-2 md:space-x-4">
            <ThemeToggle />
            <DropdownMenu>
              <template #trigger>
                <Button variant="ghost" class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span class="text-primary-foreground font-semibold text-sm">{{ user?.username?.charAt(0)?.toUpperCase() }}</span>
                  </div>
                  <span class="hidden md:block text-foreground">{{ user?.username }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down text-foreground hidden md:block">
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
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-muted/30 p-4 md:p-6 h-[calc(100vh-80px)]">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import Button from '../components/ui/Button.vue'
import DropdownMenu from '../components/ui/DropdownMenu.vue'
import ThemeToggle from '../components/ui/ThemeToggle.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const user = computed(() => authStore.getUser)
const isSidebarCollapsed = ref(false)
const isManuallyToggled = ref(false)
const isMobileMenuOpen = ref(false)
const isMobile = ref(false)

// Computed: sidebar should show narrow icons (desktop collapsed only)
const sidebarNarrow = computed(() => !isMobile.value && isSidebarCollapsed.value)

// Computed: sidebar classes
const sidebarClasses = computed(() => {
  const base = 'bg-sidebar border-r border-border fixed top-0 left-0 h-screen z-50 transition-all duration-300 ease-in-out'
  if (isMobile.value) {
    return `${base} w-64 ${isMobileMenuOpen.value ? 'translate-x-0' : '-translate-x-full'}`
  }
  return `${base} ${isSidebarCollapsed.value ? 'w-16' : 'w-64'}`
})

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  isManuallyToggled.value = true
}

const handleNavClick = (navigate: () => void) => {
  navigate()
  if (isMobile.value) {
    isMobileMenuOpen.value = false
  }
}

const updateScreenSize = () => {
  const width = window.innerWidth
  isMobile.value = width < 768

  if (isMobile.value) {
    isMobileMenuOpen.value = false
  } else if (!isManuallyToggled.value) {
    isSidebarCollapsed.value = width < 1024
  }
}

onMounted(() => {
  updateScreenSize()
  window.addEventListener('resize', updateScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
})

const pageTitle = computed(() => {
  if (route.path.endsWith('dashboard')) {
    return 'Dashboard'
  } else if (route.path.endsWith('customers')) {
    return 'Clientes'
  } else if (route.path.endsWith('products')) {
    return 'Produtos'
  } else if (route.path.endsWith('quotes')) {
    return 'Orçamentos'
  } else if (route.path.endsWith('orders')) {
    return 'Pedidos'
  } else if (route.path.endsWith('ledger')) {
    return 'Lançamentos Contábeis'
  } else if (route.path.endsWith('leads')) {
    return 'Leads'
  } else if (route.path.endsWith('users')) {
    return 'Usuários'
  } else {
    return 'Verly ERP'
  }
})

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script>
