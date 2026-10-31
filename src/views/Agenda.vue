<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-5xl mx-auto px-4 py-4 md:py-6">
      <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h1 class="text-xl md:text-2xl font-semibold text-foreground">Agenda</h1>
          <p class="text-sm text-muted-foreground mt-1">
            Visita técnica é um dia; instalação tem dia e hora.
          </p>
        </div>
        <Button class="gap-2" @click="openCreate">
          <Plus class="w-4 h-4" />
          Novo agendamento
        </Button>
      </div>

      <div class="flex items-center justify-between gap-2 mb-4 rounded-lg border border-border bg-card px-2 py-2">
        <button class="px-2 py-1 rounded hover:bg-accent" aria-label="Semana anterior" @click="shiftWeek(-1)">
          ‹
        </button>
        <div class="text-sm font-medium text-foreground">
          {{ weekLabel }}
        </div>
        <div class="flex items-center gap-1">
          <button class="px-2 py-1 text-xs rounded hover:bg-accent" @click="goToday">Hoje</button>
          <button class="px-2 py-1 rounded hover:bg-accent" aria-label="Próxima semana" @click="shiftWeek(1)">
            ›
          </button>
        </div>
      </div>

      <p v-if="loadError" class="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ loadError }}
      </p>

      <div v-if="loading" class="py-10 text-center text-sm text-muted-foreground">Carregando agenda…</div>

      <template v-else>
        <!-- Visitas técnicas: compromisso por DIA. Nunca inventamos horário. -->
        <section class="mb-6" aria-labelledby="visitas-title">
          <div class="flex items-baseline justify-between mb-2">
            <h2 id="visitas-title" class="text-base font-semibold text-foreground">Visitas técnicas</h2>
            <span class="text-xs text-muted-foreground">{{ visits.length }} na semana</span>
          </div>
          <div class="rounded-lg border border-border bg-card divide-y divide-border">
            <div v-if="visits.length === 0" class="px-4 py-6 text-sm text-muted-foreground">
              Nenhuma visita marcada nesta semana.
            </div>
            <div v-for="lead in visits" :key="lead.id" class="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
              <span class="text-sm font-medium text-foreground">{{ fmtDay(lead.measurementDate) }}</span>
              <span class="text-sm text-foreground">{{ lead.name }}</span>
              <span class="text-xs text-muted-foreground">{{ lead.phone }}</span>
              <span class="text-xs text-muted-foreground">
                {{ visitTimeLabel(lead.measurementDate) }}
              </span>
              <RouterLink :to="`/leads/${lead.id}/orcamento`" class="text-xs text-primary hover:underline ml-auto">
                Abrir orçamento
              </RouterLink>
            </div>
          </div>
        </section>

        <!-- Instalações: compromisso com DIA e HORA. -->
        <section aria-labelledby="instalacoes-title">
          <div class="flex items-baseline justify-between mb-2">
            <h2 id="instalacoes-title" class="text-base font-semibold text-foreground">Instalações</h2>
            <span class="text-xs text-muted-foreground">{{ installations.length }} na semana</span>
          </div>
          <div class="rounded-lg border border-border bg-card divide-y divide-border">
            <div v-if="installations.length === 0" class="px-4 py-6 text-sm text-muted-foreground">
              Nenhuma instalação agendada nesta semana.
            </div>
            <div
              v-for="row in installations"
              :key="row.id"
              class="px-4 py-3"
              :class="row.status === 'CANCELLED' ? 'opacity-60' : ''"
            >
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span class="text-sm font-medium text-foreground">
                  {{ fmtDateTime(row.scheduledAt) }}
                </span>
                <span class="text-sm text-foreground">{{ leadName(row.leadId) }}</span>
                <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statusClass(row.status)">
                  {{ statusLabel(row.status) }}
                </span>
                <div v-if="row.status !== 'CANCELLED'" class="flex w-full flex-wrap items-center justify-end gap-2 sm:ml-auto sm:w-auto">
                  <template v-if="confirmingCancelId === row.id">
                    <span class="text-xs text-muted-foreground">Cancelar esta instalação?</span>
                    <Button variant="destructive" size="sm" @click="cancelInstallation(row)">Sim, cancelar</Button>
                    <Button variant="ghost" size="sm" @click="confirmingCancelId = null">Voltar</Button>
                  </template>
                  <template v-else>
                    <Button variant="outline" size="sm" @click="openReschedule(row)">Reagendar</Button>
                    <Button variant="ghost" size="sm" @click="confirmingCancelId = row.id">Cancelar</Button>
                  </template>
                </div>
              </div>
              <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <span :class="row.address ? 'text-muted-foreground' : 'text-warning font-medium'">
                  {{ row.address || 'Endereço não confirmado' }}
                </span>
                <span :class="row.responsible ? 'text-muted-foreground' : 'text-warning font-medium'">
                  {{ row.responsible || 'Sem responsável definido' }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>

    <!-- Novo agendamento -->
    <Dialog :open="createOpen" @update:open="createOpen = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo agendamento</DialogTitle>
        </DialogHeader>
        <form class="space-y-4" @submit.prevent="submitCreate">
          <div>
            <Label for="agenda-lead">Lead</Label>
            <Input
              id="agenda-lead"
              v-model="leadQuery"
              placeholder="Buscar por nome ou telefone"
              autocomplete="off"
            />
            <div v-if="!selectedLead && leadQuery" class="mt-1 max-h-40 overflow-y-auto rounded-md border border-border">
              <button
                v-for="candidate in leadMatches"
                :key="candidate.id"
                type="button"
                class="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
                @click="pickLead(candidate)"
              >
                {{ candidate.name }} · {{ candidate.phone }}
              </button>
              <p v-if="leadMatches.length === 0" class="px-3 py-2 text-sm text-muted-foreground">
                Nenhum lead encontrado.
              </p>
            </div>
            <p v-if="selectedLead" class="mt-1 text-xs text-muted-foreground">
              {{ selectedLead.name }} · {{ selectedLead.phone }}
            </p>
          </div>

          <div>
            <Label>Tipo</Label>
            <div class="mt-1 flex gap-2">
              <button
                type="button"
                class="rounded-md border px-3 py-1.5 text-sm"
                :class="form.kind === 'visit' ? 'border-primary text-primary' : 'border-border text-muted-foreground'"
                @click="setKind('visit')"
              >
                Visita técnica
              </button>
              <button
                type="button"
                class="rounded-md border px-3 py-1.5 text-sm"
                :class="form.kind === 'installation' ? 'border-primary text-primary' : 'border-border text-muted-foreground'"
                @click="setKind('installation')"
              >
                Instalação
              </button>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <Label for="agenda-date">Dia</Label>
              <Input id="agenda-date" v-model="form.date" type="date" required />
            </div>
            <div v-if="form.kind === 'installation'">
              <Label for="agenda-time">Hora</Label>
              <Input id="agenda-time" v-model="form.time" type="time" />
            </div>
          </div>

          <p v-if="form.kind === 'visit'" class="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            Visita técnica é combinada por dia. O horário não é registrado — não inventamos uma hora.
          </p>
          <p
            v-if="form.kind === 'visit' && suggestedVisitDay && form.date === suggestedVisitDay"
            class="text-xs text-info"
          >
            Dia sugerido pela conversa ({{ fmtDay(suggestedVisitDay) }}). É sugestão, não confirmação.
          </p>
          <template v-if="visitConflict">
            <p class="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
              {{ visitConflict }}
            </p>
            <div class="flex items-center gap-2">
              <input id="agenda-confirm-overwrite" v-model="confirmOverwrite" type="checkbox" />
              <Label for="agenda-confirm-overwrite">
                {{ selectedLead?.measurementStatus === 'DONE' ? 'Confirmo que quero reabrir a medição' : 'Confirmo que quero substituir' }}
              </Label>
            </div>
          </template>

          <template v-if="form.kind === 'installation'">
            <div>
              <Label for="agenda-address">Endereço</Label>
              <Input id="agenda-address" v-model="form.address" placeholder="Rua, número, bairro" />
              <p v-if="!form.address.trim()" class="mt-1 text-xs text-warning">
                Endereço não confirmado. O agendamento será salvo sem endereço.
              </p>
            </div>
            <div>
              <Label for="agenda-responsible">Responsável</Label>
              <Input id="agenda-responsible" v-model="form.responsible" />
              <p v-if="!form.responsible.trim()" class="mt-1 text-xs text-warning">
                Sem responsável definido.
              </p>
            </div>
          </template>

          <p v-if="formError" class="text-sm text-destructive">{{ formError }}</p>

          <div class="flex justify-end gap-2">
            <Button type="button" variant="outline" @click="createOpen = false">Cancelar</Button>
            <Button type="submit" :disabled="saving || !canSubmit">{{ saving ? 'Salvando…' : 'Agendar' }}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Reagendar instalação: não altera etapa comercial nem produção. -->
    <Dialog :open="rescheduleOpen" @update:open="rescheduleOpen = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reagendar instalação</DialogTitle>
        </DialogHeader>
        <form v-if="editing" class="space-y-4" @submit.prevent="submitReschedule">
          <p class="text-sm text-muted-foreground">
            {{ leadName(editing.leadId) }} · reagendar não muda a etapa do lead nem a produção.
          </p>
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <Label for="reschedule-date">Dia</Label>
              <Input id="reschedule-date" v-model="form.date" type="date" required />
            </div>
            <div>
              <Label for="reschedule-time">Hora</Label>
              <Input id="reschedule-time" v-model="form.time" type="time" />
            </div>
          </div>
          <div>
            <Label for="reschedule-address">Endereço</Label>
            <Input id="reschedule-address" v-model="form.address" placeholder="Rua, número, bairro" />
            <p v-if="!form.address.trim()" class="mt-1 text-xs text-warning">
              Endereço não confirmado.
            </p>
          </div>
          <div>
            <Label for="reschedule-responsible">Responsável</Label>
            <Input id="reschedule-responsible" v-model="form.responsible" />
            <p v-if="!form.responsible.trim()" class="mt-1 text-xs text-warning">
              Sem responsável definido.
            </p>
          </div>
          <p v-if="formError" class="text-sm text-destructive">{{ formError }}</p>
          <div class="flex justify-end gap-2">
            <Button type="button" variant="outline" @click="rescheduleOpen = false">Cancelar</Button>
            <Button type="submit" :disabled="saving || !canSubmit">{{ saving ? 'Salvando…' : 'Salvar' }}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Plus } from 'lucide-vue-next'
