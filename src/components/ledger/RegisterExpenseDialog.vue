<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from '../ui/Dialog.vue'
import DialogContent from '../ui/DialogContent.vue'
import DialogHeader from '../ui/DialogHeader.vue'
import DialogTitle from '../ui/DialogTitle.vue'
import Button from '../ui/Button.vue'
import Input from '../ui/Input.vue'
import ledgerService from '../../services/ledger'
import { useCurrency } from '../../composables/useCurrency'
import { useNotification } from '../../composables/useNotification'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean]; saved: [] }>()

const currency = useCurrency()
const notification = useNotification()

const saving = ref(false)
const form = ref({
  description: '',
  amount: 0,
  amountDisplay: '',
  expenseAccount: '',
  paymentAccount: '',
})

watch(
  () => props.open,
  open => {
    if (open) {
      form.value = { description: '', amount: 0, amountDisplay: '', expenseAccount: '', paymentAccount: '' }
    }
  }
)

function getCurrentUser(): string {
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      return user.name || user.username || 'Sistema'
    }
  } catch {
    /* ignore */
  }
  return 'Sistema'
}

function handleAmountInput(event: Event) {
  const result = currency.handleCurrencyInput(event)
  form.value.amount = result.value
  form.value.amountDisplay = result.display
  const target = event.target as HTMLInputElement
  target.value = result.display
}

async function submit() {
  if (!form.value.description || !form.value.amount || !form.value.expenseAccount || !form.value.paymentAccount) return
  saving.value = true
  try {
    await ledgerService.recordExpense(
      form.value.description,
      form.value.amount,
      form.value.expenseAccount,
      form.value.paymentAccount,
      getCurrentUser()
    )
    notification.success('Sucesso', 'Despesa registrada')
    emit('update:open', false)
    emit('saved')
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Não foi possível registrar a despesa'
    notification.error('Erro', msg)
  } finally {
    saving.value = false
  }
}

const selectClass =
  'w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Registrar Despesa</DialogTitle>
      </DialogHeader>
      <form class="space-y-4 rounded-lg bg-muted/50 p-4" @submit.prevent="submit">
        <div>
          <label class="block text-sm font-medium text-foreground mb-1">Descrição *</label>
          <Input v-model="form.description" required placeholder="Ex: Compra de vidro temperado" />
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-1">Valor *</label>
          <input
            :value="form.amountDisplay"
            type="text"
            inputmode="numeric"
            required
            placeholder="0,00"
            :class="selectClass"
            @input="handleAmountInput"
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-foreground mb-1">Tipo de Despesa *</label>
            <select v-model="form.expenseAccount" required :class="selectClass">
              <option value="" disabled>Selecione...</option>
              <option value="MATERIAL">Material</option>
              <option value="SERVICO">Serviço</option>
              <option value="TRANSPORTE">Transporte</option>
              <option value="MANUTENCAO">Manutenção</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-1">Forma de Pagamento *</label>
            <select v-model="form.paymentAccount" required :class="selectClass">
              <option value="" disabled>Selecione...</option>
              <option value="CAIXA">Caixa</option>
              <option value="BANCO">Banco</option>
              <option value="CARTAO">Cartão</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" @click="emit('update:open', false)">Cancelar</Button>
          <Button
            type="submit"
            class="bg-warning hover:bg-warning/90 text-warning-foreground"
            :disabled="saving || !form.description || !form.amount || !form.expenseAccount || !form.paymentAccount"
          >
            {{ saving ? 'Salvando…' : 'Registrar' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
