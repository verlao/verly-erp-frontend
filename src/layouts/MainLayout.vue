<template>
  <div class="min-h-screen bg-muted/30 md:h-screen md:min-h-0 md:flex md:flex-col">
    <!-- Desktop sidebar -->
    <DesktopSidebar
      v-if="!isMobile"
      :collapsed="effectiveSidebarCollapsed"
      @update:collapsed="onSidebarToggle"
      @logout="logout"
    />

    <!-- Mobile: top bar fixa + bottom nav + drawer "Mais" -->
    <MobileTopBar v-if="isMobile" :title="pageTitle" @logout="logout" />
    <MobileMoreMenu
      v-if="isMobile"
      :open="moreOpen"
      @update:open="moreOpen = $event"
      @logout="logout"
    />
    <MobileBottomNav v-if="isMobile" @open-more="moreOpen = true" />

    <!-- Conteúdo principal -->
    <main
      :class="[
        'min-h-screen transition-all duration-300 ease-in-out',
        isMobile
          ? 'px-4'
          : [
              'h-screen min-h-0 flex flex-col',
              isLeadsRoute ? 'overflow-hidden' : 'overflow-y-auto',
              isWide && !sidebarCollapsed ? 'ml-64 p-6' : 'ml-16 p-6',
            ],
      ]"
      :style="
        isMobile
          ? {
              paddingTop: 'calc(3.5rem + env(safe-area-inset-top))',
              paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))',
            }
          : {}
      "
    >
      <!-- Desktop header (mobile usa MobileTopBar) -->
      <header
        v-if="!isMobile"
        class="bg-background shadow-sm border-b border-border -mx-6 -mt-6 mb-4 shrink-0"
      >
        <div class="px-6 py-3 flex justify-between items-center">
          <h2 class="text-xl md:text-2xl font-bold text-foreground">
            {{ pageTitle }}
          </h2>
          <DropdownMenu>
            <template #trigger>
              <Button variant="ghost" class="flex items-center space-x-2">
                <div
                  class="w-8 h-8 bg-primary rounded-full flex items-center justify-center"
                >
                  <span class="text-primary-foreground font-semibold text-sm">
                    {{ user?.username?.charAt(0)?.toUpperCase() }}
                  </span>
                </div>
                <span class="hidden md:block text-foreground">
                  {{ user?.username }}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="hidden md:block text-foreground"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </Button>
            </template>
            <template #content>
              <div class="w-48 bg-popover border border-border rounded-md shadow-lg">
                <div
                  class="px-4 py-2 text-sm text-muted-foreground border-b border-border"
                >
                  Logado como <span class="font-semibold">{{ user?.username }}</span>
                </div>
                <button
                  @click="logout"
                  class="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  Sair
                </button>
              </div>
            </template>
          </DropdownMenu>
        </div>
      </header>

      <router-view :class="isMobile ? undefined : 'flex-1 min-h-0'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useBreakpoint } from '../composables/useBreakpoint'

import Button from '../components/ui/Button.vue'
import DropdownMenu from '../components/ui/DropdownMenu.vue'
import DesktopSidebar from '../components/nav/DesktopSidebar.vue'
import MobileTopBar from '../components/nav/MobileTopBar.vue'
import MobileBottomNav from '../components/nav/MobileBottomNav.vue'
import MobileMoreMenu from '../components/nav/MobileMoreMenu.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { isMobile, isWide } = useBreakpoint()

const user = computed(() => authStore.getUser)

// Sidebar: colapsada (icon-only) por padrão; escolha do usuário persiste
// entre rotas e reloads via localStorage.
const SIDEBAR_STORAGE_KEY = 'sidebar-collapsed'

function readStoredCollapsed(): boolean {
  try {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    return stored === null ? true : stored === 'true'
  } catch {
    return true
  }
}

const sidebarCollapsed = ref(readStoredCollapsed())
const compactSidebarOpen = ref(false)
const moreOpen = ref(false)
const isLeadsRoute = computed(() => route.name === 'Leads')

const effectiveSidebarCollapsed = computed(() =>
  isWide.value ? sidebarCollapsed.value : !compactSidebarOpen.value,
)

const onSidebarToggle = (value: boolean) => {
  if (!isWide.value) {
    compactSidebarOpen.value = !value
    return
  }

  sidebarCollapsed.value = value
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value))
  } catch {
    // localStorage indisponível (private mode) — estado vive só na sessão
  }
}

watch(isWide, () => {
  compactSidebarOpen.value = false
})

const pageTitle = computed(() => {
  if (route.path.endsWith('dashboard')) return 'Dashboard'
  if (route.path.endsWith('customers')) return 'Clientes'
  if (route.path.endsWith('products')) return 'Produtos'
  if (route.path.endsWith('new-quote')) return 'Novo Orçamento'
  if (route.path.endsWith('quotes')) return 'Orçamentos'
  if (route.path.endsWith('orders')) return 'Pedidos'
  if (route.path.endsWith('ledger')) return 'Financeiro'
  if (route.path.endsWith('leads')) return 'Leads'
  if (route.path.endsWith('partners')) return 'Parceiros'
  if (route.path.endsWith('kanban')) return 'Funil'
  if (route.path.endsWith('users')) return 'Usuários'
  return 'Verly ERP'
})

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script>
