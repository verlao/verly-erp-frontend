<script setup lang="ts">
import { computed } from 'vue'
import { MapPin, Clock, Phone, Mail, CheckCircle } from 'lucide-vue-next'
import Badge from '../ui/Badge.vue'
import Avatar from '../ui/Avatar.vue'
import type { LeadDTO } from '../../services/lead'

const props = defineProps<{
  lead: LeadDTO
  selected?: boolean
  checked?: boolean
}>()

const emit = defineEmits<{
  select: []
  toggle: []
  quickAction: [action: string]
}>()

const statusConfig = computed(() => {
  const status = props.lead.status || 'NEW'
  const configs = {
    NEW: { label: 'Novo', variant: 'info' as const, dot: true },
    CONTACTED: { label: 'Contatado', variant: 'warning' as const, dot: false },
    QUALIFIED: { label: 'Qualificado', variant: 'success' as const, dot: false },
    CONVERTED: { label: 'Convertido', variant: 'default' as const, dot: false },
    LOST: { label: 'Perdido', variant: 'secondary' as const, dot: false }
  }
  return configs[status] || configs.NEW
})

const isUnread = computed(() => !props.lead.isRead)

const timeAgo = computed(() => {
  if (!props.lead.createdDate) return ''

  try {
    const date = new Date(props.lead.createdDate)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays}d atrás`
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  } catch {
    return ''
  }
})

const priority = computed(() => props.lead.priority || 'MEDIUM')

const priorityClass = computed(() => {
  if (priority.value === 'HIGH') return 'border-l-4 border-l-red-500'
  return ''
})
</script>

<template>
  <div
    :class="[
      'lead-item group relative cursor-pointer transition-all duration-200',
      'border-b border-border hover:bg-accent/50',
      selected ? 'bg-accent' : '',
      isUnread ? 'bg-blue-50/30' : '',
      priorityClass
    ]"
    @click="emit('select')"
  >
    <div class="flex items-start gap-2 md:gap-3 p-2 md:p-3">
      <!-- Checkbox -->
      <div class="flex items-center pt-0.5 md:pt-1">
        <input
          type="checkbox"
          :checked="checked"
          class="h-3.5 w-3.5 md:h-4 md:w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
          @click.stop
          @change="emit('toggle')"
        />
      </div>

      <!-- Avatar - Hidden on very small screens -->
      <Avatar :name="lead.name" class="mt-0.5 md:mt-1 hidden xs:block h-8 w-8 md:h-10 md:w-10" />

      <!-- Main content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-1.5 mb-0.5 md:mb-1">
          <div class="flex items-center gap-1.5 md:gap-2 flex-1 min-w-0">
            <!-- Unread dot -->
            <span
              v-if="isUnread"
              class="flex h-1.5 w-1.5 md:h-2 md:w-2 shrink-0 rounded-full bg-blue-500"
            />

            <h4 :class="['truncate text-xs md:text-sm', isUnread ? 'font-bold' : 'font-semibold']">
              {{ lead.name }}
            </h4>
          </div>

          <div class="flex items-center gap-1 md:gap-2 shrink-0">
            <Badge :variant="statusConfig.variant" class="text-[10px] md:text-xs px-1.5 md:px-2.5 py-0.5">
              {{ statusConfig.label }}
            </Badge>
            <span class="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">
              {{ timeAgo }}
            </span>
          </div>
        </div>

        <!-- Contact info - More compact on mobile -->
        <div class="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">
          <span v-if="lead.email" class="flex items-center gap-0.5 md:gap-1 truncate">
            <Mail class="w-2.5 h-2.5 md:w-3 md:h-3 shrink-0" />
            <span class="truncate hidden sm:inline">{{ lead.email }}</span>
          </span>
          <span v-if="lead.phone" class="flex items-center gap-0.5 md:gap-1">
            <Phone class="w-2.5 h-2.5 md:w-3 md:h-3 shrink-0" />
            <span class="hidden xs:inline">{{ lead.phone }}</span>
          </span>
        </div>

        <!-- Description preview - Hidden on very small screens -->
        <p class="hidden sm:block text-xs text-muted-foreground line-clamp-2 mb-1 md:mb-2">
          {{ lead.description }}
        </p>

        <!-- Location and meta - More compact on mobile -->
        <div class="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-muted-foreground">
          <span v-if="lead.neighborhood" class="flex items-center gap-0.5 md:gap-1 truncate">
            <MapPin class="w-2.5 h-2.5 md:w-3 md:h-3 shrink-0" />
            <span class="truncate">{{ lead.neighborhood }}</span>
          </span>
          <span v-if="lead.utmSource" class="hidden md:flex items-center gap-1">
            <span class="text-muted-foreground/60">•</span>
            {{ lead.utmSource }}
          </span>
        </div>
      </div>

      <!-- Quick actions (visible on hover) - Hidden on mobile -->
      <div
        class="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border p-1 rounded-md shadow-lg"
      >
        <button
          v-if="isUnread"
          class="p-1.5 hover:bg-accent rounded-md transition-colors"
          title="Marcar como lido"
          @click.stop="emit('quickAction', 'mark-read')"
        >
          <CheckCircle class="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          class="p-1.5 hover:bg-accent rounded-md transition-colors"
          title="Ligar"
          @click.stop="emit('quickAction', 'call')"
        >
          <Phone class="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          class="p-1.5 hover:bg-accent rounded-md transition-colors"
          title="Enviar email"
          @click.stop="emit('quickAction', 'email')"
        >
          <Mail class="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