import Button from '../components/ui/Button.vue'
import Dialog from '../components/ui/Dialog.vue'
import DialogContent from '../components/ui/DialogContent.vue'
import DialogHeader from '../components/ui/DialogHeader.vue'
import DialogTitle from '../components/ui/DialogTitle.vue'
import Input from '../components/ui/Input.vue'
import Label from '../components/ui/Label.vue'
import leadService, { type LeadDTO } from '../services/lead'
import leadInstallationService, {
  type LeadInstallationDTO,
  type LeadInstallationStatus,
} from '../services/lead-installation'
import { friendlyError } from '../lib/errors'
import { parseLeadData } from '../composables/useLeadSignals'
import { useNotification } from '../composables/useNotification'

const notification = useNotification()

const loading = ref(true)
const loadError = ref<string | null>(null)
const leads = ref<LeadDTO[]>([])
const installations = ref<LeadInstallationDTO[]>([])
const weekStart = ref(startOfWeek(new Date()))

const pad = (value: number) => String(value).padStart(2, '0')
const isoDay = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

function startOfWeek(date: Date): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const offset = (copy.getDay() + 6) % 7 // segunda = 0
  copy.setDate(copy.getDate() - offset)
  return copy
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  copy.setDate(copy.getDate() + days)
  return copy
}

