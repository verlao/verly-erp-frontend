// Entrada descartável e local. Reutiliza o layout/menu reais do ERP sem montar
// autenticação nem carregar views que acessam a API. Não é parte de src/main.ts.
import { createApp, defineComponent, h } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory, RouterView, useRoute } from 'vue-router'
import MainLayout from '../../src/layouts/MainLayout.vue'
import FinanceiroPreview from '../../src/views/prototypes/integrated-g2/FinanceiroPreview.vue'
import { routes as canonicalRoutes } from '../../src/router/routes'
import { useAuthStore } from '../../src/stores/auth'
import api from '../../src/services/api'
import '../../src/style.css'

api.defaults.adapter = async () => { throw new Error('Esta prévia local não acessa a API') }

const OtherArea = defineComponent({
  setup() {
    const route = useRoute()
    return () => h('section', { class: 'verly-surface rounded-xl p-8' }, [
      h('h1', { class: 'text-2xl mb-4' }, String(route.meta.nav?.label || 'Verly ERP')),
      h('p', 'Esta área não foi redesenhada nesta prévia. Use Financeiro no menu para conferir os recebimentos de exemplo.'),
    ])
  },
})
const children = canonicalRoutes.find(route => route.children)?.children || []
const previewRoutes = children.map(route => route.redirect ? route : ({
  ...route,
  component: route.name === 'Ledger' ? FinanceiroPreview : OtherArea,
}))
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
