<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-foreground">Gerenciar Custos de Cartão de Crédito</h1>
    </div>

    <!-- Tabela de Custos -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-6 text-center">
        <p class="text-muted-foreground">Carregando...</p>
      </div>
      <div v-else-if="!creditCardCosts || creditCardCosts.length === 0" class="p-6 text-center">
        <p class="text-muted-foreground">Nenhum custo encontrado</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor (%)</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- Taxas de Cartão -->
            <tr class="bg-gray-50">
              <td colspan="2" class="px-6 py-3 text-sm font-semibold text-foreground">Taxas de Cartão de Crédito</td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">Débito</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                <EditableCell 
                  v-if="creditCardCosts[0]" 
                  :cost="creditCardCosts[0]" 
                  field="debit" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
              </td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">1x</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                <EditableCell 
                  v-if="creditCardCosts[0]" 
                  :cost="creditCardCosts[0]" 
                  field="tax1x" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
              </td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">2x</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                <EditableCell 
                  v-if="creditCardCosts[0]" 
                  :cost="creditCardCosts[0]" 
                  field="tax2x" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
              </td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">3x</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                <EditableCell 
                  v-if="creditCardCosts[0]" 
                  :cost="creditCardCosts[0]" 
                  field="tax3x" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
              </td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">4x</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                <EditableCell 
                  v-if="creditCardCosts[0]" 
                  :cost="creditCardCosts[0]" 
                  field="tax4x" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
              </td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">5x</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                <EditableCell 
                  v-if="creditCardCosts[0]" 
                  :cost="creditCardCosts[0]" 
                  field="tax5x" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
              </td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">6x</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                <EditableCell 
                  v-if="creditCardCosts[0]" 
                  :cost="creditCardCosts[0]" 
                  field="tax6x" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
              </td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">7x</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                <EditableCell 
                  v-if="creditCardCosts[0]" 
                  :cost="creditCardCosts[0]" 
                  field="tax7x" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
              </td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">8x</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                <EditableCell 
                  v-if="creditCardCosts[0]" 
                  :cost="creditCardCosts[0]" 
                  field="tax8x" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
              </td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">9x</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                <EditableCell 
                  v-if="creditCardCosts[0]" 
                  :cost="creditCardCosts[0]" 
                  field="tax9x" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
              </td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">10x</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                <EditableCell 
                  v-if="creditCardCosts[0]" 
                  :cost="creditCardCosts[0]" 
                  field="tax10x" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
              </td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">11x</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                <EditableCell 
                  v-if="creditCardCosts[0]" 
                  :cost="creditCardCosts[0]" 
                  field="tax11x" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
              </td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">12x</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                <EditableCell 
                  v-if="creditCardCosts[0]" 
                  :cost="creditCardCosts[0]" 
                  field="tax12x" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
              </td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">13x</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                <EditableCell 
                  v-if="creditCardCosts[0]" 
                  :cost="creditCardCosts[0]" 
                  field="tax13x" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
              </td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">14x</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                <EditableCell 
                  v-if="creditCardCosts[0]" 
                  :cost="creditCardCosts[0]" 
                  field="tax14x" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
              </td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">15x</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                <EditableCell 
                  v-if="creditCardCosts[0]" 
                  :cost="creditCardCosts[0]" 
                  field="tax15x" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
              </td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">16x</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                <EditableCell 
                  v-if="creditCardCosts[0]" 
                  :cost="creditCardCosts[0]" 
                  field="tax16x" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
              </td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">17x</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                <EditableCell 
                  v-if="creditCardCosts[0]" 
                  :cost="creditCardCosts[0]" 
                  field="tax17x" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
              </td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">18x</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                <EditableCell 
                  v-if="creditCardCosts[0]" 
                  :cost="creditCardCosts[0]" 
                  field="tax18x" 
                  :is-percent="true"
                  @update="handleInlineEdit"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import EditableCell from '../components/EditableCell.vue'
import creditCardCostService from '../services/credit-card-cost'
import type { CreditCardCostDTO } from '../services/credit-card-cost'
import { useNotificationStore } from '../stores/notification'

const creditCardCosts = ref<CreditCardCostDTO[]>([])
const loading = ref(true)
const notificationStore = useNotificationStore()

const loadData = async () => {
  try {
    loading.value = true
    const costsData = await creditCardCostService.getAll()
    creditCardCosts.value = costsData
  } catch (error) {
    notificationStore.error('Erro ao carregar dados')
  } finally {
    loading.value = false
  }
}

const handleInlineEdit = async (field: string, value: any) => {
  try {
    if (creditCardCosts.value[0]) {
      const updatedCost = { ...creditCardCosts.value[0], [field]: value }
      await creditCardCostService.update(updatedCost)
      notificationStore.success('Custo atualizado com sucesso!')
      await loadData()
    }
  } catch (error) {
    notificationStore.error('Erro ao atualizar custo')
  }
}

onMounted(() => {
  loadData()
})
</script>