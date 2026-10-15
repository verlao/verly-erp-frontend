<script setup lang="ts">
import { computed } from 'vue'
import { WalletCards, Inbox, Columns3, ClipboardList, Handshake, UsersRound, Plus, PanelsTopLeft, FileText, ShieldCheck } from 'lucide-vue-next'
import type { NavigationIcon } from '../../router/navigation'
const props = withDefaults(defineProps<{ icon: NavigationIcon; size?: number }>(), { size: 20 })
// Um repertório, o mesmo traço e significado em todas as superfícies do menu.
const icons = { finance: WalletCards, inbox: Inbox, kanban: Columns3, orders: ClipboardList, partners: Handshake, people: UsersRound, plus: Plus, products: PanelsTopLeft, quotes: FileText, shield: ShieldCheck }
const component = computed(() => icons[props.icon])
</script>

<template>
  <component :is="component" :size="size" :stroke-width="1.8" aria-hidden="true" />
</template>
