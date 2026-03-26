<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4 md:mb-8">
        <div>
          <h1 class="text-xl md:text-2xl font-semibold text-foreground">Lançamentos</h1>
          <p class="text-muted-foreground mt-1 hidden md:block">Registre pagamentos e despesas</p>
        </div>
        <!-- Mobile: icon buttons -->
        <div class="flex gap-2 md:hidden">
          <button @click="openPaymentModal" class="w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </button>
          <button @click="openExpenseModal" class="w-10 h-10 rounded-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          </button>
        </div>
        <!-- Desktop: full buttons -->
        <div class="hidden md:flex gap-2">
          <Button @click="openPaymentModal" class="bg-green-600 hover:bg-green-700 text-white gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Registrar Pagamento
          </Button>
          <Button @click="openExpenseModal" class="bg-orange-600 hover:bg-orange-700 text-white gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            Registrar Despesa
          </Button>
        </div>
      </div>

      <!-- Cards de Resumo -->
      <div class="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
        <Card class="bg-card border-border p-3 md:p-6 hover:shadow-lg transition-shadow duration-200">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-emerald-500/10 text-emerald-600 hidden md:flex">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg>
            </div>
            <div class="md:ml-4">
              <h2 class="text-muted-foreground text-xs md:text-sm font-medium">Receitas</h2>
              <p v-if="!loadingSummary" class="text-base md:text-2xl font-bold text-emerald-600">{{ currency.formatCurrency(summary.totalRevenue) }}</p>
              <Skeleton v-else class="h-5 md:h-7 w-16 md:w-28" />
            </div>
          </div>
        </Card>

        <Card class="bg-card border-border p-3 md:p-6 hover:shadow-lg transition-shadow duration-200">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-red-500/10 text-red-600 hidden md:flex">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22,17 13.5,8.5 8.5,13.5 2,7"/><polyline points="16,17 22,17 22,11"/></svg>
            </div>
            <div class="md:ml-4">
              <h2 class="text-muted-foreground text-xs md:text-sm font-medium">Despesas</h2>
              <p v-if="!loadingSummary" class="text-base md:text-2xl font-bold text-red-600">{{ currency.formatCurrency(summary.totalExpenses) }}</p>
              <Skeleton v-else class="h-5 md:h-7 w-16 md:w-28" />
            </div>
          </div>
        </Card>

        <Card class="bg-card border-border p-3 md:p-6 hover:shadow-lg transition-shadow duration-200">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-primary/10 text-primary hidden md:flex">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>
            </div>
            <div class="md:ml-4">
              <h2 class="text-muted-foreground text-xs md:text-sm font-medium">Saldo</h2>
              <p v-if="!loadingSummary" class="text-base md:text-2xl font-bold" :class="summary.balance >= 0 ? 'text-foreground' : 'text-red-600'">{{ currency.formatCurrency(summary.balance) }}</p>
              <Skeleton v-else class="h-5 md:h-7 w-16 md:w-28" />
            </div>
          </div>
        </Card>
      </div>

      <!-- Filtros de Data -->
      <!-- Mobile: collapsible -->
      <div class="md:hidden mb-4">
        <button
          @click="showFilters = !showFilters"
          class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
          Filtros
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform', showFilters ? 'rotate-180' : '']"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div v-if="showFilters" class="bg-card rounded-lg shadow-sm border border-border p-4 mt-2">
          <div class="flex flex-col gap-3">
            <div>
              <label for="startDateMobile" class="block text-xs font-medium text-muted-foreground mb-1">Data Inicial</label>
              <input id="startDateMobile" v-model="filters.startDate" type="date" class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label for="endDateMobile" class="block text-xs font-medium text-muted-foreground mb-1">Data Final</label>
              <input id="endDateMobile" v-model="filters.endDate" type="date" class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <Button @click="applyFilters(); showFilters = false" size="sm" class="w-full">Filtrar</Button>
          </div>
        </div>
      </div>
      <!-- Desktop: always visible -->
      <div class="hidden md:block bg-card rounded-lg shadow-sm border border-border p-4 mb-6">
        <div class="flex gap-4">
          <div class="flex-1">
            <label for="startDate" class="block text-sm font-medium text-muted-foreground mb-1">Data Inicial</label>
            <input id="startDate" v-model="filters.startDate" type="date" class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div class="flex-1">
            <label for="endDate" class="block text-sm font-medium text-muted-foreground mb-1">Data Final</label>
            <input id="endDate" v-model="filters.endDate" type="date" class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div class="flex items-end">
            <Button @click="applyFilters">Filtrar</Button>
          </div>
        </div>
      </div>

      <!-- Tabela de Lançamentos -->
      <div class="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div v-if="loading" class="flex items-center justify-center h-64">
          <div class="flex items-center space-x-3">
            <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-muted-foreground font-medium">Carregando lançamentos...</span>
          </div>
        </div>

        <div v-else-if="ledgers.length === 0" class="text-center py-16">
          <div class="bg-muted rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-foreground mb-2">Nenhum lançamento encontrado</h3>
          <p class="text-muted-foreground">Use os botões acima para registrar pagamentos ou despesas.</p>
        </div>

        <template v-else>
          <!-- Unified transaction list -->
          <div class="divide-y divide-border">
            <div
              v-for="ledger in ledgers"
              :key="ledger.id"
              class="flex items-start justify-between px-4 py-3 md:py-4 hover:bg-accent/50 transition-colors cursor-pointer"
              @click="(ledger.status === 'PENDING' || ledger.status === 'POSTED') ? (expandedMobileId = expandedMobileId === ledger.id ? null : ledger.id) : null"
            >
              <!-- Left: description + metadata -->
              <div class="flex-1 min-w-0 mr-4">
                <p class="text-sm md:text-base font-medium truncate">{{ ledger.description }}</p>
                <p class="text-xs md:text-sm text-muted-foreground mt-0.5">
                  {{ formatDate(ledger.entryDate) }} · {{ formatDocType(ledger.documentType) }}
                  <span v-if="ledger.orderReference || ledger.orderId"> · {{ ledger.orderReference || `#${ledger.orderId}` }}</span>
                  <span v-if="ledger.customerName"> · {{ ledger.customerName }}</span>
                </p>
                <!-- Actions: mobile = expanded on tap, desktop = always visible -->
                <div v-if="(ledger.status === 'PENDING' || ledger.status === 'POSTED') && (expandedMobileId === ledger.id || !isMobile)" class="flex gap-2 mt-2">
                  <button v-if="ledger.status === 'PENDING'" @click.stop="postLedger(ledger)" :disabled="actionLoading === ledger.id" class="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 disabled:opacity-50 transition-colors">Postar</button>
                  <button v-if="ledger.status === 'PENDING'" @click.stop="cancelLedger(ledger)" :disabled="actionLoading === ledger.id" class="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200 disabled:opacity-50 transition-colors">Cancelar</button>
                  <button v-if="ledger.status === 'POSTED'" @click.stop="openReverseDialog(ledger)" :disabled="actionLoading === ledger.id" class="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full hover:bg-orange-200 disabled:opacity-50 transition-colors">Estornar</button>
                </div>
              </div>
              <!-- Right: amount + status -->
              <div class="text-right flex-shrink-0">
                <p class="text-sm md:text-base font-semibold" :class="ledger.documentType === 'EXPENSE' ? 'text-red-600' : 'text-green-600'">
                  {{ ledger.documentType === 'EXPENSE' ? '-' : '+' }} {{ currency.formatCurrency(ledger.totalAmount) }}
                </p>
                <span :class="getStatusClass(ledger.status)" class="px-2 py-0.5 text-[10px] md:text-xs font-medium rounded-full">
                  {{ formatStatus(ledger.status) }}
                </span>
              </div>
            </div>
          </div>

          <Pagination
            v-if="totalItems > 0"
            :current-page="currentPage"
            :total-items="totalItems"
            :page-size="pageSize"
            @page-changed="handlePageChange"
            @page-size-changed="handlePageSizeChange"
          />
        </template>
      </div>
    </div>

    <!-- Modal Registrar Pagamento -->
    <Dialog :open="showPaymentModal" @update:open="showPaymentModal = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="submitPayment" class="space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg space-y-4">
            <div>
              <label for="paymentName" class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                id="paymentName"
                v-model="paymentForm.customerName"
                type="text"
                placeholder="Nome do cliente/pagador (opcional)"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label for="paymentOrder" class="block text-sm font-medium text-gray-700 mb-1">Pedido</label>
              <input
                id="paymentOrder"
                v-model="paymentForm.orderReference"
                type="text"
                placeholder="Referência do pedido (opcional)"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label for="paymentAmount" class="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              <input
                id="paymentAmount"
                :value="paymentForm.amountDisplay"
                @input="handlePaymentAmountInput"
                type="text"
                inputmode="numeric"
                required
                placeholder="R$ 0,00"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label for="paymentMethod" class="block text-sm font-medium text-gray-700 mb-1">Método de Pagamento</label>
              <select
                id="paymentMethod"
                v-model="paymentForm.paymentMethod"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="" disabled>Selecione</option>
                <option value="PIX">PIX</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                <option value="CARTAO_DEBITO">Cartão de Débito</option>
                <option value="TRANSFERENCIA">Transferência</option>
                <option value="BOLETO">Boleto</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" @click="showPaymentModal = false" :disabled="savingPayment">
              Cancelar
            </Button>
            <Button type="submit" :disabled="savingPayment" class="bg-green-600 hover:bg-green-700 text-white gap-2">
              <svg v-if="savingPayment" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ savingPayment ? 'Registrando...' : 'Registrar Pagamento' }}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Modal Registrar Despesa -->
    <Dialog :open="showExpenseModal" @update:open="showExpenseModal = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Despesa</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="submitExpense" class="space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg space-y-4">
            <div>
              <label for="expenseDescription" class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input
                id="expenseDescription"
                v-model="expenseForm.description"
                type="text"
                required
                placeholder="Ex: Compra de vidro temperado"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label for="expenseAmount" class="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              <input
                id="expenseAmount"
                :value="expenseForm.amountDisplay"
                @input="handleExpenseAmountInput"
                type="text"
                inputmode="numeric"
                required
                placeholder="R$ 0,00"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="expenseAccount" class="block text-sm font-medium text-gray-700 mb-1">Tipo de Despesa</label>
                <select
                  id="expenseAccount"
                  v-model="expenseForm.expenseAccount"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="" disabled>Selecione</option>
                  <option value="MATERIAL">Material</option>
                  <option value="SERVICO">Serviço</option>
                  <option value="TRANSPORTE">Transporte</option>
                  <option value="MANUTENCAO">Manutenção</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>

              <div>
                <label for="paymentAccount" class="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                <select
                  id="paymentAccount"
                  v-model="expenseForm.paymentAccount"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="" disabled>Selecione</option>
                  <option value="CAIXA">Caixa</option>
                  <option value="BANCO">Banco</option>
                  <option value="CARTAO">Cartão</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" @click="showExpenseModal = false" :disabled="savingExpense">
              Cancelar
            </Button>
            <Button type="submit" :disabled="savingExpense" class="bg-orange-600 hover:bg-orange-700 text-white gap-2">
              <svg v-if="savingExpense" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ savingExpense ? 'Registrando...' : 'Registrar Despesa' }}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Dialog de Estorno -->
    <Dialog :open="showReverseDialog" @update:open="showReverseDialog = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Estornar Lançamento</DialogTitle>
        </DialogHeader>
        <div class="py-2">
          <p class="text-sm text-muted-foreground mb-4">
            Tem certeza que deseja estornar o lançamento abaixo?
          </p>
          <div v-if="ledgerToReverse" class="bg-muted/30 rounded-lg p-4 space-y-2 mb-4">
            <div class="flex justify-between text-sm">
              <span>Descrição:</span>
              <span class="font-medium">{{ ledgerToReverse.description }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Valor:</span>
              <span class="font-semibold text-green-600">{{ currency.formatCurrency(ledgerToReverse.totalAmount) }}</span>
            </div>
          </div>
          <div>
            <label for="reverseReason" class="block text-sm font-medium text-gray-700 mb-1">Motivo do Estorno</label>
            <textarea
              id="reverseReason"
              v-model="reverseReason"
              required
              rows="3"
              placeholder="Informe o motivo do estorno..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            ></textarea>
          </div>
        </div>
        <div class="flex justify-end gap-3">
          <Button variant="outline" @click="showReverseDialog = false" :disabled="reversing">
            Cancelar
          </Button>
          <Button @click="submitReverse" :disabled="reversing || !reverseReason.trim()" class="bg-orange-600 hover:bg-orange-700 text-white gap-2">
            <svg v-if="reversing" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ reversing ? 'Estornando...' : 'Confirmar Estorno' }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ledgerService from '../services/ledger'
