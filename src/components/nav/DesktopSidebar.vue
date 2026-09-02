<template>
  <aside
    :class="[
      'bg-sidebar border-r border-border fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out',
      collapsed ? 'w-16' : 'w-64',
    ]"
  >
    <div class="p-4 border-b border-border flex items-center justify-between shrink-0">
      <h1
        :class="[
          'font-bold text-foreground transition-opacity duration-300',
          collapsed ? 'opacity-0 w-0' : 'opacity-100 text-xl',
        ]"
      >
        Verly ERP
      </h1>
      <button
        @click="emit('update:collapsed', !collapsed)"
        class="h-11 w-11 rounded-md hover:bg-accent transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        :title="collapsed ? 'Expandir menu' : 'Recolher menu'"
        :aria-label="collapsed ? 'Expandir menu' : 'Recolher menu'"
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
          :class="['transition-transform duration-300', collapsed ? 'rotate-180' : '']"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
    </div>
    <div class="relative mt-4 flex-1 min-h-0">
      <nav
        ref="containerRef"
        :style="maskStyle"
        :class="[
          'h-full space-y-1 px-2 overflow-y-auto',
          collapsed
            ? '[&>[data-navigation-item]]:h-8 [&>[data-navigation-item]]:min-h-8'
            : '[&>[data-navigation-item]]:min-h-11',
        ]"
      >
      <router-link to="leads" custom v-slot="{ navigate, isActive }">
        <Button
          data-navigation-item
          @click="navigate"
          :variant="isActive ? 'secondary' : 'ghost'"
          class="w-full justify-start"
          title="Leads"
          aria-label="Leads"
        >
          <span class="mr-2">
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
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </span>
          <span :class="{ 'sr-only': collapsed }">Leads</span>
        </Button>
      </router-link>
      <router-link to="ledger" custom v-slot="{ navigate, isActive }">
        <Button
          data-navigation-item
          @click="navigate"
          :variant="isActive ? 'secondary' : 'ghost'"
          class="w-full justify-start"
          title="Financeiro"
          aria-label="Financeiro"
        >
          <span class="mr-2">
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
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              <path d="M8 7h6" />
              <path d="M8 11h8" />
            </svg>
          </span>
          <span :class="{ 'sr-only': collapsed }">Financeiro</span>
        </Button>
      </router-link>
      <router-link to="kanban" custom v-slot="{ navigate, isActive }">
        <Button
          data-navigation-item
          @click="navigate"
          :variant="isActive ? 'secondary' : 'ghost'"
          class="w-full justify-start"
          title="Funil"
          aria-label="Funil"
        >
          <span class="mr-2">
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
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M8 7v7" />
              <path d="M12 7v4" />
              <path d="M16 7v9" />
            </svg>
          </span>
          <span :class="{ 'sr-only': collapsed }">Funil</span>
        </Button>
      </router-link>
      <router-link to="customers" custom v-slot="{ navigate, isActive }">
        <Button
          data-navigation-item
          @click="navigate"
          :variant="isActive ? 'secondary' : 'ghost'"
          class="w-full justify-start"
          title="Clientes"
          aria-label="Clientes"
        >
          <span class="mr-2">
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
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </span>
          <span :class="{ 'sr-only': collapsed }">Clientes</span>
        </Button>
      </router-link>
      <router-link to="partners" custom v-slot="{ navigate, isActive }">
        <Button
          data-navigation-item
          @click="navigate"
          :variant="isActive ? 'secondary' : 'ghost'"
          class="w-full justify-start"
          title="Parceiros"
          aria-label="Parceiros"
        >
          <span class="mr-2">
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
            >
              <path d="m11 17 2 2a1 1 0 1 0 3-3" />
              <path
                d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"
              />
              <path d="m21 3 1 11h-2" />
              <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
              <path d="M3 4h8" />
            </svg>
          </span>
          <span :class="{ 'sr-only': collapsed }">Parceiros</span>
        </Button>
      </router-link>
      <router-link to="products" custom v-slot="{ navigate, isActive }">
        <Button
          data-navigation-item
          @click="navigate"
          :variant="isActive ? 'secondary' : 'ghost'"
          class="w-full justify-start"
          title="Produtos"
          aria-label="Produtos"
        >
          <span class="mr-2">
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
            >
              <path d="m7.5 4.27 9 5.15" />
              <path
                d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
              />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          </span>
          <span :class="{ 'sr-only': collapsed }">Produtos</span>
        </Button>
      </router-link>
      <router-link to="quotes" custom v-slot="{ navigate, isActive }">
        <Button
          data-navigation-item
          @click="navigate"
          :variant="isActive ? 'secondary' : 'ghost'"
          class="w-full justify-start"
          title="Orçamentos"
          aria-label="Orçamentos"
        >
          <span class="mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fill-rule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
          <span :class="{ 'sr-only': collapsed }">Orçamentos</span>
        </Button>
      </router-link>
      <router-link to="orders" custom v-slot="{ navigate, isActive }">
        <Button
          data-navigation-item
          @click="navigate"
          :variant="isActive ? 'secondary' : 'ghost'"
          class="w-full justify-start"
          title="Pedidos"
          aria-label="Pedidos"
        >
          <span class="mr-2">
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
            >
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
              <path
                d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
              />
              <path d="M12 11h4" />
              <path d="M12 16h4" />
              <path d="M8 11h.01" />
              <path d="M8 16h.01" />
            </svg>
          </span>
          <span :class="{ 'sr-only': collapsed }">Pedidos</span>
        </Button>
      </router-link>
      <router-link
        v-if="authStore.isAdmin"
        to="users"
        custom
        v-slot="{ navigate, isActive }"
      >
        <Button
          data-navigation-item
          @click="navigate"
          :variant="isActive ? 'secondary' : 'ghost'"
          class="w-full justify-start"
          title="Usuários"
          aria-label="Usuários"
        >
          <span class="mr-2">
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
            >
              <path
                d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
              />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
          <span :class="{ 'sr-only': collapsed }">Usuários</span>
        </Button>
      </router-link>
      </nav>
      <button
        v-if="canScrollUp"
        type="button"
        class="absolute right-1 top-1 z-10 h-8 w-8 rounded-full border border-border bg-sidebar shadow-md flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        title="Ver destinos anteriores"
        aria-label="Ver destinos anteriores"
        @click="scrollNavigation('up')"
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
      <button
        v-if="canScrollDown"
        type="button"
        class="absolute right-1 bottom-1 z-10 h-8 w-8 rounded-full border border-border bg-sidebar shadow-md flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        title="Ver mais destinos"
        aria-label="Ver mais destinos"
        @click="scrollNavigation('down')"
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </div>
    <div class="p-4 border-t border-border shrink-0">
      <Button
        @click="emit('logout')"
        variant="ghost"
        class="w-full min-h-11 justify-start text-destructive hover:text-destructive-foreground hover:bg-destructive"
        title="Sair"
        aria-label="Sair"
      >
        <span class="mr-2">
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
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
        </span>
        <span :class="{ 'sr-only': collapsed }">Sair</span>
      </Button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useVerticalOverflow } from '../../composables/useVerticalOverflow'
import { useAuthStore } from '../../stores/auth'
import Button from '../ui/Button.vue'

interface Props {
  collapsed: boolean
}
defineProps<Props>()
const emit = defineEmits<{
  'update:collapsed': [value: boolean]
  logout: []
}>()

const authStore = useAuthStore()
const {
  containerRef,
  canScrollUp,
  canScrollDown,
  maskStyle,
  scroll: scrollNavigation,
} = useVerticalOverflow()
</script>
