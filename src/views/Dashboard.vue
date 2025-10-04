<template>
  <div>
    <!-- Error Message -->
    <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div>
          <p class="font-medium">Erro de Conexão</p>
          <p class="text-sm">{{ errorMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Dashboard Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <!-- Card de Clientes -->
      <Card class="bg-card border-border p-6 hover:shadow-lg transition-shadow duration-200">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-primary/10 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div class="ml-4">
            <h2 class="text-muted-foreground text-sm font-medium">Total de Clientes</h2>
            <p v-if="!loading" class="text-3xl font-bold text-foreground">{{ customerCount }}</p>
            <Skeleton v-else class="h-8 w-16" />
          </div>
        </div>
      </Card>

      <!-- Card de Produtos -->
      <Card class="bg-card border-border p-6 hover:shadow-lg transition-shadow duration-200">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-500/10 text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
          </div>
          <div class="ml-4">
            <h2 class="text-muted-foreground text-sm font-medium">Total de Produtos</h2>
            <p v-if="!loading" class="text-3xl font-bold text-foreground">{{ productCount }}</p>
            <Skeleton v-else class="h-8 w-16" />
          </div>
        </div>
      </Card>

      <!-- Card de Pedidos -->
      <Card class="bg-card border-border p-6 hover:shadow-lg transition-shadow duration-200">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-500/10 text-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
          </div>
          <div class="ml-4">
            <h2 class="text-muted-foreground text-sm font-medium">Total de Pedidos</h2>
            <p v-if="!loading" class="text-3xl font-bold text-foreground">{{ orderCount }}</p>
            <Skeleton v-else class="h-8 w-16" />
          </div>
        </div>
      </Card>

      <!-- Card de Fluxo de Caixa -->
      <Card class="bg-card border-border p-6 hover:shadow-lg transition-shadow duration-200">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-amber-500/10 text-amber-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-banknote"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
          </div>
          <div class="ml-4">
            <h2 class="text-muted-foreground text-sm font-medium">Saldo Atual</h2>
            <p v-if="!loading" class="text-3xl font-bold text-foreground">R$ {{ cashFlowBalance.toFixed(2) }}</p>
            <Skeleton v-else class="h-8 w-20" />
          </div>
        </div>
      </Card>

      <!-- Card de Leads -->
      <Card class="bg-card border-border p-6 hover:shadow-lg transition-shadow duration-200">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-500/10 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-target"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </div>
          <div class="ml-4">
            <h2 class="text-muted-foreground text-sm font-medium">Total de Leads</h2>
            <p v-if="!loading" class="text-3xl font-bold text-foreground">{{ leadCount }}</p>
            <Skeleton v-else class="h-8 w-16" />
          </div>
        </div>
      </Card>
    </div>

    <!-- Revenue Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Receita Mensal -->
      <Card class="bg-card border-border p-6 hover:shadow-lg transition-shadow duration-200">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-emerald-500/10 text-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg>
          </div>
          <div class="ml-4">
            <h2 class="text-muted-foreground text-sm font-medium">Receita Mensal</h2>
            <p v-if="!loading" class="text-2xl font-bold text-foreground">R$ {{ monthlyRevenue.toFixed(2) }}</p>
            <Skeleton v-else class="h-6 w-20" />
          </div>
        </div>
      </Card>

      <!-- Receita Semanal -->
      <Card class="bg-card border-border p-6 hover:shadow-lg transition-shadow duration-200">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-cyan-500/10 text-cyan-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-days"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
          </div>
          <div class="ml-4">
            <h2 class="text-muted-foreground text-sm font-medium">Receita Semanal</h2>
            <p v-if="!loading" class="text-2xl font-bold text-foreground">R$ {{ weeklyRevenue.toFixed(2) }}</p>
            <Skeleton v-else class="h-6 w-20" />
          </div>
        </div>
      </Card>

      <!-- Receita Diária -->
      <Card class="bg-card border-border p-6 hover:shadow-lg transition-shadow duration-200">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-orange-500/10 text-orange-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>
          </div>
          <div class="ml-4">
            <h2 class="text-muted-foreground text-sm font-medium">Receita Diária</h2>
            <p v-if="!loading" class="text-2xl font-bold text-foreground">R$ {{ dailyRevenue.toFixed(2) }}</p>
            <Skeleton v-else class="h-6 w-20" />
          </div>
        </div>
      </Card>
    </div>

    <!-- Recent Activities -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Pedidos Recentes -->
      <Card class="bg-card border-border">
        <div class="p-6 border-b border-border">
          <h3 class="text-xl font-semibold text-foreground">Pedidos Recentes</h3>
        </div>
        <div class="p-6">
          <div v-if="loading" class="text-center py-8">
            <p class="text-muted-foreground">Carregando...</p>
          </div>
          <div v-else-if="recentOrders.length === 0" class="text-center py-8">
            <p class="text-muted-foreground">Nenhum pedido encontrado</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="order in recentOrders" :key="order.id" class="flex items-center justify-between p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-foreground">#{{ order.id }}</span>
                  <span :class="getStatusClass(order.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ order.status }}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground mt-1">{{ order.customerName || 'Cliente #' + order.customerId }}</p>
              </div>
              <div class="text-right">
                <p class="font-medium text-foreground">R$ {{ (order.price || order.totalPrice || 0).toFixed(2) }}</p>
                <p class="text-xs text-muted-foreground">{{ formatDate(order.createdAt || order.createdDate) }}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Leads Recentes -->
      <Card class="bg-card border-border">
        <div class="p-6 border-b border-border">
          <h3 class="text-xl font-semibold text-foreground">Leads Recentes</h3>
        </div>
        <div class="p-6">
          <div v-if="loading" class="text-center py-8">
            <p class="text-muted-foreground">Carregando...</p>
          </div>
          <div v-else-if="recentLeads.length === 0" class="text-center py-8">
            <p class="text-muted-foreground">Nenhum lead encontrado</p>
          </div>
          <div v-else class="space-y-4">
            <div v-for="lead in recentLeads" :key="lead.id" class="flex items-center justify-between p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-foreground">{{ lead.name || 'Lead #' + lead.id }}</span>
                  <span :class="getLeadStatusClass(lead.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ lead.status || 'NOVO' }}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground mt-1">{{ lead.phone || lead.email || 'Sem contato' }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-muted-foreground">{{ formatDate(lead.createdAt || lead.createdDate) }}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
     </div>

     <!-- System Health -->
     <Card class="bg-card border-border mb-6" v-if="dashboardData?.health">
       <div class="p-6 border-b border-border">
         <h3 class="text-xl font-semibold text-foreground">Status do Sistema</h3>
       </div>
       <div class="p-6">
         <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
           <!-- Database Status -->
            <div class="flex items-center space-x-3">
              <div :class="dashboardData.health.database === 'UP' ? 'bg-green-500' : 'bg-red-500'" class="w-3 h-3 rounded-full"></div>
              <div>
                <p class="text-sm font-medium text-foreground">Banco de Dados</p>
                <p class="text-xs text-muted-foreground">{{ dashboardData.health.database === 'UP' ? 'Conectado' : 'Desconectado' }}</p>
              </div>
            </div>

            <!-- Memory Usage -->
            <div class="flex items-center space-x-3">
              <div class="p-2 rounded-full bg-blue-500/10 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cpu"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
              </div>
              <div>
                <p class="text-sm font-medium text-foreground">Uso de Memória</p>
                <p class="text-xs text-muted-foreground">{{ dashboardData.health.memoryUsed }}/{{ dashboardData.health.memoryTotal }} MB ({{ ((dashboardData.health.memoryUsed / dashboardData.health.memoryTotal) * 100).toFixed(1) }}%)</p>
              </div>
            </div>

            <!-- Available Processors -->
            <div class="flex items-center space-x-3">
              <div class="p-2 rounded-full bg-purple-500/10 text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-server"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
              </div>
              <div>
                <p class="text-sm font-medium text-foreground">Processadores</p>
                <p class="text-xs text-muted-foreground">{{ dashboardData.health.processors }} disponíveis</p>
              </div>
            </div>
         </div>
       </div>
     </Card>
   </div>
 </template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dashboardService from '../services/dashboard'
import type { DashboardSummary } from '../services/dashboard'
import Card from '../components/ui/Card.vue'
import Skeleton from '../components/ui/Skeleton.vue'

// Dashboard data
const dashboardData = ref<DashboardSummary | null>(null)
const loading = ref(true)
const errorMessage = ref<string | null>(null)

// Computed properties for easy access to data
const customerCount = computed(() => dashboardData.value?.metrics?.totalCustomers || 0)
const productCount = computed(() => dashboardData.value?.metrics?.totalProducts || 0)
const orderCount = computed(() => dashboardData.value?.metrics?.totalOrders || 0)
const leadCount = computed(() => dashboardData.value?.metrics?.totalLeads || 0)
const cashFlowBalance = computed(() => dashboardData.value?.metrics?.totalCashFlows || 0)
const recentOrders = computed(() => dashboardData.value?.activities?.recentOrders || [])
const recentLeads = computed(() => dashboardData.value?.activities?.recentLeads || [])
const monthlyRevenue = computed(() => dashboardData.value?.revenue?.monthlyRevenue || 0)
const weeklyRevenue = computed(() => dashboardData.value?.revenue?.weeklyRevenue || 0)
const dailyRevenue = computed(() => dashboardData.value?.revenue?.dailyRevenue || 0)

onMounted(async () => {
  try {
    loading.value = true
    errorMessage.value = null
    
    // Load dashboard data from the API
    dashboardData.value = await dashboardService.getSummary()
    
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error)
    errorMessage.value = 'Erro ao conectar com o servidor. Verifique sua conexão e tente novamente.'
  } finally {
    loading.value = false
  }
})

// Helper functions remain the same

const getStatusClass = (status: string) => {
  switch (status) {
    case 'PENDENTE':
      return 'bg-yellow-100 text-yellow-800'
    case 'CONCLUIDO':
      return 'bg-green-100 text-green-800'
    case 'CANCELADO':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getLeadStatusClass = (status: string) => {
  switch (status) {
    case 'NOVO':
      return 'bg-blue-100 text-blue-800'
    case 'CONTATO':
      return 'bg-yellow-100 text-yellow-800'
    case 'QUALIFICADO':
      return 'bg-purple-100 text-purple-800'
    case 'PROPOSTA':
      return 'bg-orange-100 text-orange-800'
    case 'FECHADO':
      return 'bg-green-100 text-green-800'
    case 'PERDIDO':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Data inválida'
  return new Intl.DateTimeFormat('pt-BR').format(date)
}
</script>