import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { defineComponent } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'
import LeadsToolbar from '../leads/LeadsToolbar.vue'
import DesktopSidebar from './DesktopSidebar.vue'

const EmptyView = defineComponent({ template: '<div />' })

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      '/leads',
      '/kanban',
      '/customers',
      '/partners',
      '/products',
      '/new-quote',
      '/quotes',
      '/orders',
      '/ledger',
      '/users',
    ].map((path) => ({ path, component: EmptyView })),
  })
}

async function mountSidebar() {
  const router = createTestRouter()
  await router.push('/leads')
  await router.isReady()

  return mount(DesktopSidebar, {
    props: { collapsed: false },
    global: { plugins: [createPinia(), router] },
  })
}

describe('desktop sidebar', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem(
      'user',
      JSON.stringify({ id: 1, username: 'admin', roles: ['ROLE_ADMIN'] }),
    )
  })

  it('keeps the menu scrollable and logout in normal flex layout', async () => {
    const wrapper = await mountSidebar()
    const nav = wrapper.get('nav')
    const logout = wrapper
      .findAll('div')
      .find((element) => element.text() === 'Sair')

    expect(wrapper.get('aside').classes()).toEqual(
      expect.arrayContaining(['flex', 'flex-col']),
    )
    expect(nav.classes()).toEqual(expect.arrayContaining(['h-full', 'overflow-y-auto']))
    expect(nav.element.parentElement?.classList.contains('flex-1')).toBe(true)
    expect(nav.element.parentElement?.classList.contains('min-h-0')).toBe(true)
    expect(logout?.classes()).toContain('shrink-0')
    expect(logout?.classes()).not.toContain('absolute')

    await logout?.get('button').trigger('click')
    expect(wrapper.emitted('logout')).toHaveLength(1)
  })

  it('leaves quote creation to contextual calls to action', async () => {
    const wrapper = await mountSidebar()

    expect(wrapper.text()).not.toContain('Novo Orçamento')
    expect(wrapper.text()).toContain('Orçamentos')

    const router = createTestRouter()
    await router.push('/leads')
    await router.isReady()
    const toolbar = mount(LeadsToolbar, {
      global: { plugins: [router] },
    })

    await toolbar.get('button').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/new-quote')
  })

  it('prioritizes Leads and Financeiro and keeps every rail action identifiable', async () => {
    const wrapper = await mountSidebar()
    await wrapper.setProps({ collapsed: true })

    const expectedLabels = [
      'Leads',
      'Financeiro',
      'Funil',
      'Clientes',
      'Parceiros',
      'Produtos',
      'Orçamentos',
      'Pedidos',
      'Usuários',
    ]
    const nav = wrapper.get('nav')
    const navButtons = nav.findAll('button')

    expect(nav.classes()).toEqual(
      expect.arrayContaining([
        '[&>[data-navigation-item]]:h-8',
        '[&>[data-navigation-item]]:min-h-8',
      ]),
    )
    expect(navButtons).toHaveLength(expectedLabels.length)
    expectedLabels.forEach((label, index) => {
      expect(navButtons[index]?.attributes('title')).toBe(label)
      expect(navButtons[index]?.attributes('aria-label')).toBe(label)
      expect(navButtons[index]?.get('span.sr-only').text()).toBe(label)
    })

    const toggle = wrapper.get('aside > div:first-child button')
    expect(toggle.attributes('title')).toBe('Expandir menu')
    expect(toggle.attributes('aria-label')).toBe('Expandir menu')
    expect(toggle.classes()).toEqual(expect.arrayContaining(['h-11', 'w-11']))
    expect(toggle.classes()).toContain('focus-visible:ring-2')

    const logout = wrapper.get('aside > div:last-child button')
    expect(logout.attributes('title')).toBe('Sair')
    expect(logout.attributes('aria-label')).toBe('Sair')
    expect(logout.classes()).toContain('min-h-11')

    await wrapper.setProps({ collapsed: false })
    expect(nav.classes()).toContain('[&>[data-navigation-item]]:min-h-11')
  })
})