import type { LedgerResponseDTO, LedgerSummaryDTO } from '../services/ledger'
import Dialog from '../components/ui/Dialog.vue'
import DialogContent from '../components/ui/DialogContent.vue'
import DialogHeader from '../components/ui/DialogHeader.vue'
import DialogTitle from '../components/ui/DialogTitle.vue'
import Button from '../components/ui/Button.vue'
import Card from '../components/ui/Card.vue'
import Skeleton from '../components/ui/Skeleton.vue'
import Pagination from '../components/ui/Pagination.vue'
import { useCurrency } from '../composables/useCurrency'
import { useNotification } from '../composables/useNotification'

const currency = useCurrency()
const notification = useNotification()

// UI state
const showFilters = ref(false)
const expandedMobileId = ref<number | null>(null)
const isMobile = ref(false)

const updateIsMobile = () => { isMobile.value = window.innerWidth < 768 }

// Data
const ledgers = ref<LedgerResponseDTO[]>([])
const loading = ref(true)
const loadingSummary = ref(true)
const actionLoading = ref<number | null>(null)
const summary = ref<LedgerSummaryDTO>({ totalRevenue: 0, totalExpenses: 0, balance: 0, count: 0 })

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)

// Filters
const filters = ref({
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0]
})

// Payment modal
const showPaymentModal = ref(false)
const savingPayment = ref(false)
const paymentForm = ref({
  customerName: '',
  orderReference: '',
  amount: 0,
  amountDisplay: '',
  paymentMethod: ''
})

