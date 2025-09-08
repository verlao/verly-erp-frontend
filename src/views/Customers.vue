<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold">Gerenciar Clientes</h1>
      <Button 
        @click="openModal()" 
        class="flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Novo Cliente
      </Button>
    </div>

    <!-- Tabela de Clientes -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-6 text-center">
        <p>Carregando...</p>
      </div>
      <div v-else-if="customers.length === 0" class="p-6 text-center">
        <p>Nenhum cliente encontrado</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="customer in customers" :key="customer.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{{ customer.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ customer.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ customer.cpf }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div v-if="customer.phoneOne">
                  <div>{{ customer.phoneOne || '-' }}</div>
                  <div v-if="customer.phoneTwo" class="text-xs text-gray-400">{{ customer.phoneTwo }}</div>
                </div>
                <span v-else>-</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 max-w-xs">
                <div v-if="customer.addresses && customer.addresses.length > 0 && customer.addresses[0].logradouro">
                  <div>{{ customer.addresses[0].logradouro }}, {{ customer.addresses[0].number }}</div>
                  <div class="text-xs text-gray-400">{{ customer.addresses[0].bairro }}, {{ customer.addresses[0].localidade }}</div>
                  <div class="text-xs text-gray-400">{{ customer.addresses[0].cep }}</div>
                </div>
                <span v-else>-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <Button 
                    @click="openModal(customer)" 
                    variant="ghost"
                    size="sm"
                    class="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-edit mr-1"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Editar
                  </Button>
                  <Button 
                    @click="confirmDelete(customer)" 
                    variant="ghost"
                    size="sm"
                    class="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2 mr-1"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c0 1 1 2 1 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    Excluir
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Paginação -->
      <Pagination
        v-if="totalItems > 0"
        :current-page="currentPage"
        :total-items="totalItems"
        :page-size="pageSize"
        @page-changed="handlePageChange"
        @page-size-changed="handlePageSizeChange"
      />
    </div>

    <!-- Modal de Cliente -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 class="text-xl font-bold text-gray-800">{{ isEditing ? 'Editar Cliente' : 'Novo Cliente' }}</h3>
          <p class="text-sm text-gray-600 mt-1">{{ isEditing ? 'Atualize as informações do cliente' : 'Preencha os dados para criar um novo cliente' }}</p>
        </div>
        <form @submit.prevent="saveCustomer" class="p-6">
          <div class="space-y-6">
            <!-- Informações Pessoais -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 text-blue-600">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Informações Pessoais
              </h4>
              <div class="space-y-4">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input 
                    id="name" 
                    v-model="currentCustomer.name" 
                    type="text" 
                    required 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Digite o nome completo"
                  />
                </div>
            
                <div>
                  <label for="cpf" class="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                  <input 
                    id="cpf" 
                    v-model="currentCustomer.cpf" 
                    type="text" 
                    required 
                    maxlength="14"
                    @input="formatCpfInput"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
            </div>
            
            <!-- Contato -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 text-green-600">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Contato
              </h4>
              <div class="space-y-4">
                <div>
                  <label for="phone-one" class="block text-sm font-medium text-gray-700 mb-1">Telefone Principal</label>
                  <input 
                    id="phone-one"
                    v-model="currentCustomer.phoneOne" 
                    type="text" 
                    required 
                    maxlength="15"
                    @input="(e) => formatPhoneInput(e, 'one')"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label for="phone-two" class="block text-sm font-medium text-gray-700 mb-1">Telefone Secundário</label>
                  <input 
                    id="phone-two"
                    v-model="currentCustomer.phoneTwo" 
                    type="text" 
                    maxlength="15"
                    @input="(e) => formatPhoneInput(e, 'two')"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="(00) 00000-0000 (opcional)"
                  />
                </div>
              </div>
            </div>
            
            <!-- Endereço -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2 text-purple-600">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Endereço
              </h4>
              <div class="space-y-4">
                <!-- CEP - Primeiro campo -->
                <div class="relative">
                  <label for="cep" class="block text-xs font-medium text-gray-600 mb-1">CEP</label>
                  <input 
                    id="cep"
                    :value="currentCustomer.addresses?.[0]?.cep || ''"
                    @input="handleCepInput"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="00000-000"
                    maxlength="9"
                  />
                  <!-- Indicador de carregamento -->
                  <div v-if="searchingCep" class="absolute inset-y-0 right-0 flex items-center pr-3 top-6">
                    <svg class="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <!-- Mensagem de erro -->
                  <p v-if="cepError" class="mt-1 text-sm text-red-600">{{ cepError }}</p>
                </div>
                
                <!-- Logradouro e Número -->
                <div class="grid grid-cols-3 gap-3">
                  <div class="col-span-2">
                    <label for="logradouro" class="block text-xs font-medium text-gray-600 mb-1">Logradouro</label>
                    <input 
                      id="logradouro"
                      :value="currentCustomer.addresses?.[0]?.logradouro || ''"
                      @input="handleLogradouroInput"
                      type="text"
                      :disabled="!addressFieldsEnabled"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label for="number" class="block text-xs font-medium text-gray-600 mb-1">Número</label>
                    <input 
                      id="number"
                      :value="currentCustomer.addresses?.[0]?.number || ''"
                      @input="handleNumberInput"
                      type="text"
                      :disabled="!addressFieldsEnabled"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                    />
                  </div>
                </div>
                
                <!-- Bairro e Cidade -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label for="bairro" class="block text-xs font-medium text-gray-600 mb-1">Bairro</label>
                    <input 
                      id="bairro"
                      :value="currentCustomer.addresses?.[0]?.bairro || ''"
                      @input="handleBairroInput"
                      type="text"
                      :disabled="!addressFieldsEnabled"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label for="localidade" class="block text-xs font-medium text-gray-600 mb-1">Cidade</label>
                    <input 
                      id="localidade"
                      :value="currentCustomer.addresses?.[0]?.localidade || ''"
                      @input="handleLocalidadeInput"
                      type="text"
                      :disabled="!addressFieldsEnabled"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                    />
                  </div>
                </div>
                
                <!-- Complemento -->
                <div>
                  <label for="complemento" class="block text-xs font-medium text-gray-600 mb-1">Complemento</label>
                  <input 
                    id="complemento"
                    :value="currentCustomer.addresses?.[0]?.complemento || ''"
                    @input="handleComplementoInput"
                    type="text"
                    :disabled="!addressFieldsEnabled"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                  />
                </div>
                
                <!-- Referência -->
                <div>
                  <label for="reference" class="block text-xs font-medium text-gray-600 mb-1">Referência</label>
                  <input 
                    id="reference"
                    :value="currentCustomer.addresses?.[0]?.reference || ''"
                    @input="handleReferenceInput"
                    type="text"
                    :disabled="!addressFieldsEnabled"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                  />
                </div>
               </div>
             </div>
           </div>
          
          <div class="mt-8 flex justify-end space-x-3">
            <button 
              type="button" 
              @click="showModal = false" 
              class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-sm"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              :disabled="saving"
              class="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span v-if="saving" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </span>
              <span v-else>{{ isEditing ? 'Atualizar Cliente' : 'Criar Cliente' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Confirmação de Exclusão -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Confirmar Exclusão</h3>
          <p>Tem certeza que deseja excluir o cliente <strong>{{ customerToDelete?.name }}</strong>?</p>
          <div class="mt-6 flex justify-end space-x-3">
            <button 
              type="button" 
              @click="showDeleteModal = false" 
              class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-sm"
            >
              Cancelar
            </button>
            <button 
              type="button" 
              @click="deleteCustomer" 
              :disabled="deleting"
              class="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span v-if="deleting" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Excluindo...
              </span>
              <span v-else>Excluir Cliente</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import customerService from '../services/customer'
import cepService from '../services/cep'
import Pagination from '../components/ui/Pagination.vue'
import Button from '../components/ui/Button.vue'
import { maskCpf, unmaskCpf, validateCpf, maskPhone, unmaskPhone, validatePhone, maskCep } from '../lib/masks'
import type { CustomerDTO } from '../services/customer'
import type { PaginatedResponse } from '../services/order'

const customers = ref<CustomerDTO[]>([])
const loading = ref(true)
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)

// CEP
const searchingCep = ref(false)
const cepError = ref('')
const cepTimeout = ref<number | null>(null)
const addressFieldsEnabled = ref(false)

// Paginação
const currentPage = ref(1)
const pageSize = ref(25)
const totalItems = ref(0)
const totalPages = ref(0)

const currentCustomer = ref<CustomerDTO>({
  name: '',
  cpf: '',
  phoneOne: '',
  phoneTwo: '',
  addresses: [{
    cep: '',
    logradouro: '',
    complemento: '',
    bairro: '',
    localidade: '',
    number: '',
    reference: '',
    isPrimary: true
  }]
})

const customerToDelete = ref<CustomerDTO | null>(null)

onMounted(async () => {
  await loadCustomers()
})

// Watcher para busca automática de CEP
watch(() => currentCustomer.value.addresses?.[0]?.cep, (newCep) => {
  if (newCep && newCep.length >= 8) {
    // Limpa timeout anterior se existir
    if (cepTimeout.value) {
      clearTimeout(cepTimeout.value)
    }
    
    // Define novo timeout para buscar CEP após 500ms de inatividade
    cepTimeout.value = setTimeout(() => {
      buscarCepAutomatico(newCep)
    }, 500)
  }
})

async function buscarCepAutomatico(cep: string) {
  if (!cep || searchingCep.value) return
  
  // Limpa erro anterior
  cepError.value = ''
  addressFieldsEnabled.value = false
  
  // Valida formato do CEP
  if (!cepService.validarFormatoCep(cep)) {
    cepError.value = 'CEP deve conter 8 dígitos'
    return
  }
  
  try {
    searchingCep.value = true
    const resultado = await cepService.buscarCep(cep)
    
    if (resultado) {
      // Preenche os campos automaticamente
      if (currentCustomer.value.addresses && currentCustomer.value.addresses[0]) {
        currentCustomer.value.addresses[0].logradouro = resultado.logradouro || ''
        currentCustomer.value.addresses[0].bairro = resultado.bairro || ''
        currentCustomer.value.addresses[0].localidade = resultado.localidade || ''
        currentCustomer.value.addresses[0].complemento = resultado.complemento || ''
        currentCustomer.value.addresses[0].cep = maskCep(cep)
      }
      
      // Habilita os campos de endereço após sucesso
      addressFieldsEnabled.value = true
      
      console.log('CEP encontrado:', resultado)
    } else {
      cepError.value = 'CEP não encontrado'
    }
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    cepError.value = 'Erro ao buscar CEP'
    addressFieldsEnabled.value = false
  } finally {
    searchingCep.value = false
  }
}

async function loadCustomers() {
  try {
    loading.value = true
    console.log('Carregando clientes - Página:', currentPage.value, 'Tamanho:', pageSize.value)
    
    const response: PaginatedResponse<CustomerDTO> = await customerService.getAll({
      page: currentPage.value - 1, // Spring Boot usa páginas baseadas em 0
      size: pageSize.value,
      sort: 'name,asc'
    })
    
    console.log('Resposta da API:', response)
    console.log('Conteúdo:', response.content)
    console.log('Total de elementos:', response.totalElements)
    console.log('Total de páginas:', response.totalPages)
    
    customers.value = response.content
    totalItems.value = response.totalElements
    totalPages.value = response.totalPages
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
    // Fallback para API sem paginação
    try {
      console.log('Tentando fallback para API sem paginação')
      customers.value = await customerService.getAllNonPaginated()
      console.log('Clientes do fallback:', customers.value)
      totalItems.value = customers.value.length
      totalPages.value = 1
    } catch (fallbackError) {
      console.error('Erro no fallback:', fallbackError)
    }
  } finally {
    loading.value = false
  }
}

function openModal(customer?: CustomerDTO) {
  // Limpa erros de CEP
  cepError.value = ''
  searchingCep.value = false
  if (cepTimeout.value) {
    clearTimeout(cepTimeout.value)
    cepTimeout.value = null
  }
  
  if (customer) {
    currentCustomer.value = { 
      ...customer,
      addresses: customer.addresses && customer.addresses.length > 0 
        ? [...customer.addresses] 
        : [{
            cep: '',
            logradouro: '',
            complemento: '',
            bairro: '',
            localidade: '',
            number: '',
            reference: '',
            isPrimary: true
          }]
    }
    isEditing.value = true
    addressFieldsEnabled.value = true
  } else {
    currentCustomer.value = {
      name: '',
      cpf: '',
      phoneOne: '',
      phoneTwo: '',
      addresses: [{
        cep: '',
        logradouro: '',
        complemento: '',
        bairro: '',
        localidade: '',
        number: '',
        reference: '',
        isPrimary: true
      }]
    }
    isEditing.value = false
    addressFieldsEnabled.value = false
  }
  showModal.value = true
}

const editCustomer = (customer: CustomerDTO) => {
  currentCustomer.value = { ...customer }
  isEditing.value = true
  // Habilita campos de endereço para edição de cliente existente
  addressFieldsEnabled.value = true
  cepError.value = ''
  showModal.value = true
}

async function saveCustomer() {
  try {
    saving.value = true
    
    console.log('saveCustomer chamado - isEditing:', isEditing.value)
    console.log('Dados do cliente:', JSON.stringify(currentCustomer.value, null, 2))
    
    if (isEditing.value && currentCustomer.value.id) {
      console.log('Atualizando cliente existente')
      await customerService.update(currentCustomer.value.id, currentCustomer.value)
    } else {
      console.log('Criando novo cliente')
      const result = await customerService.create(currentCustomer.value)
      console.log('Resultado da criação:', result)
    }
    
    showModal.value = false
    await loadCustomers()
  } catch (error) {
    console.error('Erro ao salvar cliente:', error)
    alert('Erro ao salvar cliente: ' + (error instanceof Error ? error.message : String(error)))
  } finally {
    saving.value = false
  }
}

function confirmDelete(customer: CustomerDTO) {
  customerToDelete.value = customer
  showDeleteModal.value = true
}

async function deleteCustomer() {
  if (!customerToDelete.value?.id) return
  
  try {
    deleting.value = true
    await customerService.delete(customerToDelete.value.id)
    showDeleteModal.value = false
    await loadCustomers()
  } catch (error) {
    console.error('Erro ao excluir cliente:', error)
  } finally {
    deleting.value = false
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
  loadCustomers()
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1 // Reset para primeira página
  loadCustomers()
}

// Funções de formatação
function formatCpfInput(event: Event) {
  const target = event.target as HTMLInputElement
  const masked = maskCpf(target.value)
  currentCustomer.value.cpf = masked
  target.value = masked
}

function formatPhoneInput(event: Event, field: 'one' | 'two') {
  const target = event.target as HTMLInputElement
  const masked = maskPhone(target.value)
  if (field === 'one') {
    currentCustomer.value.phoneOne = masked
  } else {
    currentCustomer.value.phoneTwo = masked
  }
  target.value = masked
}

function formatCepInput(event: Event) {
  const target = event.target as HTMLInputElement
  const masked = maskCep(target.value)
  if (currentCustomer.value.addresses && currentCustomer.value.addresses[0]) {
    currentCustomer.value.addresses[0].cep = masked
  }
  target.value = masked
}

// Address input handlers
function handleCepInput(event: Event) {
  const target = event.target as HTMLInputElement
  if (currentCustomer.value.addresses && currentCustomer.value.addresses[0]) {
    currentCustomer.value.addresses[0].cep = target.value
  }
  formatCepInput(event)
}

function handleLogradouroInput(event: Event) {
  const target = event.target as HTMLInputElement
  if (currentCustomer.value.addresses && currentCustomer.value.addresses[0]) {
    currentCustomer.value.addresses[0].logradouro = target.value
  }
}

function handleNumberInput(event: Event) {
  const target = event.target as HTMLInputElement
  if (currentCustomer.value.addresses && currentCustomer.value.addresses[0]) {
    currentCustomer.value.addresses[0].number = target.value
  }
}

function handleBairroInput(event: Event) {
  const target = event.target as HTMLInputElement
  if (currentCustomer.value.addresses && currentCustomer.value.addresses[0]) {
    currentCustomer.value.addresses[0].bairro = target.value
  }
}

function handleLocalidadeInput(event: Event) {
  const target = event.target as HTMLInputElement
  if (currentCustomer.value.addresses && currentCustomer.value.addresses[0]) {
    currentCustomer.value.addresses[0].localidade = target.value
  }
}

function handleComplementoInput(event: Event) {
  const target = event.target as HTMLInputElement
  if (currentCustomer.value.addresses && currentCustomer.value.addresses[0]) {
    currentCustomer.value.addresses[0].complemento = target.value
  }
}

function handleReferenceInput(event: Event) {
  const target = event.target as HTMLInputElement
  if (currentCustomer.value.addresses && currentCustomer.value.addresses[0]) {
    currentCustomer.value.addresses[0].reference = target.value
  }
}
</script>