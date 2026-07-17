<template>
  <Transition name="pwa-slide">
    <div
      v-if="needRefresh"
      class="fixed z-[70] left-1/2 -translate-x-1/2 bottom-4 md:left-auto md:right-4 md:translate-x-0 w-[calc(100%-2rem)] md:w-auto md:max-w-sm"
      style="bottom: calc(1rem + env(safe-area-inset-bottom))"
      role="status"
      aria-live="polite"
    >
      <div class="flex items-center gap-3 rounded-xl border border-border bg-card shadow-lg px-4 py-3">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-foreground">Nova versão disponível</p>
          <p class="text-xs text-muted-foreground">Atualize para pegar as últimas melhorias.</p>
        </div>
        <button
          type="button"
          class="shrink-0 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-lg transition-colors"
          @click="dismiss"
        >
          Depois
        </button>
        <button
          type="button"
          class="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          @click="reload"
        >
          Atualizar
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'

// needRefresh vira true quando o SW detecta um deploy novo aguardando.
const { needRefresh, updateServiceWorker } = useRegisterSW({ immediate: true })

// updateServiceWorker(true): ativa o SW novo (skipWaiting) e recarrega a página.
function reload() {
  updateServiceWorker(true)
}

function dismiss() {
  needRefresh.value = false
}
</script>

<style scoped>
.pwa-slide-enter-active,
.pwa-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.pwa-slide-enter-from,
.pwa-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 1rem);
}
@media (min-width: 768px) {
  .pwa-slide-enter-from,
  .pwa-slide-leave-to {
    transform: translate(0, 1rem);
  }
}
</style>