// Expense modal
const showExpenseModal = ref(false)
const savingExpense = ref(false)
const expenseForm = ref({
  description: '',
  amount: 0,
  amountDisplay: '',
  expenseAccount: '',
  paymentAccount: ''
})

// Reverse dialog
const showReverseDialog = ref(false)
const reversing = ref(false)
const ledgerToReverse = ref<LedgerResponseDTO | null>(null)
const reverseReason = ref('')

function getCurrentUser(): string {
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      return user.name || user.username || 'Sistema'
    }
  } catch { /* ignore */ }
  return 'Sistema'
}

// Load data
async function loadLedgers() {
  loading.value = true
  try {
    const response = await ledgerService.getByDateRangePaginated(
      filters.value.startDate,
      filters.value.endDate,
      currentPage.value - 1,
      pageSize.value
    )
    ledgers.value = response.content
    totalItems.value = response.totalElements
  } catch (error) {
    console.error('Erro ao carregar lançamentos:', error)
    notification.error('Erro', 'Não foi possível carregar os lançamentos')
  } finally {
    loading.value = false
  }
}

async function loadSummary() {
  loadingSummary.value = true
  try {
    summary.value = await ledgerService.getSummary(filters.value.startDate, filters.value.endDate)
  } catch (error) {
    console.error('Erro ao carregar resumo:', error)
  } finally {
    loadingSummary.value = false
  }
}

