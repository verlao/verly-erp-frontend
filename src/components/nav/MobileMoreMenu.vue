<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[60] bg-white flex flex-col"
      >
        <!-- Header -->
        <div
          class="px-4 py-4 border-b border-border flex items-center justify-between"
        >
          <h1 class="text-xl font-bold text-foreground">Verly ERP</h1>
          <button
            @click="close"
            class="p-2 rounded-md hover:bg-accent transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <!-- Overflow nav links (rotas que não couberam na bottom nav) -->
        <nav class="flex-1 overflow-y-auto py-2">
          <router-link to="/customers" custom v-slot="{ navigate, isActive }">
            <button
              @click="navAndClose(navigate)"
              :class="[
                'w-full text-left px-6 py-4 text-base flex items-center gap-3 transition-colors',
                isActive
                  ? 'bg-accent text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent/50',
              ]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
              Clientes
            </button>
          </router-link>
          <router-link to="/orders" custom v-slot="{ navigate, isActive }">
            <button
              @click="navAndClose(navigate)"
              :class="[
                'w-full text-left px-6 py-4 text-base flex items-center gap-3 transition-colors',
                isActive
                  ? 'bg-accent text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent/50',
              ]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
              Pedidos
            </button>
          </router-link>
          <router-link to="/ledger" custom v-slot="{ navigate, isActive }">
            <button
              @click="navAndClose(navigate)"
              :class="[
                'w-full text-left px-6 py-4 text-base flex items-center gap-3 transition-colors',
                isActive
                  ? 'bg-accent text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent/50',
              ]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"
                />
                <path d="M8 7h6" />
                <path d="M8 11h8" />
              </svg>
              Lançamentos
            </button>
          </router-link>
          <router-link
            v-if="authStore.isAdmin"
            to="/users"
            custom
            v-slot="{ navigate, isActive }"
          >
            <button
              @click="navAndClose(navigate)"
              :class="[
                'w-full text-left px-6 py-4 text-base flex items-center gap-3 transition-colors',
                isActive
                  ? 'bg-accent text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent/50',
              ]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
              Usuários
            </button>
          </router-link>
        </nav>

        <!-- Logout -->
        <div class="px-4 py-4 border-t border-border">
          <button
            @click="emit('logout'); close()"
            class="w-full text-left px-2 py-3 text-base text-destructive flex items-center gap-3 rounded-md hover:bg-destructive/10 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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
            Sair
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth'

interface Props {
  open: boolean
}
defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  logout: []
}>()

const authStore = useAuthStore()

const close = () => emit('update:open', false)
const navAndClose = (navigate: () => void) => {
  close()
  navigate()
}
</script>
