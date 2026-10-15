<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="open" class="font-verly-body fixed inset-0 z-[60] flex flex-col bg-[#F3F5F4] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]" @click.self="close">
        <section ref="dialogRef" role="dialog" aria-modal="true" aria-labelledby="more-title" class="flex min-h-0 flex-1 flex-col" @keydown="trapFocus">
          <header class="flex min-h-[76px] shrink-0 items-center justify-between border-b border-[#DDE4E1] bg-[#F8FAF9] px-4">
            <div class="flex items-center gap-3">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true"><path d="M7 7h20v20H7z" stroke="#2E7D7A" stroke-width="1.8"/><path d="M10 24 24 10M10 10h4M24 24h-4" stroke="#2E7D7A" stroke-width="1.5" stroke-linecap="round"/><path d="M4 11V5h6M24 29h6v-6" stroke="#758681" stroke-width="1.2" stroke-linecap="round"/></svg>
              <div><div class="font-['Bricolage_Grotesque'] text-[20px] font-bold leading-none tracking-[-.04em] text-[#141A1F]">verly</div><div class="mt-1 text-[15px] text-[#687570]">Vidraçaria</div></div>
              <h1 id="more-title" class="sr-only">Mais destinos</h1>
            </div>
            <button ref="closeButtonRef" class="flex h-11 w-11 items-center justify-center rounded-xl border border-[#DDE4E1] bg-white text-[#46534E] transition hover:bg-[#E4F1EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D7A]" aria-label="Fechar menu" @click="close">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </header>
          <nav class="min-h-0 flex-1 overflow-y-auto px-4 py-4" aria-label="Outros destinos">
            <div class="mx-auto grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
              <router-link v-for="item in moreItems" :key="String(item.name)" :to="{ name: item.name }" custom v-slot="{ navigate, isActive }">
                <button :class="['flex min-h-14 items-center gap-3 rounded-2xl border px-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D7A]', isActive ? 'border-[#B9D8D3] bg-[#E4F1EF] font-semibold text-[#1C625F]' : 'border-[#E0E7E4] bg-white text-[#44514B] hover:border-[#C6D8D3] hover:bg-[#F9FBFA]']" :aria-current="isActive ? 'page' : undefined" @click="navAndClose(navigate)">
                  <span :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', isActive ? 'bg-white text-[#2E7D7A]' : 'bg-[#F1F5F3] text-[#687570]']"><NavigationIcon :icon="item.icon" :size="20" /></span>
                  <span class="text-[15px]">{{ item.label }}</span>
                </button>
              </router-link>
            </div>
          </nav>
          <footer class="shrink-0 border-t border-[#DDE4E1] bg-[#F8FAF9] px-4 py-3">
            <button class="mx-auto flex min-h-11 w-full max-w-lg items-center gap-3 rounded-xl px-3 text-[15px] text-[#4C5954] transition hover:bg-[#EDF3F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D7A]" @click="emit('logout'); close()">
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg>
              Sair
            </button>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { canAccessNavigationItem, navigationItemsFor } from '../../router/navigation'
import { routes } from '../../router/routes'
import { useAuthStore } from '../../stores/auth'
import NavigationIcon from './NavigationIcon.vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean]; logout: [] }>()
const authStore = useAuthStore()
const moreItems = computed(() => navigationItemsFor(routes, 'more').filter((item) => canAccessNavigationItem(item, authStore.isAdmin)))
const dialogRef = ref<HTMLElement>()
const closeButtonRef = ref<HTMLButtonElement>()
let previousFocus: HTMLElement | null = null
const close = async () => {
  emit('update:open', false)
  await nextTick()
  previousFocus?.focus()
}
const navAndClose = (navigate: () => void) => {
  emit('update:open', false)
  navigate()
}
const trapFocus = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (event.key !== 'Tab' || !dialogRef.value) return
  const focusable = Array.from(dialogRef.value.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'))
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
watch(() => props.open, async (isOpen) => {
  if (isOpen) {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    await nextTick()
    closeButtonRef.value?.focus()
  }
})
</script>
