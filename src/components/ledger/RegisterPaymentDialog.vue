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
  customerName: '',
  orderReference: '',
  amount: 0,
  amountDisplay: '',
  paymentMethod: '',
})

watch(
  () => props.open,
  open => {
    if (open) {
      form.value = { customerName: '', orderReference: '', amount: 0, amountDisplay: '', paymentMethod: '' }
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
  if (!form.value.amount || !form.value.paymentMethod) return
  saving.value = true
  try {
    // TODO: pickers reais de cliente/pedido (hoje texto livre)
    await ledgerService.recordPayment({
      amount: form.value.amount,
      paymentMethod: form.value.paymentMethod,
      receivedBy: getCurrentUser(),
      customerName: form.value.customerName || undefined,
      orderReference: form.value.orderReference || undefined,
    })
    notification.success('Sucesso', 'Pagamento registrado')
    emit('update:open', false)
    emit('saved')
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Não foi possível registrar o pagamento'
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
        <DialogTitle>Registrar Pagamento</DialogTitle>
      </DialogHeader>
      <form class="space-y-4 rounded-lg bg-muted/50 p-4" @submit.prevent="submit">
        <div>
          <label class="block text-sm font-medium text-foreground mb-1">Cliente</label>
          <Input v-model="form.customerName" placeholder="Nome do cliente/pagador (opcional)" />
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-1">Pedido</label>
          <Input v-model="form.orderReference" placeholder="Referência do pedido (opcional)" />
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
        <div>
          <label class="block text-sm font-medium text-foreground mb-1">Método de Pagamento *</label>
          <select v-model="form.paymentMethod" required :class="selectClass">
            <option value="" disabled>Selecione...</option>
            <option value="PIX">PIX</option>
            <option value="DINHEIRO">Dinheiro</option>
            <option value="CARTAO_CREDITO">Cartão de Crédito</option>
            <option value="CARTAO_DEBITO">Cartão de Débito</option>
            <option value="TRANSFERENCIA">Transferência</option>
            <option value="BOLETO">Boleto</option>
          </select>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" @click="emit('update:open', false)">Cancelar</Button>
          <Button
            type="submit"
            class="bg-success hover:bg-success/90 text-success-foreground"
            :disabled="saving || !form.amount || !form.paymentMethod"
          >
            {{ saving ? 'Salvando…' : 'Registrar' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
