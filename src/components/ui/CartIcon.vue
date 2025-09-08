<template>
  <router-link 
    to="/cart" 
    class="relative inline-flex items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors group"
    title="Ver carrinho"
  >
    <!-- Ícone do carrinho -->
    <svg 
      class="w-6 h-6" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      ></path>
    </svg>
    
    <!-- Badge com contador -->
    <span 
      v-if="cartStore.totalItems > 0" 
      class="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[1.25rem] h-5"
    >
      {{ displayCount }}
    </span>
    
    <!-- Tooltip -->
    <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
      {{ tooltipText }}
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '../../stores/cart'

const cartStore = useCartStore()

// Computed properties
const displayCount = computed(() => {
  const count = cartStore.totalItems
  return count > 99 ? '99+' : count.toString()
})

const tooltipText = computed(() => {
  const count = cartStore.totalItems
  if (count === 0) {
    return 'Carrinho vazio'
  } else if (count === 1) {
    return '1 item no carrinho'
  } else {
    return `${count} itens no carrinho`
  }
})
</script>

<style scoped>
/* Animação suave para o badge */
.absolute {
  transition: all 0.2s ease-in-out;
}

/* Efeito de pulse quando há itens */
@keyframes pulse {
  0%, 100% {
    transform: translate(50%, -50%) scale(1);
  }
  50% {
    transform: translate(50%, -50%) scale(1.1);
  }
}

.absolute:not(:empty) {
  animation: pulse 2s infinite;
}
</style>