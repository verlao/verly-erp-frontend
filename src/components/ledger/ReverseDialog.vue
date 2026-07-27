<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from '../ui/Dialog.vue'
import DialogContent from '../ui/DialogContent.vue'
import DialogHeader from '../ui/DialogHeader.vue'
import DialogTitle from '../ui/DialogTitle.vue'
import Button from '../ui/Button.vue'
import type { LedgerResponseDTO } from '../../services/ledger'
import ledgerService from '../../services/ledger'
import { useCurrency } from '../../composables/useCurrency'
import { useNotification } from '../../composables/useNotification'

const props = defineProps<{ open: boolean; ledger: LedgerResponseDTO | null }>()
const emit = defineEmits<{ 'update:open': [value: boolean]; reversed: [] }>()

const currency = useCurrency()
const notification = useNotification()

const reason = ref('')
const reversing = ref(false)

watch(
  () => props.open,
  open => {
    if (open) reason.value = ''
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

async function submit() {
  if (!props.ledger || !reason.value.trim()) return
  reversing.value = true
  try {
    await ledgerService.reverse(props.ledger.id, {
      reason: reason.value.trim(),
      createdBy: getCurrentUser(),
    })
    notification.success('Sucesso', 'Lançamento estornado')
    emit('update:open', false)
    emit('reversed')
  } catch (error: any) {
    const msg = error.response?.data?.message || 'Não foi possível estornar o lançamento'
    notification.error('Erro', msg)
  } finally {
    reversing.value = false
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Estornar Lançamento</DialogTitle>
      </DialogHeader>
      <div v-if="ledger" class="space-y-4">
        <div class="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
          <p class="text-muted-foreground">
            Descrição: <span class="text-foreground">{{ ledger.customerName || ledger.description }}</span>
          </p>
          <p class="text-muted-foreground">
            Valor:
            <span class="font-semibold text-success">{{ currency.formatCurrency(ledger.totalAmount) }}</span>
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-1">Motivo do estorno *</label>
          <textarea
            v-model="reason"
            rows="3"
            required
            placeholder="Explique o motivo do estorno..."
            class="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="emit('update:open', false)">Cancelar</Button>
          <Button
            class="bg-warning hover:bg-warning/90 text-warning-foreground"
            :disabled="reversing || !reason.trim()"
            @click="submit"
          >
            {{ reversing ? 'Estornando…' : 'Confirmar Estorno' }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
