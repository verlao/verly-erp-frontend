# 📧 PROMPT: Refatoração Completa da Página de Leads

## 🎯 Objetivo

Refatorar `src/views/Leads.vue` para **seguir o padrão do projeto**, corrigindo problemas de:
- ❌ Logout não funciona (header duplicado esconde botão)
- ❌ Leads não aparecem (conflito de layouts)
- ❌ Estrutura incompatível com MainLayout
- ❌ UX quebrada no mobile

Manter **design inbox-style** mas de forma compatível com o ecossistema do projeto.

---

## 🔍 Análise do Problema

### Padrão Atual do Projeto

**MainLayout** (`src/layouts/MainLayout.vue`):
- Sidebar fixa (w-64 ou w-16 collapsed) com navegação
- Header superior com user dropdown + botão logout
- Área de conteúdo: `bg-gray-100 p-6 h-[calc(100vh-80px)]`
- Todas páginas renderizam DENTRO deste layout

**Páginas** (Dashboard, Customers, Orders, Products, CashFlow):
```vue
<template>
  <div>  <!-- Sem h-screen, sem header próprio -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold">Título</h1>
      <Button>Nova Ação</Button>
    </div>

    <div class="bg-white rounded-lg shadow">
      <!-- Conteúdo: tabela, cards, etc -->
    </div>
  </div>
</template>
```

### O Que Leads.vue Está Fazendo de Errado

```vue
<!-- ❌ ERRADO - Estrutura atual -->
<template>
  <div class="flex flex-col h-screen">  <!-- ❌ h-screen quebra MainLayout -->
    <!-- ❌ Header duplicado (MainLayout já tem!) -->
    <div class="px-4 md:px-6 py-3 md:py-4 border-b border-border bg-background">
      <h1 class="text-2xl">Leads</h1>
    </div>

    <!-- ❌ LeadFilters fora do fluxo normal -->
    <LeadFilters ... />

    <!-- ❌ Split view em h-screen -->
    <div class="flex-1 flex overflow-hidden">
      <div class="w-full md:w-2/5">...</div>
      <div class="flex-1">...</div>
    </div>
  </div>
</template>
```

**Problemas:**
1. `h-screen` ignora o MainLayout (`h-[calc(100vh-80px)]`)
2. Header duplicado esconde o header com logout
3. Split view fullscreen quebra scroll
4. Não usa bg-white/shadow padrão
5. Mobile completamente quebrado

---

## ✅ Solução: Estrutura Nova

### Desktop: Split View Dentro de Card

```vue
<template>
  <div>
    <!-- ✅ Header inline (padrão do projeto) -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Leads</h1>
        <p class="text-sm text-gray-600 mt-1">Gerencie leads e converta em clientes</p>
      </div>

      <!-- ✅ Ações rápidas inline -->
      <div class="flex items-center gap-2">
        <Button
          v-if="checkedIds.length > 0"
          variant="outline"
          size="sm"
        >
          Ações em Lote ({{ checkedIds.length }})
        </Button>
      </div>
    </div>

    <!-- ✅ Filtros compactos (inline) -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Tabs de Status -->
        <div class="flex-1">
          <TabsList class="w-full">
            <TabsTrigger
              v-for="tab in statusTabs"
              :key="tab.value"
              :value="tab.value"
              @click="statusFilter = tab.value"
            >
              {{ tab.label }}
              <Badge v-if="tab.count > 0" class="ml-2">{{ tab.count }}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        <!-- Busca -->
        <div class="lg:w-80">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              v-model="search"
              placeholder="Buscar por nome, email ou telefone..."
              class="pl-9"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ Conteúdo Principal: Split View em Card -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <!-- Desktop: Split View -->
      <div class="hidden md:flex h-[calc(100vh-360px)]">
        <!-- Lista Leads (40%) -->
        <div class="w-2/5 border-r border-gray-200 overflow-y-auto">
          <LeadList
            :leads="filteredLeads"
            :selected-id="selectedId"
            :checked-ids="checkedIds"
            :loading="loading"
            @select="handleSelectLead"
            @toggle="toggleCheck"
            @toggle-all="toggleAll"
            @quick-action="handleQuickAction"
          />
        </div>

        <!-- Preview (60%) -->
        <div class="flex-1 overflow-y-auto">
          <LeadPreview
            :lead="selectedLead"
            @convert="handleConvert"
            @mark-contacted="handleMarkContacted"
            @mark-qualified="handleMarkQualified"
            @mark-lost="handleMarkLost"
            @open-whatsapp="handleOpenWhatsapp"
            @send-email="handleSendEmail"
          />
        </div>
      </div>

      <!-- Mobile: Lista Only -->
      <div class="md:hidden">
        <LeadList
          :leads="filteredLeads"
          :selected-id="selectedId"
          :checked-ids="checkedIds"
          :loading="loading"
          @select="openMobilePreview"
          @toggle="toggleCheck"
          @toggle-all="toggleAll"
        />
      </div>
    </div>

    <!-- ✅ Paginação (fora do card, padrão) -->
    <div v-if="totalPages > 1" class="mt-4 flex justify-center">
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-items="totalItems"
        :page-size="pageSize"
        @page-changed="handlePageChange"
        @page-size-changed="handlePageSizeChange"
      />
    </div>

    <!-- ✅ Mobile: Preview em Dialog/Sheet -->
    <Dialog v-model:open="showMobilePreview">
      <DialogContent class="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Lead</DialogTitle>
        </DialogHeader>
        <LeadPreview
          :lead="selectedLead"
          :is-mobile="true"
          @convert="handleConvert"
          @mark-contacted="handleMarkContacted"
          @mark-qualified="handleMarkQualified"
          @mark-lost="handleMarkLost"
          @open-whatsapp="handleOpenWhatsapp"
          @send-email="handleSendEmail"
          @close="showMobilePreview = false"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>
```

