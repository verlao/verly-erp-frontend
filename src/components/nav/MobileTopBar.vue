<template>
  <header class="font-verly-body fixed left-0 right-0 top-0 z-40 flex h-[calc(72px+env(safe-area-inset-top))] items-center justify-between border-b border-[#DDE4E1] bg-[#F8FAF9]/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur">
    <div class="flex min-w-0 items-center gap-3">
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true" class="shrink-0">
        <path d="M7 7h20v20H7z" stroke="#2E7D7A" stroke-width="1.8" />
        <path d="M10 24 24 10M10 10h4M24 24h-4" stroke="#2E7D7A" stroke-width="1.5" stroke-linecap="round" />
        <path d="M4 11V5h6M24 29h6v-6" stroke="#758681" stroke-width="1.2" stroke-linecap="round" />
      </svg>
      <div class="min-w-0">
        <div class="font-['Bricolage_Grotesque'] text-[18px] font-bold leading-none tracking-[-.04em] text-[#141A1F]">verly</div>
        <div class="mt-1 text-[15px] leading-none text-[#687570]">Vidraçaria</div>
      </div>
      <span class="mx-1 h-7 w-px shrink-0 bg-[#DDE4E1]" aria-hidden="true" />
      <h2 class="truncate text-[17px] font-semibold text-[#26312D]">{{ title }}</h2>
    </div>
    <details ref="accountMenu" class="relative ml-2 shrink-0">
      <summary class="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-xl border border-[#DDE4E1] bg-white text-[#1D5F5C] transition hover:bg-[#E4F1EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D7A] [&::-webkit-details-marker]:hidden" aria-label="Menu da conta">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>
      </summary>
      <div class="absolute right-0 top-[calc(100%+8px)] z-50 w-56 rounded-2xl border border-[#DDE4E1] bg-white p-2 shadow-[0_12px_32px_rgba(20,26,31,.16)]">
        <div class="border-b border-[#E7ECEA] px-3 py-2 text-[15px] font-medium text-[#26312D]">{{ user?.username }}</div>
        <button class="mt-1 min-h-11 w-full rounded-xl px-3 text-left text-[15px] text-[#485650] transition hover:bg-[#EDF3F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D7A]" @click="emit('logout')">Sair</button>
      </div>
    </details>
  </header>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
defineProps<{ title: string }>()
const emit = defineEmits<{ logout: [] }>()
const authStore = useAuthStore()
const user = computed(() => authStore.getUser)
const accountMenu = ref<HTMLDetailsElement>()
const closeOnOutside = (event: PointerEvent) => {
  if (event.target instanceof Node && !accountMenu.value?.contains(event.target)) accountMenu.value?.removeAttribute('open')
}
const closeOnEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && accountMenu.value?.open) {
    accountMenu.value.open = false
    accountMenu.value.querySelector('summary')?.focus()
  }
}
document.addEventListener('pointerdown', closeOnOutside)
document.addEventListener('keydown', closeOnEscape)
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', closeOnOutside)
  document.removeEventListener('keydown', closeOnEscape)
})
</script>
