import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { ProductDTO } from '../services/product'
import type { CustomerDTO } from '../services/customer'

export interface CartItem {
  product: ProductDTO
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface CartState {
  items: CartItem[]
  selectedCustomer: CustomerDTO | null
  deliveryDate: string
  observations: string
}

export const useCartStore = defineStore('cart', () => {
  // Estado reativo
  const items = ref<CartItem[]>([])
  const selectedCustomer = ref<CustomerDTO | null>(null)
  const deliveryDate = ref('')
  const observations = ref('')

  // Computed properties
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalValue = computed(() => {
    return items.value.reduce((total, item) => total + item.totalPrice, 0)
  })

  const totalCost = computed(() => {
    return items.value.reduce((total, item) => total + (item.product.cost || 0) * item.quantity, 0)
  })

  const totalProfit = computed(() => {
    return totalValue.value - totalCost.value
  })

  const isEmpty = computed(() => {
    return items.value.length === 0
  })

  // Actions
  function addItem(product: ProductDTO, quantity: number = 1) {
    const existingItemIndex = items.value.findIndex(item => item.product.key === product.key)
    
    if (existingItemIndex >= 0) {
      // Se o produto já existe, aumenta a quantidade
      const existingItem = items.value[existingItemIndex]
      existingItem.quantity += quantity
      existingItem.totalPrice = existingItem.unitPrice * existingItem.quantity
    } else {
      // Se é um novo produto, adiciona ao carrinho
      const unitPrice = product.price || 0
      const newItem: CartItem = {
        product,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity
      }
      items.value.push(newItem)
    }
  }

  function removeItem(productKey: string) {
    const index = items.value.findIndex(item => item.product.key === productKey)
    if (index >= 0) {
      items.value.splice(index, 1)
    }
  }

  function updateQuantity(productKey: string, quantity: number) {
    const item = items.value.find(item => item.product.key === productKey)
    if (item) {
      if (quantity <= 0) {
        removeItem(productKey)
      } else {
        item.quantity = quantity
        item.totalPrice = item.unitPrice * quantity
      }
    }
  }

  function updateUnitPrice(productKey: string, unitPrice: number) {
    const item = items.value.find(item => item.product.key === productKey)
    if (item) {
      item.unitPrice = unitPrice
      item.totalPrice = unitPrice * item.quantity
    }
  }

  function clearCart() {
    items.value = []
    selectedCustomer.value = null
    deliveryDate.value = ''
    observations.value = ''
  }

  function setCustomer(customer: CustomerDTO | null) {
    selectedCustomer.value = customer
  }

  function setDeliveryDate(date: string) {
    deliveryDate.value = date
  }

  function setObservations(obs: string) {
    observations.value = obs
  }

  // Função para converter o carrinho em formato de pedido
  function getOrderData() {
    if (!selectedCustomer.value || items.value.length === 0) {
      throw new Error('Carrinho vazio ou cliente não selecionado')
    }

    return {
      customerId: selectedCustomer.value.id,
      deliveryDate: deliveryDate.value,
      observations: observations.value,
      products: items.value.map(item => ({
        productKey: item.product.key,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })),
      totalCost: totalCost.value,
      totalPrice: totalValue.value,
      profit: totalProfit.value
    }
  }

  // Persistência no localStorage
  function saveToStorage() {
    const cartData = {
      items: items.value,
      selectedCustomer: selectedCustomer.value,
      deliveryDate: deliveryDate.value,
      observations: observations.value
    }
    localStorage.setItem('verly-cart', JSON.stringify(cartData))
  }

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem('verly-cart')
      if (stored) {
        const cartData = JSON.parse(stored)
        items.value = cartData.items || []
        selectedCustomer.value = cartData.selectedCustomer || null
        deliveryDate.value = cartData.deliveryDate || ''
        observations.value = cartData.observations || ''
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho do localStorage:', error)
    }
  }

  // Watchers para salvar automaticamente
  function setupAutoSave() {
    // Salva automaticamente quando há mudanças
    watch([items, selectedCustomer, deliveryDate, observations], () => {
      saveToStorage()
    }, { deep: true })
  }

  return {
    // Estado
    items,
    selectedCustomer,
    deliveryDate,
    observations,
    
    // Computed
    totalItems,
    totalValue,
    totalCost,
    totalProfit,
    isEmpty,
    
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    updateUnitPrice,
    clearCart,
    setCustomer,
    setDeliveryDate,
    setObservations,
    getOrderData,
    saveToStorage,
    loadFromStorage,
    setupAutoSave
  }
})