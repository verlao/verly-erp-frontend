<template>
  <div class="font-verly-body min-h-screen bg-[#F3F5F4] md:h-screen md:min-h-0 md:flex md:flex-col">
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
              'overflow-y-auto',
              isWide && !sidebarCollapsed ? 'ml-64 p-6' : 'ml-16 p-6',
            ],
      ]"
      :style="
        isMobile
          ? {
              paddingTop: 'calc(72px + env(safe-area-inset-top))',
              paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))',
            }
          : {}
      "
    >
      <!-- Desktop header (mobile usa MobileTopBar) -->
      <header
        v-if="!isMobile"
        class="-mx-6 -mt-6 mb-4 shrink-0 border-b border-[#DDE4E1] bg-[#F3F5F4] shadow-sm"
      >
        <div class="flex h-[76px] items-center justify-between px-6">
          <h2 class="font-verly-display text-xl font-semibold text-[#141A1F] md:text-2xl">
            {{ pageTitle }}
          </h2>
          <details ref="accountMenu" class="relative">
            <summary class="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl border border-[#DDE4E1] bg-white px-3 text-[#26312D] transition hover:bg-[#E4F1EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D7A] [&::-webkit-details-marker]:hidden" aria-label="Menu da conta">
              <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E4F1EF] text-[#1C625F]"><svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg></span>
              <span class="hidden max-w-48 truncate text-[15px] font-medium md:block">{{ user?.username }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </summary>
            <div class="absolute right-0 top-[calc(100%+8px)] z-50 w-56 rounded-2xl border border-[#DDE4E1] bg-white p-2 shadow-[0_12px_32px_rgba(20,26,31,.16)]">
              <div class="border-b border-[#E7ECEA] px-3 py-2 text-[15px] font-medium text-[#26312D]">{{ user?.username }}</div>
              <button class="mt-1 min-h-11 w-full rounded-xl px-3 text-left text-[15px] text-[#485650] transition hover:bg-[#EDF3F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D7A]" @click="logout">Sair</button>
            </div>
          </details>
        </div>
      </header>

      <router-view :class="isMobile ? undefined : 'flex-1 min-h-0'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useBreakpoint } from '../composables/useBreakpoint'

import DesktopSidebar from '../components/nav/DesktopSidebar.vue'
import MobileTopBar from '../components/nav/MobileTopBar.vue'
import MobileBottomNav from '../components/nav/MobileBottomNav.vue'
import MobileMoreMenu from '../components/nav/MobileMoreMenu.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { isMobile, isWide } = useBreakpoint()

const user = computed(() => authStore.getUser)
const accountMenu = ref<HTMLDetailsElement>()
const closeAccountOnOutside = (event: PointerEvent) => {
  if (event.target instanceof Node && !accountMenu.value?.contains(event.target)) accountMenu.value?.removeAttribute('open')
}
const closeAccountOnEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && accountMenu.value?.open) {
    accountMenu.value.open = false
    accountMenu.value.querySelector('summary')?.focus()
  }
}
document.addEventListener('pointerdown', closeAccountOnOutside)
document.addEventListener('keydown', closeAccountOnEscape)
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', closeAccountOnOutside)
  document.removeEventListener('keydown', closeAccountOnEscape)
})

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
  const nav = route.meta.nav
  return route.meta.pageTitle ?? nav?.accessibleLabel ?? nav?.label ?? 'Verly ERP'
})

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script>
