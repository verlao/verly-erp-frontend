<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border grid grid-cols-5 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(0,0,0,0.04)]"
    style="height: calc(4rem + env(safe-area-inset-bottom))"
  >
    <!-- Produtos -->
    <router-link to="/products" custom v-slot="{ navigate, isActive }">
      <button
        @click="navigate"
        :class="[
          'flex flex-col items-center justify-center gap-1 transition-colors',
          isActive ? 'text-blue-600' : 'text-muted-foreground hover:text-foreground',
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
          <path d="m7.5 4.27 9 5.15" />
          <path
            d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
          />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
        <span class="text-[10px] font-medium">Produtos</span>
      </button>
    </router-link>

    <!-- Leads (botão principal) -->
    <router-link to="/leads" custom v-slot="{ navigate, isActive }">
      <button
        @click="navigate"
        :class="[
          'flex flex-col items-center justify-center gap-1 transition-colors',
          isActive ? 'text-blue-600' : 'text-muted-foreground hover:text-foreground',
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
          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
        <span class="text-[10px] font-medium">Leads</span>
      </button>
    </router-link>

    <!-- Novo Orçamento — CTA central elevado -->
    <router-link to="/new-quote" custom v-slot="{ navigate }">
      <button
        @click="navigate"
        class="relative flex flex-col items-center justify-center"
        aria-label="Novo Orçamento"
      >
        <div
          class="absolute -top-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <span class="text-[10px] font-medium text-blue-600 mt-7">Novo</span>
      </button>
    </router-link>

    <!-- Orçamentos -->
    <router-link to="/quotes" custom v-slot="{ navigate, isActive }">
      <button
        @click="navigate"
        :class="[
          'flex flex-col items-center justify-center gap-1 transition-colors',
          isActive ? 'text-blue-600' : 'text-muted-foreground hover:text-foreground',
        ]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
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
        <span class="text-[10px] font-medium">Orçamentos</span>
      </button>
    </router-link>

    <!-- Mais (abre drawer com overflow) -->
    <button
      @click="emit('openMore')"
      class="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
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
        <line x1="4" x2="20" y1="12" y2="12" />
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="18" y2="18" />
      </svg>
      <span class="text-[10px] font-medium">Mais</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
const emit = defineEmits<{ openMore: [] }>()
</script>
