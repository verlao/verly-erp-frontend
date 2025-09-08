<template>
  <router-link 
    to="/cart" 
    class="relative inline-flex items-center p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
    :title="cartTooltip"
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
        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01"
      />
    </svg>
    
    <!-- Badge com contador -->
    <span 
      v-if="cartStore.totalItems > 0" 
      class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]"
    >
      {{ displayCount }}
    </span>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '../stores/cart'

const cartStore = useCartStore()

// Computed properties
const displayCount = computed(() => {
  const count = cartStore.totalItems
  return count > 99 ? '99+' : count.toString()
})

const cartTooltip = computed(() => {
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