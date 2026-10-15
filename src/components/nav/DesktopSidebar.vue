<template>
  <aside :class="['font-verly-body fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#DDE4E1] bg-[#F8FAF9] transition-[width] duration-300', collapsed ? 'w-16' : 'w-64']">
    <div :class="['flex h-[76px] shrink-0 items-center border-b border-[#DDE4E1]', collapsed ? 'justify-center px-2' : 'justify-between px-4']">
      <div v-if="!collapsed" class="flex min-w-0 items-center gap-3">
        <GlassMark />
        <div class="min-w-0 leading-tight">
          <div class="font-['Bricolage_Grotesque'] text-[21px] font-bold tracking-[-.04em] text-[#141A1F]">verly</div>
          <div class="mt-1 text-[15px] text-[#687570]">Vidraçaria</div>
        </div>
      </div>
      <button v-else class="flex h-11 w-11 items-center justify-center rounded-xl transition hover:bg-[#E4F1EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D7A]" title="Expandir menu" aria-label="Expandir menu" @click="emit('update:collapsed', false)">
        <GlassMark />
      </button>
      <button v-if="!collapsed" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#5B6762] transition hover:bg-[#E4F1EF] hover:text-[#141A1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D7A]" title="Recolher menu" aria-label="Recolher menu" @click="emit('update:collapsed', true)">
        <ChevronIcon />
      </button>
    </div>

    <div class="relative mt-3 min-h-0 flex-1 px-2 pb-2">
      <nav ref="containerRef" :style="maskStyle" :class="['h-full overflow-y-auto space-y-1', collapsed ? 'px-0' : 'px-1']" aria-label="Menu principal">
        <router-link v-for="item in sidebarItems" :key="String(item.name)" :to="{ name: item.name }" custom v-slot="{ navigate, isActive }">
          <button data-navigation-item :class="['group relative flex min-h-11 w-full items-center rounded-xl text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D7A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAF9]', collapsed ? 'justify-center px-2' : 'gap-3 px-3', current(item.name, isActive) ? 'bg-[#E4F1EF] font-semibold text-[#1C625F]' : 'text-[#485650] hover:bg-[#EDF3F1] hover:text-[#141A1F]']" :title="collapsed ? (item.accessibleLabel ?? item.label) : undefined" :aria-label="collapsed ? (item.accessibleLabel ?? item.label) : undefined" :aria-current="current(item.name, isActive) ? 'page' : undefined" @click="navigate">
            <span v-if="current(item.name, isActive)" class="absolute bottom-2 left-0 top-2 w-[3px] rounded-r bg-[#2E7D7A]" />
            <NavigationIcon :icon="item.icon" :size="20" />
            <span v-if="!collapsed" class="truncate text-[15px]">{{ item.label }}</span>
          </button>
        </router-link>
      </nav>
      <button v-if="canScrollUp" type="button" class="absolute right-3 top-1 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#D8E1DE] bg-white text-[#263B38] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D7A]" title="Ver destinos anteriores" aria-label="Ver destinos anteriores" @click="scrollNavigation('up')"><ScrollArrow direction="up" /></button>
      <button v-if="canScrollDown" type="button" class="absolute bottom-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#D8E1DE] bg-white text-[#263B38] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D7A]" title="Ver mais destinos" aria-label="Ver mais destinos" @click="scrollNavigation('down')"><ScrollArrow direction="down" /></button>
    </div>

    <div :class="['shrink-0 border-t border-[#DDE4E1] py-3', collapsed ? 'px-2' : 'px-3']">
      <button :class="['flex min-h-11 w-full items-center rounded-xl text-[#4C5954] transition hover:bg-[#EDF3F1] hover:text-[#141A1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D7A]', collapsed ? 'justify-center' : 'gap-3 px-3']" title="Sair" :aria-label="collapsed ? 'Sair' : undefined" @click="emit('logout')">
        <LogoutIcon />
        <span v-if="!collapsed" class="text-[15px]">Sair</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import { useVerticalOverflow } from '../../composables/useVerticalOverflow'
import { canAccessNavigationItem, navigationItemsFor } from '../../router/navigation'
import { routes } from '../../router/routes'
import { useAuthStore } from '../../stores/auth'
import NavigationIcon from './NavigationIcon.vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const current = (name: unknown, active: boolean) => active || (route.name === 'LeadQuote' && name === 'Leads')

defineProps<{ collapsed: boolean }>()
const emit = defineEmits<{ 'update:collapsed': [value: boolean]; logout: [] }>()
const authStore = useAuthStore()
const sidebarItems = computed(() => navigationItemsFor(routes, 'sidebar').filter((item) => canAccessNavigationItem(item, authStore.isAdmin)))
const { containerRef, canScrollUp, canScrollDown, maskStyle, scroll: scrollNavigation } = useVerticalOverflow()
const GlassMark = defineComponent({
  setup: () => () => h('svg', { width: 34, height: 34, viewBox: '0 0 34 34', fill: 'none', 'aria-hidden': 'true' }, [
    h('path', { d: 'M7 7h20v20H7z', rx: 2, stroke: '#2E7D7A', 'stroke-width': 1.8 }),
    h('path', { d: 'M10 24 24 10M10 10h4M24 24h-4', stroke: '#2E7D7A', 'stroke-width': 1.5, 'stroke-linecap': 'round' }),
    h('path', { d: 'M4 11V5h6M24 29h6v-6', stroke: '#758681', 'stroke-width': 1.2, 'stroke-linecap': 'round' }),
  ]),
})
const ChevronIcon = defineComponent({ setup: () => () => h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'aria-hidden': 'true' }, [h('path', { d: 'm15 18-6-6 6-6' })]) })
const LogoutIcon = defineComponent({ setup: () => () => h('svg', { width: 19, height: 19, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' }, [h('path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }), h('path', { d: 'm16 17 5-5-5-5M21 12H9' })]) })
const ScrollArrow = defineComponent({ props: { direction: { type: String, required: true } }, setup: (props) => () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' }, [h('path', { d: props.direction === 'up' ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6' })]) })
</script>
