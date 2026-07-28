<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent>
      <div class="overflow-auto max-h-[80vh]">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10">
              <svg
                class="h-6 w-6 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>

          <div class="text-center">
            <DialogTitle class="text-lg font-semibold text-foreground mb-2">
              {{ title || 'Confirmar Exclusão' }}
            </DialogTitle>
            <div class="text-sm text-muted-foreground mb-6">
              <p>{{ message || 'Tem certeza que deseja excluir este item?' }}</p>
              <p v-if="itemName" class="mt-2">
                <strong class="text-foreground">{{ itemName }}</strong>
              </p>
              <p class="text-xs text-muted-foreground mt-2">
                {{ warning || 'Esta ação não pode ser desfeita.' }}
              </p>
            </div>
          </div>

          <div class="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              @click="emit('update:open', false)"
              :disabled="isDeleting"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              @click="handleConfirm"
              :disabled="isDeleting"
            >
              <span v-if="isDeleting" class="flex items-center">
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-destructive-foreground"
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
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Excluindo...
              </span>
              <span v-else>{{ confirmText || 'Excluir' }}</span>
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Dialog from './ui/Dialog.vue'
import DialogContent from './ui/DialogContent.vue'
import DialogTitle from './ui/DialogTitle.vue'
import Button from './ui/Button.vue'

const props = defineProps<{
  open: boolean
  title?: string
  message?: string
  itemName?: string
  warning?: string
  confirmText?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirm': []
}>()

const isDeleting = ref(false)

const handleConfirm = async () => {
  isDeleting.value = true
  try {
    emit('confirm')
  } finally {
    // Reset after a brief delay to allow parent to handle the event
    setTimeout(() => {
      isDeleting.value = false
    }, 100)
  }
}
</script>
