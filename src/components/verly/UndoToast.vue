<template>
  <div
    class="flex min-h-11 flex-wrap items-center gap-3 rounded-lg border border-verly-glass bg-verly-ink px-4 py-2 text-white shadow-lg"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    <span v-if="!error" class="min-w-0 flex-1 text-[15px] leading-normal">{{ message }}</span>
    <span v-if="!pending && !error" class="text-[15px] leading-normal">Salvando…</span>
    <span v-if="error" role="alert" class="min-w-0 flex-1 text-[15px] leading-normal">{{ error }}</span>
    <button
      v-if="pending && !error"
      type="button"
      class="min-h-11 shrink-0 rounded px-3 text-[17px] leading-normal font-semibold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      @click="$emit('undo')"
    >
      Desfazer
    </button>
    <button
      v-else-if="error"
      type="button"
      class="min-h-11 shrink-0 rounded px-3 text-[17px] leading-normal font-semibold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      @click="$emit('dismiss')"
    >
      Fechar aviso
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  message: string
  pending?: boolean
  error?: string
}>(), { pending: true })

defineEmits<{ undo: []; dismiss: [] }>()
</script>