// Limites inclusivos em data-hora local, como o backend espera (LocalDateTime).
const rangeStart = computed(() => `${isoDay(weekStart.value)}T00:00:00`)
const rangeEnd = computed(() => `${isoDay(addDays(weekStart.value, 6))}T23:59:59`)

const weekLabel = computed(() => {
  const end = addDays(weekStart.value, 6)
  const fmt = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
  return `${fmt(weekStart.value)} – ${fmt(end)}`
})

const dayOf = (value?: string | null) => (value ? value.slice(0, 10) : '')

const visits = computed(() =>
  leads.value
    .filter((lead) => {
      if (lead.measurementStatus !== 'SCHEDULED') return false
      const day = dayOf(lead.measurementDate)
      return !!day && day >= isoDay(weekStart.value) && day <= isoDay(addDays(weekStart.value, 6))
    })
    .sort((a, b) => dayOf(a.measurementDate).localeCompare(dayOf(b.measurementDate))),
)

const leadById = computed(() => {
  const map = new Map<number, LeadDTO>()
  for (const lead of leads.value) map.set(lead.id, lead)
  return map
})

const leadName = (id: number) => leadById.value.get(id)?.name ?? `Lead #${id}`

function fmtDay(value?: string | null): string {
  const day = dayOf(value)
  if (!day) return '—'
  const [, month, date] = day.split('-')
  return `${date}/${month}`
}

