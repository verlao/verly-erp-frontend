<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import Dialog from '../ui/Dialog.vue'
import DialogContent from '../ui/DialogContent.vue'
import DialogHeader from '../ui/DialogHeader.vue'
import DialogTitle from '../ui/DialogTitle.vue'
import type { LedgerResponseDTO } from '../../services/ledger'
import ledgerService from '../../services/ledger'
import { useCurrency } from '../../composables/useCurrency'

const props = defineProps<{ open: boolean; ledger: LedgerResponseDTO | null }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const currency = useCurrency()

const loading = ref(false)
const error = ref(false)
const objectUrl = ref<string | null>(null)
const isPdf = ref(false)

function revoke() {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = null
  }
}

async function load() {
  if (!props.ledger) return
  loading.value = true
  error.value = false
  revoke()
  try {
    const blob = await ledgerService.getReceiptBlob(props.ledger.id)
    isPdf.value = blob.type.includes('pdf')
    objectUrl.value = URL.createObjectURL(blob)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

watch(
  () => props.open,
  open => {
    if (open) load()
    else revoke()
  }
)

onBeforeUnmount(revoke)
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>Comprovante</DialogTitle>
      </DialogHeader>
      <div v-if="ledger" class="space-y-3">
        <p class="text-sm text-muted-foreground">
          {{ ledger.customerName || ledger.description }} ·
          <span class="font-semibold text-foreground">{{ currency.formatCurrency(ledger.totalAmount) }}</span>
        </p>

        <div v-if="loading" class="p-10 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <p v-else-if="error" class="p-8 text-center text-sm text-muted-foreground">
          Não foi possível carregar o comprovante.
        </p>
        <template v-else-if="objectUrl">
          <iframe
            v-if="isPdf"
            :src="objectUrl"
            title="Comprovante PDF"
            class="w-full h-[70vh] rounded-md border border-border bg-muted"
          />
          <img
            v-else
            :src="objectUrl"
            alt="Comprovante"
            class="w-full max-h-[70vh] object-contain rounded-md border border-border bg-muted"
          />
        </template>
      </div>
    </DialogContent>
  </Dialog>
</template>
