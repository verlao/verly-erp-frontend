<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Phone, MapPin, Calendar, Target, Monitor, ExternalLink, User, MessageSquare, FileText, Copy, Check } from 'lucide-vue-next'
import Button from '../ui/Button.vue'
import Badge from '../ui/Badge.vue'
import Separator from '../ui/Separator.vue'
import Avatar from '../ui/Avatar.vue'
import type { LeadDTO } from '../../services/lead'
import { useLeadSignals, fmtTime } from '../../composables/useLeadSignals'

const props = defineProps<{
  lead?: LeadDTO
  isMobile?: boolean
}>()

const emit = defineEmits<{
  convert: []
  markContacted: []
  markQualified: []
  markLost: []
  openWhatsapp: []
  sendEmail: []
}>()

const router = useRouter()

function goToQuote() {
  if (props.lead?.id) router.push(`/leads/${props.lead.id}/orcamento`)
}

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

// V2_17: tier badge color
const tierBadgeClass = computed(() => {
  const t = props.lead?.tier
  if (t === '$$$') return 'bg-yellow-500 text-white'
  if (t === '$$') return 'bg-blue-500 text-white'
  if (t === '$') return 'bg-gray-400 text-white'
  return ''
})

function formatBrl(n?: number | null): string {
  if (n == null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

// Sinais + timeline (blob JSON em lead.data) — fonte única no composable.
const { transcript, signalChips, nextAction } = useLeadSignals(() => props.lead)

// Próxima pergunta sugerida (ladder deterministico vindo do backend) — a loja envia manualmente.
const copied = ref(false)
async function copySuggestedReply() {
  const text = props.lead?.suggestedReply
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch {
    /* clipboard bloqueado (sem HTTPS/permissão) → falha silenciosa */
  }
}
</script>

<template>
  <div class="flex flex-col h-full bg-white">
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
      <!-- Header compacto: nome + status -->
      <div class="p-4 md:p-6 border-b border-border shrink-0">
        <div class="flex items-start gap-2 md:gap-3">
          <Avatar :name="lead.name" class="h-10 w-10 md:h-12 md:w-12 shrink-0" />
          <div class="flex-1 min-w-0">
            <h2 class="text-lg md:text-2xl font-bold text-foreground truncate">{{ lead.name }}</h2>
            <div class="flex items-center gap-2 mt-1 md:mt-2">
              <Badge :variant="statusConfig.variant">
                {{ statusConfig.label }}
              </Badge>
              <span
                v-if="lead.tier"
                :class="['inline-flex items-center px-2 py-0.5 rounded font-bold text-xs', tierBadgeClass]"
              >
                {{ lead.tier }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Content: ordem de revisão-e-fechamento -->
      <div class="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <!-- 1. Resumo da IA -->
        <section>
          <div class="rounded-lg bg-muted/50 border border-border p-3 md:p-4">
            <p class="text-xs md:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {{ lead.description || 'Sem descrição' }}
            </p>
            <p class="mt-2 text-[11px] md:text-xs text-muted-foreground flex items-start gap-1">
              <span aria-hidden="true">ℹ️</span>
              <span>Extraído automaticamente — confira antes de enviar</span>
            </p>
          </div>
        </section>

        <!-- 2. Produtos / itens estruturados -->
        <section v-if="lead.items && lead.items.length > 0">
          <h3 class="text-xs md:text-sm font-semibold text-foreground mb-2 md:mb-3">
            Produtos ({{ lead.items.length }})
          </h3>
          <div class="space-y-1.5 text-xs md:text-sm">
            <div
              v-for="(item, idx) in lead.items"
              :key="item.id ?? idx"
              class="flex items-start justify-between gap-2 py-1 border-b border-border last:border-0"
            >
              <div class="flex-1 min-w-0">
                <span class="font-medium">{{ item.quantity || 1 }}x</span>
                <span class="ml-1">{{ item.productType || 'ITEM' }}</span>
                <span v-if="item.widthCm && item.heightCm" class="text-muted-foreground">
                  {{ item.widthCm }}cm × {{ item.heightCm }}cm
                </span>
                <span v-if="item.color && item.color !== 'INCOLOR'" class="ml-1 text-muted-foreground">
                  {{ item.color }}
                </span>
              </div>
              <span class="text-foreground font-mono shrink-0">{{ formatBrl(item.estimatedValue) }}</span>
            </div>
          </div>
        </section>

        <!-- 3. Total + lucro estimados -->
        <section
          v-if="lead.totalEstimatedValue != null || lead.totalEstimatedProfit != null"
          class="rounded-lg border border-border p-3 md:p-4 text-sm space-y-1"
        >
          <div class="flex justify-between font-semibold text-base">
            <span>Total estimado</span>
            <span class="font-mono">{{ formatBrl(lead.totalEstimatedValue) }}</span>
          </div>
          <div v-if="lead.totalEstimatedProfit != null" class="flex justify-between text-muted-foreground">
            <span>Lucro estimado</span>
            <span class="font-mono">{{ formatBrl(lead.totalEstimatedProfit) }}</span>
          </div>
        </section>

        <Separator />

        <!-- 4. Contato -->
        <section>
          <h3 class="text-xs md:text-sm font-semibold text-foreground mb-2 md:mb-3">Informações de Contato</h3>
          <div class="space-y-1.5 md:space-y-2">
            <div v-if="lead.email" class="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
              <Mail class="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground shrink-0" />
              <a
                :href="emailLink"
                class="text-foreground hover:text-primary transition-colors flex items-center gap-1 truncate"
                target="_blank"
              >
                <span class="truncate">{{ lead.email }}</span>
                <ExternalLink class="w-2.5 h-2.5 md:w-3 md:h-3 shrink-0" />
              </a>
            </div>
            <div v-if="lead.phone" class="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
              <Phone class="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground shrink-0" />
              <a
                :href="whatsappLink"
                class="text-foreground hover:text-primary transition-colors flex items-center gap-1"
                target="_blank"
              >
                {{ lead.phone }}
                <ExternalLink class="w-2.5 h-2.5 md:w-3 md:h-3 shrink-0" />
              </a>
            </div>
            <div v-if="lead.neighborhood || lead.city" class="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
              <MapPin class="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground shrink-0" />
              <span class="text-foreground">
                {{ lead.neighborhood }}{{ lead.city ? `, ${lead.city}` : '' }}
              </span>
            </div>
            <div v-if="formattedDate" class="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
              <Calendar class="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground shrink-0" />
              <span class="text-foreground">{{ formattedDate }}</span>
            </div>
          </div>
        </section>

        <!-- Rastreamento — colapsado / de-emphasized -->
        <details v-if="lead.utmSource || lead.deviceType || lead.referrer" class="group">
          <summary class="cursor-pointer text-xs text-muted-foreground hover:text-foreground select-none list-none flex items-center gap-1">
            <span class="transition-transform group-open:rotate-90">›</span>
            Informações de rastreamento
          </summary>
          <div class="mt-2 space-y-1.5 pl-3">
            <div v-if="lead.utmSource" class="flex items-start gap-2 md:gap-3 text-xs">
              <span class="text-muted-foreground shrink-0 w-20 md:w-24">Origem:</span>
              <span class="text-foreground">{{ lead.utmSource }}</span>
            </div>
            <div v-if="lead.utmMedium" class="flex items-start gap-2 md:gap-3 text-xs">
              <span class="text-muted-foreground shrink-0 w-20 md:w-24">Mídia:</span>
              <span class="text-foreground">{{ lead.utmMedium }}</span>
            </div>
            <div v-if="lead.utmCampaign" class="flex items-start gap-2 md:gap-3 text-xs">
              <span class="text-muted-foreground shrink-0 w-20 md:w-24">Campanha:</span>
              <span class="text-foreground">{{ lead.utmCampaign }}</span>
            </div>
            <div v-if="lead.deviceType" class="flex items-start gap-2 md:gap-3 text-xs">
              <Monitor class="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <span class="text-foreground">
                {{ lead.deviceType }}
                <span v-if="lead.screenWidth && lead.screenHeight" class="text-muted-foreground">
                  ({{ lead.screenWidth }}x{{ lead.screenHeight }})
                </span>
              </span>
            </div>
            <div v-if="lead.referrer" class="flex items-start gap-2 md:gap-3 text-xs">
              <span class="text-muted-foreground shrink-0 w-20 md:w-24">Referrer:</span>
              <span class="text-foreground break-all">{{ lead.referrer }}</span>
            </div>
          </div>
        </details>
      </div>

      <!-- Próxima pergunta sugerida (ladder deterministico do backend) + copiar -->
      <div v-if="lead.suggestedReply" class="px-4 md:px-6 pb-4">
        <div class="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
          <span aria-hidden="true">💬</span>
          <div class="flex-1 min-w-0">
            <span class="text-amber-700 font-medium">Próxima pergunta: </span>
            <span class="text-foreground">{{ lead.suggestedReply }}</span>
          </div>
          <button
            type="button"
            class="shrink-0 inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
            :aria-label="copied ? 'Copiado' : 'Copiar pergunta'"
            @click="copySuggestedReply"
          >
            <component :is="copied ? Check : Copy" class="w-3.5 h-3.5" aria-hidden="true" />
            {{ copied ? 'Copiado' : 'Copiar' }}
          </button>
        </div>
      </div>

      <!-- Sinais lidos da conversa + próxima ação + timeline (bot → lead.data) -->
      <div v-if="signalChips.length || transcript.length" class="px-4 md:px-6 pb-4 space-y-3">
        <div v-if="signalChips.length" class="flex flex-wrap gap-2">
          <span
            v-for="c in signalChips"
            :key="c.key"
            :class="c.cls"
            class="px-2 py-0.5 text-xs font-medium rounded-full"
          >{{ c.label }}</span>
        </div>
        <div v-if="nextAction" class="text-sm">
          <span class="text-muted-foreground">Próxima ação: </span>
          <span class="font-medium text-foreground">{{ nextAction }}</span>
        </div>
        <details v-if="transcript.length" class="text-sm">
          <summary class="cursor-pointer text-muted-foreground hover:text-foreground select-none">
            Ver conversa ({{ transcript.length }})
          </summary>
          <div class="mt-2 space-y-1.5 max-h-64 overflow-y-auto pr-1">
            <div
              v-for="(m, i) in transcript"
              :key="i"
              class="flex"
              :class="m.fromMe ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-[80%] rounded-lg px-3 py-1.5"
                :class="m.fromMe ? 'bg-primary/10' : 'bg-muted'"
              >
                <p class="whitespace-pre-wrap break-words">{{ m.body }}</p>
                <p class="text-[10px] text-muted-foreground mt-0.5">
                  {{ m.fromMe ? 'Loja' : 'Cliente' }} · {{ fmtTime(m.at) }}
                </p>
              </div>
            </div>
          </div>
        </details>
      </div>

      <!-- Sticky bottom CTA bar: WhatsApp em destaque, depois converter/status,
           e "marcar como perdido" como link discreto/destrutivo. -->
      <div
        class="border-t border-border bg-white p-3 md:p-4 space-y-2 shrink-0"
        :style="isMobile ? 'padding-bottom: calc(0.75rem + env(safe-area-inset-bottom))' : undefined"
      >
        <Button
          v-if="canConvert"
          variant="default"
          class="w-full"
          @click="goToQuote"
        >
          <FileText class="w-4 h-4 mr-2" />
          Gerar orçamento
        </Button>

        <Button
          v-if="lead.phone"
          variant="default"
          class="w-full bg-green-600 hover:bg-green-700 text-white"
          @click="emit('openWhatsapp')"
        >
          <Phone class="w-4 h-4 mr-2" />
          WhatsApp — Abrir conversa
        </Button>

        <div class="flex flex-wrap gap-2">
          <Button
            v-if="canConvert"
            variant="outline"
            size="sm"
            class="flex-1"
            @click="emit('convert')"
          >
            <User class="w-4 h-4 mr-2" />
            Converter em cliente
          </Button>
          <Button
            v-if="canMarkContacted"
            variant="outline"
            size="sm"
            class="flex-1"
            @click="emit('markContacted')"
          >
            <MessageSquare class="w-4 h-4 mr-2" />
            Contatado
          </Button>
          <Button
            v-if="canMarkQualified"
            variant="outline"
            size="sm"
            class="flex-1"
            @click="emit('markQualified')"
          >
            <Target class="w-4 h-4 mr-2" />
            Qualificado
          </Button>
          <Button
            v-if="lead.email"
            variant="outline"
            size="sm"
            class="flex-1"
            @click="emit('sendEmail')"
          >
            <Mail class="w-4 h-4 mr-2" />
            Email
          </Button>
        </div>

        <div v-if="canConvert" class="text-center">
          <button
            type="button"
            class="text-xs text-muted-foreground hover:text-destructive transition-colors underline underline-offset-2"
            @click="emit('markLost')"
          >
            Marcar como perdido
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
