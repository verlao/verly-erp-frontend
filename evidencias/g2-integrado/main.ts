// Entrada descartável e local. Reutiliza o layout/menu reais do ERP sem montar
// autenticação nem carregar views que acessam a API. Não é parte de src/main.ts.
import { createApp, defineComponent, h, type Component } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory, RouterView } from 'vue-router'
import MainLayout from '../../src/layouts/MainLayout.vue'
import FinanceiroPreview from '../../src/views/prototypes/integrated-g2/FinanceiroPreview.vue'
import LeadsPreview from '../../src/views/prototypes/integrated-g2/LeadsPreview.vue'
import FunilPreview from '../../src/views/prototypes/integrated-g2/FunilPreview.vue'
import LeadQuotePreview from '../../src/views/prototypes/integrated-g2/LeadQuotePreview.vue'
import ClientesPreview from '../../src/views/prototypes/integrated-g2/ClientesPreview.vue'
import ParceirosPreview from '../../src/views/prototypes/integrated-g2/ParceirosPreview.vue'
import ProdutosPreview from '../../src/views/prototypes/integrated-g2/ProdutosPreview.vue'
import OrcamentosPreview from '../../src/views/prototypes/integrated-g2/OrcamentosPreview.vue'
import NovoOrcamentoPreview from '../../src/views/prototypes/integrated-g2/NovoOrcamentoPreview.vue'
import PedidosPreview from '../../src/views/prototypes/integrated-g2/PedidosPreview.vue'
import UsuariosPreview from '../../src/views/prototypes/integrated-g2/UsuariosPreview.vue'
import { routes as canonicalRoutes } from '../../src/router/routes'
import { useAuthStore } from '../../src/stores/auth'
import api from '../../src/services/api'
import '../../src/style.css'
import '../../src/views/prototypes/integrated-g2/preview-shared.css'

api.defaults.adapter = async () => { throw new Error('Esta prévia local não acessa a API') }

const TechnicalArea = defineComponent({ setup: () => () => h('section', { class: 'preview-page' }, [h('h1', { class: 'preview-heading' }, 'Área técnica'), h('p', { class: 'preview-subtitle' }, 'Os diagnósticos do serviço continuam separados do trabalho da loja. Esta prévia não consulta o servidor.')]) })
const previews: Record<string, Component> = { Ledger: FinanceiroPreview, Leads: LeadsPreview, Kanban: FunilPreview, LeadQuote: LeadQuotePreview, Customers: ClientesPreview, Partners: ParceirosPreview, Products: ProdutosPreview, Quotes: OrcamentosPreview, NewQuote: NovoOrcamentoPreview, Orders: PedidosPreview, Users: UsuariosPreview, Dashboard: TechnicalArea }
const children = canonicalRoutes.find(route => route.children)?.children || []
const previewRoutes = children.map(route => {
 if (route.redirect) return route
 const component = previews[String(route.name)]
 return { ...route, meta: { ...route.meta, ...(route.name === 'LeadQuote' ? { pageTitle: 'Preparar orçamento' } : {}) }, component: defineComponent({ setup: () => () => h('div', { class: 'preview-route' }, [
   route.name !== 'Ledger' ? h('div', { class: 'preview-global-note' }, 'Prévia · dados de exemplo') : null,
   h(component || TechnicalArea),
 ]) }) }
})
const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: '/', component: MainLayout, children: [
    { path: '', redirect: { name: 'Ledger' } }, ...previewRoutes,
  ] }, { path: '/:pathMatch(.*)*', redirect: { name: 'Ledger' } }],
})
const app = createApp(defineComponent({ setup: () => () => h(RouterView) }))
const pinia = createPinia()
app.use(pinia)
// Identidade apenas em memória; nenhum token é criado nem persistido.
useAuthStore(pinia).$patch({ token: null, user: { id: 0, username: 'Equipe Verly · prévia', roles: ['ROLE_ADMIN'] } })
if (localStorage.getItem('sidebar-collapsed') === null) localStorage.setItem('sidebar-collapsed', 'false')
app.use(router)
app.mount('#app')