---

## 🎨 UI/UX Melhorias

### 1. **LeadList Simplificado**

**Antes:** Accordion complexo com muita informação
**Depois:** Lista compacta estilo inbox

```vue
<!-- LeadListItem.vue - NOVO estilo -->
<div class="lead-item hover:bg-gray-50 cursor-pointer transition-colors">
  <div class="flex items-center gap-3 p-3 border-b border-gray-100">
    <!-- Checkbox seleção -->
    <input type="checkbox" />

    <!-- Avatar -->
    <Avatar :name="lead.name" size="sm" />

    <!-- Info principal -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <!-- Dot unread -->
        <span v-if="!lead.isRead" class="w-2 h-2 rounded-full bg-blue-500" />

        <!-- Nome -->
        <h4 class="font-semibold text-sm truncate">{{ lead.name }}</h4>

        <!-- Badge status -->
        <Badge :variant="statusVariant" size="sm">
          {{ statusLabel }}
        </Badge>

        <!-- Tempo -->
        <span class="text-xs text-gray-500 ml-auto">{{ timeAgo }}</span>
      </div>

      <!-- Email compacto -->
      <p class="text-xs text-gray-600 truncate">{{ lead.email }}</p>

      <!-- Descrição preview (1 linha) -->
      <p class="text-xs text-gray-500 truncate mt-1">{{ lead.description }}</p>
    </div>
  </div>
</div>
```

### 2. **LeadPreview Otimizado**

**Empty State:**
```vue
<div v-if="!lead" class="flex flex-col items-center justify-center h-full p-8 text-center">
  <Mail class="w-16 h-16 text-gray-300 mb-4" />
  <h3 class="text-lg font-semibold text-gray-900">Selecione um lead</h3>
  <p class="text-sm text-gray-600 mt-2">
    Escolha um lead da lista para ver detalhes e realizar ações
  </p>
</div>
```

**Com Lead:**
```vue
<div v-else class="p-6">
  <!-- Header -->
  <div class="flex items-start gap-4 mb-6">
    <Avatar :name="lead.name" size="lg" />
    <div class="flex-1">
      <h2 class="text-xl font-bold text-gray-900">{{ lead.name }}</h2>
      <Badge :variant="statusVariant" class="mt-2">{{ statusLabel }}</Badge>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="flex flex-wrap gap-2 mb-6">
    <Button size="sm" @click="$emit('convert')">
      <UserPlus class="w-4 h-4 mr-2" />
      Converter em Cliente
    </Button>
    <Button variant="outline" size="sm" @click="$emit('open-whatsapp')">
      <Phone class="w-4 h-4 mr-2" />
      WhatsApp
    </Button>
    <Button variant="outline" size="sm" @click="$emit('send-email')">
      <Mail class="w-4 h-4 mr-2" />
      Email
    </Button>
  </div>

  <!-- Informações -->
  <div class="space-y-4">
    <section>
      <h3 class="text-sm font-semibold text-gray-900 mb-2">Contato</h3>
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-sm">
          <Mail class="w-4 h-4 text-gray-400" />
          <a :href="`mailto:${lead.email}`" class="text-blue-600 hover:underline">
            {{ lead.email }}
          </a>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <Phone class="w-4 h-4 text-gray-400" />
          <span>{{ lead.phone }}</span>
        </div>
      </div>
    </section>

    <Separator />

    <section>
      <h3 class="text-sm font-semibold text-gray-900 mb-2">Descrição</h3>
      <p class="text-sm text-gray-700 leading-relaxed">
        {{ lead.description }}
      </p>
    </section>

    <!-- Tracking info (collapsible) -->
    <details class="group">
      <summary class="cursor-pointer text-sm font-semibold text-gray-900 mb-2">
        Informações de Rastreamento
        <ChevronDown class="inline w-4 h-4 group-open:rotate-180 transition-transform" />
      </summary>
      <div class="mt-2 space-y-2 text-sm text-gray-600">
        <div v-if="lead.utmSource">Origem: {{ lead.utmSource }}</div>
        <div v-if="lead.deviceType">Dispositivo: {{ lead.deviceType }}</div>
      </div>
    </details>
  </div>
</div>
```