function applyFilters() {
  currentPage.value = 1
  loadLedgers()
  loadSummary()
}

function handlePageChange(page: number) {
  currentPage.value = page
  loadLedgers()
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  loadLedgers()
}

function formatDate(dateString: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}

function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'POSTED': 'bg-green-100 text-green-800',
    'REVERSED': 'bg-red-100 text-red-800',
    'CANCELLED': 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'Pendente',
    'POSTED': 'Postado',
    'REVERSED': 'Estornado',
    'CANCELLED': 'Cancelado'
  }
  return statusMap[status] || status
}

function getDocTypeClass(docType: string): string {
  const classes: Record<string, string> = {
    'PAYMENT': 'bg-green-100 text-green-800',
    'EXPENSE': 'bg-red-100 text-red-800',
    'REVERSAL': 'bg-orange-100 text-orange-800'
  }
  return classes[docType] || 'bg-gray-100 text-gray-800'
}

function formatDocType(docType: string): string {
  const map: Record<string, string> = {
    'PAYMENT': 'Pagamento',
    'EXPENSE': 'Despesa',
    'REVERSAL': 'Estorno'
  }
  return map[docType] || docType
}

// Payment modal
function openPaymentModal() {
  paymentForm.value = { customerName: '', orderReference: '', amount: 0, amountDisplay: '', paymentMethod: '' }
  showPaymentModal.value = true
}

