import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { defineComponent } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'
import MobileBottomNav from './MobileBottomNav.vue'
import MobileMoreMenu from './MobileMoreMenu.vue'

const RouteView = defineComponent({ template: '<router-view />' })
const EmptyView = defineComponent({ template: '<div />' })

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/ledger',
        name: 'Ledger',
        component: RouteView,
        children: [{ path: 'entries/:id', component: EmptyView }],
      },
      { path: '/products', name: 'Products', component: EmptyView },
      { path: '/leads', name: 'Leads', component: EmptyView },
      { path: '/new-quote', name: 'NewQuote', component: EmptyView },
      { path: '/quotes', name: 'Quotes', component: EmptyView },
      { path: '/kanban', name: 'Kanban', component: EmptyView },
      { path: '/customers', name: 'Customers', component: EmptyView },
      { path: '/partners', name: 'Partners', component: EmptyView },
      { path: '/orders', name: 'Orders', component: EmptyView },
      { path: '/users', name: 'Users', component: EmptyView },
    ],
  })
}

describe('mobile navigation priorities', () => {
  it('shows Financeiro in the bottom nav and keeps it active on child routes', async () => {
    const router = createTestRouter()
    await router.push('/ledger/entries/42')
    await router.isReady()

    const wrapper = mount(MobileBottomNav, {
      global: { plugins: [router] },
    })
    const financeButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Financeiro')

    expect(financeButton).toBeDefined()
    expect(financeButton?.classes()).toContain('text-blue-600')
    expect(wrapper.text()).not.toContain('Produtos')
  })

  it('keeps Produtos reachable from Mais', async () => {
    const router = createTestRouter()
    await router.push('/leads')
    await router.isReady()

    const wrapper = mount(MobileMoreMenu, {
      props: { open: true },
      global: {
        plugins: [createPinia(), router],
        stubs: { Teleport: true },
      },
    })
    const productsButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Produtos')

    expect(productsButton).toBeDefined()
    await productsButton?.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/products')
    expect(wrapper.text()).not.toContain('Financeiro')
  })
})