### 3. **Filtros Inteligentes**

```typescript
const statusTabs = computed(() => [
  { value: 'all', label: 'Todos', count: counts.value.all },
  { value: 'NEW', label: 'Novos', count: counts.value.new },
  { value: 'CONTACTED', label: 'Contatados', count: counts.value.contacted },
  { value: 'QUALIFIED', label: 'Qualificados', count: counts.value.qualified },
  { value: 'CONVERTED', label: 'Convertidos', count: counts.value.converted }
])
```

### 4. **Atalhos de Teclado (Desktop)**

Manter mas ajustar para novo layout:
```typescript
useLeadKeyboard({
  onNext: () => selectNext(),
  onPrevious: () => selectPrevious(),
  onOpen: () => {
    if (isMobile.value) {
      showMobilePreview.value = true
    }
  },
  onClose: () => {
    if (isMobile.value) {
      showMobilePreview.value = false
    }
  },
  // ... outras ações
})
```

---

## 📱 Mobile UX

### Abordagem: Modal/Sheet ao invés de Fullscreen

**Antes:** Preview fullscreen com botão voltar
**Depois:** Dialog/Sheet elegante

```vue
<!-- Mobile: Click abre Dialog -->
<Dialog v-model:open="showMobilePreview">
  <DialogContent class="max-w-lg">
    <DialogHeader>
      <DialogTitle>{{ selectedLead?.name }}</DialogTitle>
      <DialogClose />
    </DialogHeader>

    <div class="overflow-y-auto max-h-[70vh]">
      <LeadPreview :lead="selectedLead" :is-mobile="true" />
    </div>

    <DialogFooter>
      <Button variant="outline" @click="showMobilePreview = false">
        Fechar
      </Button>
      <Button @click="handleConvert">
        Converter em Cliente
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Alternativa:** Bottom Sheet (mais mobile-friendly)
```vue
<Sheet v-model:open="showMobilePreview">
  <SheetContent side="bottom" class="h-[85vh]">
    <SheetHeader>
      <SheetTitle>{{ selectedLead?.name }}</SheetTitle>
    </SheetHeader>

    <div class="overflow-y-auto h-full pb-20">
      <LeadPreview :lead="selectedLead" :is-mobile="true" />
    </div>
  </SheetContent>
</Sheet>
```

---

## 🔧 Componentes Necessários

### Criar Novos (se não existem):

1. **Dialog.vue** (ou usar Modal existente)
```vue
<!-- src/components/ui/Dialog.vue -->
<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div
          class="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden"
          @click.stop
        >
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
}>()
</script>
```

2. **Select.vue** (dropdown para filtros)
```vue
<!-- src/components/ui/Select.vue -->
<template>
  <select
    :value="modelValue"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    :class="cn(
      'h-10 rounded-md border border-input bg-background px-3 py-2 text-sm',
      'focus:outline-none focus:ring-2 focus:ring-ring',
      props.class
    )"
  >
    <slot />
  </select>
</template>
```

### Ajustar Existentes:

**LeadList.vue:**
- Remover header "Selecionar todos" (fica na barra de filtros)
- Simplificar items (menos informação, mais compacto)
- Adicionar estado hover

**LeadPreview.vue:**
- Simplificar header (menor)
- Remover padding excessivo
- Adicionar empty state bonito
- Props `is-mobile` para ajustes

**LeadListItem.vue:**
- Versão ultra-compacta
- Hover state suave
- Quick actions só no desktop (sem overlay)

---

## 🎯 Checklist de Implementação

### Fase 1: Estrutura Base
- [ ] Remover `h-screen` do template raiz
- [ ] Remover header duplicado (linhas 4-7)
- [ ] Criar estrutura de card bg-white padrão
- [ ] Mover filtros para barra inline
- [ ] Ajustar split view para altura fixa dentro do card

### Fase 2: Componentes
- [ ] Criar Dialog.vue ou ajustar Modal existente
- [ ] Criar Select.vue para filtros dropdown
- [ ] Ajustar LeadList: remover header, simplificar
- [ ] Ajustar LeadPreview: adicionar empty state, prop is-mobile
- [ ] Ajustar LeadListItem: ultra-compacto

### Fase 3: Mobile
- [ ] Implementar Dialog/Sheet para preview mobile
- [ ] Trocar fullscreen por modal
- [ ] Ajustar filtros para mobile (stack vertical)
- [ ] Testar scroll e navegação

### Fase 4: UX
- [ ] Implementar ações em lote (header)
- [ ] Melhorar empty states
- [ ] Loading states (Skeleton)
- [ ] Animações suaves (transition)

### Fase 5: Polish
- [ ] Testar logout (deve funcionar agora!)
- [ ] Testar em todas resoluções
- [ ] Verificar que leads aparecem
- [ ] Ajustar cores/espaçamentos para combinar com projeto
- [ ] Documentar atalhos de teclado

---

## 🎨 Tokens de Design (Manter Consistência)

```css
/* Usar os mesmos do projeto */
--background: hsl(var(--background))
--foreground: hsl(var(--foreground))
--card: hsl(var(--card))
--border: hsl(var(--border))
--primary: hsl(var(--primary))
--muted: hsl(var(--muted))

