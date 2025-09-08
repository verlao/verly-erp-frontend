<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Gerenciar Custos</h1>
        <p class="text-lg text-gray-600">Selecione o tipo de custo que deseja gerenciar</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Custos de Vidro -->
        <div 
          @click="navigateToGlassCosts"
          class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 p-8 text-center group"
        >
          <div class="mb-6">
            <!-- Ícone de Vidro (SVG) -->
            <div class="w-24 h-24 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
          </div>
          <h2 class="text-2xl font-semibold text-gray-900 mb-3">Custos de Vidro</h2>
          <p class="text-gray-600 mb-4">Gerencie os custos relacionados aos produtos de vidro</p>
          <div class="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700">
            Acessar
            <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </div>

        <!-- Custos de Cartão de Crédito -->
        <div 
          @click="navigateToCreditCardCosts"
          class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 p-8 text-center group"
        >
          <div class="mb-6">
            <!-- Ícone de Cartão de Crédito (SVG) -->
            <div class="w-24 h-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
            </div>
          </div>
          <h2 class="text-2xl font-semibold text-gray-900 mb-3">Taxas de Cartão</h2>
          <p class="text-gray-600 mb-4">Configure as taxas de cartão de crédito e débito</p>
          <div class="inline-flex items-center text-green-600 font-medium group-hover:text-green-700">
            Acessar
            <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Informações adicionais -->
      <div class="mt-12 bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Sobre o Gerenciamento de Custos</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <h4 class="font-medium text-gray-900 mb-2">Custos de Vidro</h4>
            <p>Gerencie todos os custos relacionados aos produtos de vidro, incluindo matéria-prima, processamento e acabamento.</p>
          </div>
          <div>
            <h4 class="font-medium text-gray-900 mb-2">Taxas de Cartão</h4>
            <p>Configure as taxas de processamento para diferentes modalidades de pagamento, desde débito até parcelamentos em até 18x.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToGlassCosts = () => {
  router.push('/costs')
}

const navigateToCreditCardCosts = () => {
  router.push('/credit-card-costs')
}
</script>

<style scoped>
/* Animações adicionais podem ser adicionadas aqui se necessário */
</style>