function fmtDateTime(value: string): string {
  const [day, time] = value.split('T')
  const [, month, date] = day.split('-')
  return `${date}/${month} ${(time ?? '').slice(0, 5)}`
}

// Meia-noite = dia combinado sem hora confirmada. Nunca exibir 00:00 como se
// fosse um horário acordado com o cliente.
function visitTimeLabel(value?: string | null): string {
  const time = value?.split('T')[1]?.slice(0, 5)
  if (!time || time === '00:00') return 'horário não confirmado'
  return time
}

const statusLabel = (status: LeadInstallationStatus) =>
  ({ SCHEDULED: 'Agendada', DONE: 'Concluída', CANCELLED: 'Cancelada' })[status]

const statusClass = (status: LeadInstallationStatus) =>
  ({
    SCHEDULED: 'bg-info/15 text-info',
    DONE: 'bg-success/15 text-success',
    CANCELLED: 'bg-muted text-muted-foreground',
  })[status]

// Só a resposta da chamada mais recente pode tocar o estado: trocar de semana
// rápido não deixa a resposta de uma semana antiga sobrescrever a atual.
let loadSeq = 0

async function load() {
  const seq = ++loadSeq
  const start = rangeStart.value
  const end = rangeEnd.value
  loading.value = true
  loadError.value = null
  try {
    const [rows, allLeads] = await Promise.all([
      leadInstallationService.list({ start, end }),
      leadService.getAllNonPaginated(),
    ])
    if (seq !== loadSeq) return
    // O backend já filtra pelo intervalo; refiltrar aqui garante que uma resposta
    // sem filtro (ou cache antigo) não faça a semana mostrar outro mês.
    installations.value = rows
      .filter((row) => row.scheduledAt >= start && row.scheduledAt <= end)
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    leads.value = allLeads
  } catch (error) {
    if (seq !== loadSeq) return
    loadError.value = friendlyError(error, 'Não foi possível carregar a agenda')
  } finally {
    if (seq === loadSeq) loading.value = false
  }
}

function shiftWeek(direction: number) {
  weekStart.value = addDays(weekStart.value, direction * 7)
  void load()
}

function goToday() {
  weekStart.value = startOfWeek(new Date())
  void load()
}

// --- novo agendamento ---
const createOpen = ref(false)
const leadQuery = ref('')
const selectedLead = ref<LeadDTO | null>(null)
const saving = ref(false)
const formError = ref('')
const form = ref({
  kind: 'installation' as 'visit' | 'installation',
  date: '',
  time: '',
  address: '',
  responsible: currentUserName(),
})

function currentUserName(): string {
  try {
    const raw = localStorage.getItem('user')
    if (raw) {
      const user = JSON.parse(raw)
      return user.name || user.username || ''
    }
  } catch {
    /* ignore */
  }
  return ''
}

const leadMatches = computed(() => {
  const query = leadQuery.value.trim().toLowerCase()
  if (!query) return []
  return leads.value
    .filter(
      (lead) =>
        lead.name?.toLowerCase().includes(query) || String(lead.phone ?? '').includes(query),
    )
    .slice(0, 8)
})

// Sugestão do bot: só o DIA citado na conversa. Nunca há hora para inferir.
const suggestedVisitDay = ref<string | null>(null)

function pickLead(lead: LeadDTO) {
  selectedLead.value = lead
  confirmOverwrite.value = false
  leadQuery.value = lead.name
  const rawDay = parseLeadData(lead.data)?.signals?.visit?.date
  suggestedVisitDay.value =
    typeof rawDay === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDay) ? rawDay : null
  if (form.value.kind === 'visit' && !form.value.date && suggestedVisitDay.value) {
    form.value.date = suggestedVisitDay.value
  }
}

function setKind(kind: 'visit' | 'installation') {
  form.value.kind = kind
  // Trocar para visita aplica o dia sugerido (se houver) e mantém a hora fora da visita.
  if (kind === 'visit' && !form.value.date && suggestedVisitDay.value) {
    form.value.date = suggestedVisitDay.value
  }
  if (kind === 'visit') form.value.time = ''
}

