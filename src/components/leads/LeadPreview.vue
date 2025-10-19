<script setup lang="ts">
import { computed } from 'vue'
import { Mail, Phone, MapPin, Calendar, Target, Monitor, ExternalLink, User, MessageSquare } from 'lucide-vue-next'
import Button from '../ui/Button.vue'
import Badge from '../ui/Badge.vue'
import Separator from '../ui/Separator.vue'
import Avatar from '../ui/Avatar.vue'
import type { LeadDTO } from '../../services/lead'

const props = defineProps<{
  lead?: LeadDTO
}>()

const emit = defineEmits<{
  convert: []
  markContacted: []
  markQualified: []
  markLost: []
  openWhatsapp: []
  sendEmail: []
}>()

const statusConfig = computed(() => {
  if (!props.lead?.status) return { label: 'Novo', variant: 'info' as const }

  const configs = {
    NEW: { label: 'Novo', variant: 'info' as const },
    CONTACTED: { label: 'Contatado', variant: 'warning' as const },
    QUALIFIED: { label: 'Qualificado', variant: 'success' as const },
    CONVERTED: { label: 'Convertido', variant: 'default' as const },
    LOST: { label: 'Perdido', variant: 'secondary' as const }
  }
  return configs[props.lead.status] || configs.NEW
})

const formattedDate = computed(() => {
  if (!props.lead?.createdDate) return ''

  try {
    const date = new Date(props.lead.createdDate)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return ''
  }
})

const whatsappLink = computed(() => {
  if (!props.lead?.phone) return ''
  const phone = props.lead.phone.replace(/\D/g, '')
  return `https://wa.me/55${phone}`
})

const emailLink = computed(() => {
  if (!props.lead?.email) return ''
  return `mailto:${props.lead.email}`
})

const canConvert = computed(() => {
  return props.lead?.status !== 'CONVERTED' && props.lead?.status !== 'LOST'
})

const canMarkContacted = computed(() => {
  return props.lead?.status === 'NEW'
})

const canMarkQualified = computed(() => {
  return props.lead?.status === 'CONTACTED'
})
</script>