/* Espaçamentos padrão */
gap-2, gap-3, gap-4  /* Não usar gap-1.5 customizado */
p-4, p-6             /* Não usar p-3 customizado */
text-sm, text-base   /* Não usar text-xs excessivo */
rounded-lg           /* Padrão do projeto */
shadow-sm            /* Sombras suaves */
```

---

## 📊 Resultado Esperado

### Desktop
```
┌─────────────────────────────────────────────────┐
│ MainLayout Header (com logout e user)          │
├─────────────────────────────────────────────────┤
│ [Sidebar]  │  Leads                             │
│            │  Gerencie leads e converta clientes│
│            │                                     │
│            │  [Tabs: Todos|Novos|Contatados...] │
│            │  [🔍 Buscar...]                    │
│            │                                     │
│            │  ┌───────────────────────────────┐ │
│            │  │ Lista │     Preview           │ │
│            │  │  Lead │  Nome: João Silva     │ │
│            │  │  Lead │  Email: joao@...      │ │
│            │  │ [600px height]                │ │
│            │  └───────────────────────────────┘ │
│            │                                     │
│            │  [Paginação: < 1 2 3 >]           │
└────────────┴─────────────────────────────────────┘
```

### Mobile
```
┌─────────────────────┐
│ MainLayout Header   │
│ [≡ User + Logout]   │
├─────────────────────┤
│ Leads               │
│                     │
│ [Tabs scrollable]   │
│ [🔍 Buscar]        │
│                     │
│ ┌─────────────────┐ │
│ │ □ João Silva    │ │
│ │ □ Maria Santos  │ │ ← Click abre Dialog
│ │ □ Pedro Costa   │ │
│ └─────────────────┘ │
│                     │
│ [Paginação]         │
└─────────────────────┘

Quando clicar:
┌─────────────────────┐
│ ╔═══════════════╗   │
│ ║ João Silva  [X]║   │
│ ║───────────────║   │
│ ║ Email: ...    ║   │
│ ║ Tel: ...      ║   │
│ ║               ║   │
│ ║ [WhatsApp]    ║   │
│ ║ [Email]       ║   │
│ ║ [Converter]   ║   │
│ ╚═══════════════╝   │
└─────────────────────┘
```

---

## ✅ Benefícios da Refatoração

### Técnicos
✅ Logout funcionará (sem header duplicado)
✅ Leads aparecerão (layout correto)
✅ Scroll funcionará (sem conflito de heights)
✅ Código 50% menor (sem estrutura duplicada)
✅ Manutenível (segue padrão estabelecido)

### UX
✅ Consistente com resto do app
✅ Mobile melhor (Dialog vs Fullscreen)
✅ Mais rápido (menos DOM)
✅ Acessível (navegação padrão funciona)
✅ Profissional (design coeso)

---

## 🚀 Começar Implementação

**Ordem recomendada:**
1. Backup de `Leads.vue` (criar `Leads.vue.old`)
2. Implementar estrutura base (template raiz)
3. Criar componentes faltantes (Dialog, Select)
4. Ajustar componentes existentes (LeadList, LeadPreview)
5. Testar desktop primeiro
6. Implementar mobile (Dialog)
7. Polish e testes finais

**Tempo estimado:** 2-3 horas
**Complexidade:** Média (refatoração estrutural)
**Impacto:** Alto (corrige bugs críticos + UX melhor)

---

## 📝 Notas Importantes

1. **Manter funcionalidades:**
   - Sistema de notificações (useNotificationStore)
   - Atalhos de teclado (useLeadKeyboard)
   - Seleção múltipla (useLeadSelection)
   - Paginação

2. **Não quebrar:**
   - API calls (leadService)
   - Composables existentes
   - Rotas (mantém `/leads`)

3. **Melhorar:**
   - Estrutura HTML (seguir padrão)
   - Mobile UX (Dialog melhor que Fullscreen)
   - Performance (menos DOM, menos re-renders)
   - Acessibilidade (navegação padrão)

---

**Prompt pronto para implementação! 🎯**