function handlePaymentAmountInput(event: Event) {
  const result = currency.handleCurrencyInput(event)
  paymentForm.value.amount = result.value
  paymentForm.value.amountDisplay = result.display
  const target = event.target as HTMLInputElement
  target.value = result.display
}

async function submitPayment() {
  if (!paymentForm.value.amount || !paymentForm.value.paymentMethod) return
  savingPayment.value = true
  try {
    await ledgerService.recordPayment({
      amount: paymentForm.value.amount,
      paymentMethod: paymentForm.value.paymentMethod,
      receivedBy: getCurrentUser(),
      customerName: paymentForm.value.customerName || undefined,
      orderReference: paymentForm.value.orderReference || undefined
    })
    notification.success('Sucesso', 'Pagamento registrado com sucesso')
    showPaymentModal.value = false
    loadLedgers()
    loadSummary()
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Não foi possível registrar o pagamento'
    notification.error('Erro', msg)
  } finally {
    savingPayment.value = false
  }
}

// Expense modal
function openExpenseModal() {
  expenseForm.value = { description: '', amount: 0, amountDisplay: '', expenseAccount: '', paymentAccount: '' }
  showExpenseModal.value = true
}

function handleExpenseAmountInput(event: Event) {
  const result = currency.handleCurrencyInput(event)
  expenseForm.value.amount = result.value
  expenseForm.value.amountDisplay = result.display
  const target = event.target as HTMLInputElement
  target.value = result.display
}

async function submitExpense() {
  if (!expenseForm.value.description || !expenseForm.value.amount || !expenseForm.value.expenseAccount || !expenseForm.value.paymentAccount) return
  savingExpense.value = true
  try {
    await ledgerService.recordExpense(
      expenseForm.value.description,
      expenseForm.value.amount,
      expenseForm.value.expenseAccount,
      expenseForm.value.paymentAccount,
      getCurrentUser()
    )
    notification.success('Sucesso', 'Despesa registrada com sucesso')
    showExpenseModal.value = false
    loadLedgers()
    loadSummary()
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Não foi possível registrar a despesa'
    notification.error('Erro', msg)
  } finally {
    savingExpense.value = false
  }
}

// Table actions
async function postLedger(ledger: LedgerResponseDTO) {
  actionLoading.value = ledger.id
  try {
    await ledgerService.post(ledger.id)
    notification.success('Sucesso', `Lançamento postado`)
    loadLedgers()
    loadSummary()
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Não foi possível postar o lançamento'
    notification.error('Erro', msg)
  } finally {
    actionLoading.value = null
  }
}

async function cancelLedger(ledger: LedgerResponseDTO) {
  actionLoading.value = ledger.id
  try {
    await ledgerService.cancel(ledger.id)
    notification.success('Sucesso', `Lançamento cancelado`)
    loadLedgers()
    loadSummary()
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Não foi possível cancelar o lançamento'
    notification.error('Erro', msg)
  } finally {
    actionLoading.value = null
  }
}

function openReverseDialog(ledger: LedgerResponseDTO) {
  ledgerToReverse.value = ledger
  reverseReason.value = ''
  showReverseDialog.value = true
}

async function submitReverse() {
  if (!ledgerToReverse.value || !reverseReason.value.trim()) return
  reversing.value = true
  try {
    await ledgerService.reverse(ledgerToReverse.value.id, {
      reason: reverseReason.value.trim(),
      createdBy: getCurrentUser()
    })
    notification.success('Sucesso', `Lançamento estornado`)
    showReverseDialog.value = false
    ledgerToReverse.value = null
    loadLedgers()
    loadSummary()
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Não foi possível estornar o lançamento'
    notification.error('Erro', msg)
  } finally {
    reversing.value = false
  }
}

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
  loadLedgers()
  loadSummary()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile)
})
</script>