// Agendar visita grava SCHEDULED no lead: sobrescreve a visita de outro dia ou
// reabre uma medição já concluída. Ambos exigem confirmação explícita.
const visitConflict = computed<string | null>(() => {
  const lead = selectedLead.value
  if (!createOpen.value || form.value.kind !== 'visit' || !lead) return null
  const day = dayOf(lead.measurementDate)
  if (lead.measurementStatus === 'DONE') {
    const when = day ? ` em ${fmtDay(day)}` : ''
    return `Medição já concluída${when}. Agendar uma nova visita volta o lead para "precisa medir".`
  }
  if (lead.measurementStatus === 'SCHEDULED' && day && day !== form.value.date) {
    return `Este lead já tem visita marcada em ${fmtDay(day)}. Agendar substitui essa visita.`
  }
  return null
})

const confirmOverwrite = ref(false)
watch(visitConflict, (next, prev) => {
  if (next !== prev) confirmOverwrite.value = false
})

const canSubmit = computed(() => {
  if (!form.value.date) return false
  if (!selectedLead.value && createOpen.value) return false
  if (visitConflict.value && !confirmOverwrite.value) return false
  if (createOpen.value && form.value.kind === 'installation' && !form.value.time) return false
  if (rescheduleOpen.value && !form.value.time) return false
  return true
})

function openCreate() {
  selectedLead.value = null
  leadQuery.value = ''
  formError.value = ''
  suggestedVisitDay.value = null
  confirmOverwrite.value = false
  form.value = { kind: 'installation', date: '', time: '', address: '', responsible: currentUserName() }
  createOpen.value = true
}

async function submitCreate() {
  if (!selectedLead.value) return
  if (visitConflict.value && !confirmOverwrite.value) return
  saving.value = true
  formError.value = ''
  try {
    if (form.value.kind === 'visit') {
      // Só o DIA é compromisso: grava 00:00 e a tela mostra "horário não confirmado".
      await leadService.updateMeasurement(selectedLead.value.id, 'SCHEDULED', `${form.value.date}T00:00:00`)
    } else {
      await leadInstallationService.create(selectedLead.value.id, {
        scheduledAt: `${form.value.date}T${form.value.time}:00`,
        address: form.value.address.trim() || null,
        responsible: form.value.responsible.trim() || null,
      })
    }
    createOpen.value = false
    notification.success('Agendado', form.value.kind === 'visit' ? 'Visita registrada no dia escolhido.' : 'Instalação agendada.')
    await load()
  } catch (error) {
    formError.value = friendlyError(error, 'Não foi possível salvar o agendamento')
  } finally {
    saving.value = false
  }
}

// --- reagendar ---
const rescheduleOpen = ref(false)
const editing = ref<LeadInstallationDTO | null>(null)
// Cancelar é reversível no backend, mas não deve acontecer num clique acidental.
const confirmingCancelId = ref<number | null>(null)

function openReschedule(row: LeadInstallationDTO) {
  editing.value = row
  formError.value = ''
  const [day, time] = row.scheduledAt.split('T')
  form.value = {
    kind: 'installation',
    date: day,
    time: (time ?? '').slice(0, 5),
    address: row.address ?? '',
    responsible: row.responsible ?? '',
  }
  rescheduleOpen.value = true
}

async function submitReschedule() {
  if (!editing.value) return
  saving.value = true
  formError.value = ''
  try {
    // PUT substitui os opcionais: reenviamos pedido/endereço/responsável atuais para não apagá-los.
    await leadInstallationService.update(editing.value.leadId, editing.value.id, {
      scheduledAt: `${form.value.date}T${form.value.time}:00`,
      orderId: editing.value.orderId,
      address: form.value.address.trim() || null,
      responsible: form.value.responsible.trim() || null,
    })
    rescheduleOpen.value = false
    notification.success('Reagendado', 'A etapa do lead e a produção não foram alteradas.')
    await load()
  } catch (error) {
    formError.value = friendlyError(error, 'Não foi possível reagendar')
  } finally {
    saving.value = false
  }
}

async function cancelInstallation(row: LeadInstallationDTO) {
  confirmingCancelId.value = null
  try {
    await leadInstallationService.cancel(row.leadId, row.id)
    notification.info('Instalação cancelada', 'O histórico foi preservado e pode ser reagendado.')
    await load()
  } catch (error) {
    notification.error('Não foi possível cancelar', friendlyError(error, 'Tente de novo'))
  }
}

onMounted(load)
</script>
