<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-semibold text-foreground">Orçamentos</h1>
          <p class="text-muted-foreground mt-1">Gerencie seus orçamentos e converta em pedidos</p>
        </div>
        
        <!-- Estatísticas Rápidas -->
        <div class="flex gap-4">
          <div class="bg-card border border-border rounded-lg px-4 py-2">
            <p class="text-xs text-muted-foreground">Válidos</p>
            <p class="text-xl font-bold text-green-600">{{ stats.valid }}</p>
          </div>
          <div class="bg-card border border-border rounded-lg px-4 py-2">
            <p class="text-xs text-muted-foreground">Expirando</p>
            <p class="text-xl font-bold text-orange-600">{{ stats.expiringSoon }}</p>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-card rounded-lg shadow-sm border border-border p-4 mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Busca por ID ou Cliente -->
          <div class="flex-1 relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por ID ou nome do cliente..."
              class="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <svg class="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>

          <!-- Filtro: Mostrar Expirando em Breve -->
          <label class="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-background cursor-pointer hover:bg-accent">
            <input
              v-model="showExpiringSoon"
              type="checkbox"
              class="w-4 h-4 text-blue-600 rounded"
            />
            <span class="text-sm">Mostrar expirando em breve</span>
          </label>
        </div>
      </div>

      <!-- Tabela de Orçamentos -->
      <div class="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="flex items-center space-x-3">
            <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-muted-foreground font-medium">Carregando orçamentos...</span>
          </div>
        </div>

        <div v-else-if="filteredQuotes.length === 0" class="text-center py-16">
          <div class="bg-muted rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-foreground mb-2">Nenhum orçamento encontrado</h3>
          <p class="text-muted-foreground">Crie orçamentos a partir da página de produtos.</p>
        </div>

        <!-- Mobile: lista de cards -->
        <div v-else-if="isMobile" class="divide-y divide-border">
          <div
            v-for="quote in filteredQuotes"
            :key="quote.id"
            class="p-4 space-y-2 active:bg-accent/40 transition-colors"
          >
            <!-- Linha 1: ID + cliente + status -->
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold truncate">
                  #{{ quote.id }} • {{ getCustomerName(quote.customerId) }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ getProductCount(quote.products) }} itens • criado
                  {{ formatDate(quote.createdDate) }}
                </p>
              </div>
              <span
                :class="getStatusBadgeClass(quote.status)"
                class="px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap"
              >
                {{ getStatusLabel(quote.status) }}
              </span>
            </div>

            <!-- Linha 2: total + lucro -->
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Total</span>
              <span class="font-semibold text-green-600">
                R$ {{ (quote.totalPrice || 0).toFixed(2) }}
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-muted-foreground">Lucro</span>
              <span class="font-medium text-blue-600">
                R$ {{ (quote.totalProfit || 0).toFixed(2) }}
              </span>
            </div>

            <!-- Linha 3: expiração + ações -->
            <div class="flex items-center justify-between pt-1">
              <span class="text-xs" :class="getExpirationClass(quote.expirationDate)">
                Expira {{ formatDate(quote.expirationDate) }}
              </span>
              <div class="flex items-center gap-1">
                <button
                  @click="downloadPDF(quote.id)"
                  :disabled="loadingPDF === quote.id"
                  class="min-w-[44px] min-h-[44px] flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg active:scale-95 transition-transform disabled:opacity-50"
                  title="Baixar PDF"
                  aria-label="Baixar PDF"
                >
                  <svg
                    v-if="loadingPDF === quote.id"
                    class="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  v-if="quote.status !== 'CONVERTED'"
                  @click="openEditModal(quote)"
                  class="min-w-[44px] min-h-[44px] flex items-center justify-center text-amber-600 hover:bg-amber-50 rounded-lg active:scale-95 transition-transform"
                  title="Editar"
                  aria-label="Editar"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  @click="resendWhatsApp(quote)"
                  class="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#25D366] hover:bg-green-50 rounded-lg active:scale-95 transition-transform"
                  title="WhatsApp"
                  aria-label="Reenviar via WhatsApp"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"
                    />
                  </svg>
                </button>
                <button
                  v-if="quote.status === 'VALID'"
                  @click="openConvertDialog(quote)"
                  class="min-w-[44px] min-h-[44px] flex items-center justify-center text-green-600 hover:bg-green-50 rounded-lg active:scale-95 transition-transform"
                  title="Converter"
                  aria-label="Converter para pedido"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop: tabela tradicional -->
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-muted">
              <tr class="border-b border-border">
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Cliente</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Produtos</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Valor Total</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Lucro</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Criado em</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Expira em</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Ações</th>
              </tr>
            </thead>
            <tbody class="bg-card divide-y divide-border">
              <tr v-for="quote in filteredQuotes" :key="quote.id" class="hover:bg-accent/50">
                <td class="px-4 py-3 text-sm font-medium">#{{ quote.id }}</td>
                <td class="px-4 py-3 text-sm">{{ getCustomerName(quote.customerId) }}</td>
                <td class="px-4 py-3 text-sm">{{ getProductCount(quote.products) }} itens</td>
                <td class="px-4 py-3">
                  <span :class="getStatusBadgeClass(quote.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ getStatusLabel(quote.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm font-semibold text-green-600">
                  R$ {{ (quote.totalPrice || 0).toFixed(2) }}
                </td>
                <td class="px-4 py-3 text-sm font-medium text-blue-600">
                  R$ {{ (quote.totalProfit || 0).toFixed(2) }}
                </td>
                <td class="px-4 py-3 text-sm">{{ formatDate(quote.createdDate) }}</td>
                <td class="px-4 py-3 text-sm">
                  <span :class="getExpirationClass(quote.expirationDate)">
                    {{ formatDate(quote.expirationDate) }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-center gap-2">
                    <!-- Botão PDF -->
                    <button
                      @click="downloadPDF(quote.id)"
                      :disabled="loadingPDF === quote.id"
                      class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Baixar PDF"
                    >
                      <svg v-if="loadingPDF === quote.id" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd" />
                      </svg>
                    </button>

                    <!-- Botão Editar -->
                    <button
                      v-if="quote.status !== 'CONVERTED'"
                      @click="openEditModal(quote)"
                      class="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Editar Orçamento"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>

                    <!-- Botão Reenviar WhatsApp -->
                    <button
                      @click="resendWhatsApp(quote)"
                      class="p-2 text-[#25D366] hover:bg-green-50 rounded-lg transition-colors"
                      title="Reenviar via WhatsApp"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
                      </svg>
                    </button>

                    <!-- Botão Converter para Pedido -->
                    <button
                      v-if="quote.status === 'VALID'"
                      @click="openConvertDialog(quote)"
                      class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Converter para Pedido"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Dialog de Confirmação de Conversão -->
    <Dialog :open="showConvertDialog" @update:open="showConvertDialog = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Converter Orçamento em Pedido</DialogTitle>
        </DialogHeader>
        <div class="py-4">
          <p class="text-sm text-muted-foreground mb-4">
            Tem certeza que deseja converter o orçamento #{{ quoteToConvert?.id }} em um pedido?
          </p>
          <div v-if="quoteToConvert" class="bg-muted/30 rounded-lg p-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span>Cliente:</span>
              <span class="font-medium">{{ getCustomerName(quoteToConvert.customerId) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Valor Total:</span>
              <span class="font-semibold text-green-600">R$ {{ (quoteToConvert.totalPrice || 0).toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Produtos:</span>
              <span class="font-medium">{{ getProductCount(quoteToConvert.products) }} itens</span>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3">
          <button
            @click="showConvertDialog = false"
            :disabled="converting"
            class="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            @click="convertToOrder"
            :disabled="converting"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <svg v-if="converting" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ converting ? 'Convertendo...' : 'Confirmar Conversão' }}
          </button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Modal de Edição -->
    <QuoteEditModal
      :open="showEditModal"
      :quote="quoteToEdit"
      :customer-name="quoteToEdit ? getCustomerName(quoteToEdit.customerId) : ''"
      @update:open="showEditModal = $event"
      @saved="loadQuotes"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import quoteService, { type QuoteDTO } from '../services/quote'
import customerService from '../services/customer'
import productService from '../services/product'
import Dialog from '../components/ui/Dialog.vue'
import DialogContent from '../components/ui/DialogContent.vue'
import DialogHeader from '../components/ui/DialogHeader.vue'
import DialogTitle from '../components/ui/DialogTitle.vue'
import QuoteEditModal from '../components/QuoteEditModal.vue'
import { useNotification } from '../composables/useNotification'
import { useBreakpoint } from '../composables/useBreakpoint'
import { buildWhatsAppUrl, buildQuoteMessage } from '../lib/whatsapp'

const router = useRouter()
const notification = useNotification()
const { isMobile } = useBreakpoint()

const quotes = ref<any[]>([])
const customers = ref<any[]>([])
const loading = ref(true)
const loadingPDF = ref<number | null>(null)
const converting = ref(false)
const showExpiringSoon = ref(false)
const searchQuery = ref('')
const showConvertDialog = ref(false)
const quoteToConvert = ref<any>(null)
const showEditModal = ref(false)
const quoteToEdit = ref<QuoteDTO | null>(null)

const stats = computed(() => ({
  valid: quotes.value.filter(q => q.status === 'VALID').length,
  expiringSoon: quotes.value.filter(q => isExpiringSoon(q.expirationDate)).length
}))

const filteredQuotes = computed(() => {
  let result = quotes.value

  if (showExpiringSoon.value) {
    result = result.filter(q => isExpiringSoon(q.expirationDate) && q.status === 'VALID')
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(q => 
      q.id.toString().includes(query) ||
      getCustomerName(q.customerId).toLowerCase().includes(query)
    )
  }

  return result.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
})

async function loadQuotes() {
  loading.value = true
  try {
    quotes.value = await quoteService.getAll()
  } catch (error) {
    console.error('Erro ao carregar orçamentos:', error)
    notification.error('Erro', 'Não foi possível carregar os orçamentos')
  } finally {
    loading.value = false
  }
}

async function loadCustomers() {
  try {
    customers.value = await customerService.getAllNonPaginated()
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
  }
}

function getCustomerName(customerId: number): string {
  const customer = customers.value.find(c => c.id === customerId)
  return customer?.name || `Cliente #${customerId}`
}

function getProductCount(products: Record<string, number>): number {
  if (!products) return 0
  return Object.values(products).reduce((sum, qty) => sum + qty, 0)
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    VALID: 'Válido',
    EXPIRED: 'Expirado',
    CONVERTED: 'Convertido',
    CANCELED: 'Cancelado'
  }
  return labels[status] || status
}

function getStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    VALID: 'bg-green-100 text-green-800',
    EXPIRED: 'bg-red-100 text-red-800',
    CONVERTED: 'bg-blue-100 text-blue-800',
    CANCELED: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function formatDate(dateString: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function isExpiringSoon(expirationDate: string): boolean {
  if (!expirationDate) return false
  const expDate = new Date(expirationDate)
  const today = new Date()
  const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays <= 7 && diffDays >= 0
}

function getExpirationClass(expirationDate: string): string {
  if (isExpiringSoon(expirationDate)) {
    return 'text-orange-600 font-semibold'
  }
  const expDate = new Date(expirationDate)
  const today = new Date()
  if (expDate < today) {
    return 'text-red-600'
  }
  return 'text-muted-foreground'
}

async function downloadPDF(quoteId: number) {
  loadingPDF.value = quoteId
  try {
    // Chamar endpoint de PDF e fazer download
    const response = await quoteService.getPDF(quoteId)
    
    // Criar blob e fazer download
    const blob = new Blob([response], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `orcamento-${quoteId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    notification.success('Sucesso', 'PDF gerado com sucesso')
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    notification.error('Erro', 'Não foi possível gerar o PDF')
  } finally {
    loadingPDF.value = null
  }
}

function openConvertDialog(quote: any) {
  quoteToConvert.value = quote
  showConvertDialog.value = true
}

function openEditModal(quote: QuoteDTO) {
  quoteToEdit.value = quote
  showEditModal.value = true
}

async function resendWhatsApp(quote: any) {
  try {
    const customer = await customerService.getById(quote.customerId)
    if (!customer?.phoneOne) {
      notification.error('Erro', 'Cliente não tem telefone cadastrado')
      return
    }

    // Buscar produtos do quote pra montar a mensagem
    const productIds = Object.keys(quote.products || {})
    const productItems = await Promise.all(
      productIds.map(async id => {
        const p = await productService.getByKey(id)
        return {
          qty: Number(quote.products[id]),
          label: `${p.type} ${p.sheets}F ${p.color}`,
        }
      })
    )

    const message = buildQuoteMessage({
      customerName: customer.name,
      quoteId: quote.id,
      items: productItems,
      total: quote.totalPrice ?? 0,
    })
    const url = buildWhatsAppUrl(customer.phoneOne, message)
    window.open(url, '_blank', 'noopener,noreferrer')
  } catch (err: any) {
    console.error('Erro ao reenviar WhatsApp:', err)
    notification.error(
      'Erro',
      err?.response?.data?.message || 'Falha ao montar mensagem WhatsApp'
    )
  }
}

async function convertToOrder() {
  if (!quoteToConvert.value) return
  
  converting.value = true
  try {
    const order = await quoteService.convertToOrder(quoteToConvert.value.id)
    notification.success('Sucesso', `Orçamento convertido em pedido #${order.id}`)
    showConvertDialog.value = false
    quoteToConvert.value = null
    await loadQuotes()
    
    // Navegar para a página de pedidos após conversão
    router.push('/orders')
  } catch (error: any) {
    console.error('Erro ao converter orçamento:', error)
    const errorMessage = error.response?.data?.message || 'Não foi possível converter o orçamento'
    notification.error('Erro ao converter', errorMessage)
  } finally {
    converting.value = false
  }
}

onMounted(() => {
  loadQuotes()
  loadCustomers()
})
</script>