<template>
  <div class="flex flex-col h-full bg-background">
    <!-- Empty state -->
    <div v-if="!lead" class="flex flex-col items-center justify-center h-full p-8 text-center">
      <div class="w-16 h-16 mb-4 text-muted-foreground">
        <Mail class="w-full h-full" />
      </div>
      <h3 class="text-lg font-semibold text-foreground">Selecione um lead</h3>
      <p class="mt-2 text-sm text-muted-foreground max-w-sm">
        Escolha um lead da lista para ver os detalhes e realizar ações
      </p>
    </div>

    <!-- Lead details -->
    <div v-else class="flex flex-col h-full">
      <!-- Header -->
      <div class="p-6 border-b border-border">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-start gap-3 flex-1">
            <Avatar :name="lead.name" class="h-12 w-12" />
            <div class="flex-1 min-w-0">
              <h2 class="text-2xl font-bold text-foreground truncate">{{ lead.name }}</h2>
              <Badge :variant="statusConfig.variant" class="mt-2">
                {{ statusConfig.label }}
              </Badge>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="flex flex-wrap gap-2">
          <Button
            v-if="canConvert"
            variant="default"
            size="sm"
            @click="emit('convert')"
          >
            <User class="w-4 h-4 mr-2" />
            Converter em Cliente
          </Button>
          <Button
            v-if="canMarkContacted"
            variant="outline"
            size="sm"
            @click="emit('markContacted')"
          >
            <MessageSquare class="w-4 h-4 mr-2" />
            Marcar como Contatado
          </Button>
          <Button
            v-if="canMarkQualified"
            variant="outline"
            size="sm"
            @click="emit('markQualified')"
          >
            <Target class="w-4 h-4 mr-2" />
            Marcar como Qualificado
          </Button>
          <Button
            v-if="lead.phone"
            variant="outline"
            size="sm"
            @click="emit('openWhatsapp')"
          >
            <Phone class="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
          <Button
            v-if="lead.email"
            variant="outline"
            size="sm"
            @click="emit('sendEmail')"
          >
            <Mail class="w-4 h-4 mr-2" />
            Enviar Email
          </Button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Contact info -->
        <section>
          <h3 class="text-sm font-semibold text-foreground mb-3">Informações de Contato</h3>
          <div class="space-y-2">
            <div v-if="lead.email" class="flex items-center gap-3 text-sm">
              <Mail class="w-4 h-4 text-muted-foreground shrink-0" />
              <a
                :href="emailLink"
                class="text-foreground hover:text-primary transition-colors flex items-center gap-1"
                target="_blank"
              >
                {{ lead.email }}
                <ExternalLink class="w-3 h-3" />
              </a>
            </div>
            <div v-if="lead.phone" class="flex items-center gap-3 text-sm">
              <Phone class="w-4 h-4 text-muted-foreground shrink-0" />
              <a
                :href="whatsappLink"
                class="text-foreground hover:text-primary transition-colors flex items-center gap-1"
                target="_blank"
              >
                {{ lead.phone }}
                <ExternalLink class="w-3 h-3" />
              </a>
            </div>
            <div v-if="lead.neighborhood || lead.city" class="flex items-center gap-3 text-sm">
              <MapPin class="w-4 h-4 text-muted-foreground shrink-0" />
              <span class="text-foreground">
                {{ lead.neighborhood }}{{ lead.city ? `, ${lead.city}` : '' }}
              </span>
            </div>
            <div v-if="formattedDate" class="flex items-center gap-3 text-sm">
              <Calendar class="w-4 h-4 text-muted-foreground shrink-0" />
              <span class="text-foreground">{{ formattedDate }}</span>
            </div>
          </div>
        </section>

        <Separator />

        <!-- Description -->
        <section>
          <h3 class="text-sm font-semibold text-foreground mb-3">Descrição</h3>
          <p class="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {{ lead.description || 'Sem descrição' }}
          </p>
        </section>

        <Separator />

        <!-- Tracking info -->
        <section v-if="lead.utmSource || lead.deviceType || lead.referrer">
          <h3 class="text-sm font-semibold text-foreground mb-3">Informações de Rastreamento</h3>
          <div class="space-y-2">
            <div v-if="lead.utmSource" class="flex items-start gap-3 text-sm">
              <span class="text-muted-foreground shrink-0 w-24">Origem:</span>
              <span class="text-foreground">{{ lead.utmSource }}</span>
            </div>
            <div v-if="lead.utmMedium" class="flex items-start gap-3 text-sm">
              <span class="text-muted-foreground shrink-0 w-24">Mídia:</span>
              <span class="text-foreground">{{ lead.utmMedium }}</span>
            </div>
            <div v-if="lead.utmCampaign" class="flex items-start gap-3 text-sm">
              <span class="text-muted-foreground shrink-0 w-24">Campanha:</span>
              <span class="text-foreground">{{ lead.utmCampaign }}</span>
            </div>
            <div v-if="lead.deviceType" class="flex items-start gap-3 text-sm">
              <Monitor class="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <span class="text-foreground">
                {{ lead.deviceType }}
                <span v-if="lead.screenWidth && lead.screenHeight" class="text-muted-foreground">
                  ({{ lead.screenWidth }}x{{ lead.screenHeight }})
                </span>
              </span>
            </div>
            <div v-if="lead.referrer" class="flex items-start gap-3 text-sm">
              <span class="text-muted-foreground shrink-0 w-24">Referrer:</span>
              <span class="text-foreground break-all">{{ lead.referrer }}</span>
            </div>
          </div>
        </section>

        <Separator v-if="canConvert" />

        <!-- Danger zone -->
        <section v-if="canConvert">
          <h3 class="text-sm font-semibold text-foreground mb-3">Zona de Perigo</h3>
          <Button
            variant="destructive"
            size="sm"
            @click="emit('markLost')"
          >
            Marcar como Perdido
          </Button>
        </section>
      </div>
    </div>
  </div>
</template>
