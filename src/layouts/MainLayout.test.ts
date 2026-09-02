import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { defineComponent, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'
import MainLayout from './MainLayout.vue'

const EmptyView = defineComponent({ template: '<div />' })
const SidebarStub = defineComponent({
  props: { collapsed: { type: Boolean, required: true } },
  emits: ['update:collapsed', 'logout'],
  template: `
    <button
      data-testid="sidebar"
      @click="$emit('update:collapsed', !collapsed)"
    />
  `,
})

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width,
  })
  window.dispatchEvent(new Event('resize'))
}

async function mountLayout() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/leads', component: EmptyView }],
  })
  await router.push('/leads')
  await router.isReady()

  return mount(MainLayout, {
    global: {
      plugins: [createPinia(), router],
      stubs: {
        DesktopSidebar: SidebarStub,
        MobileTopBar: true,
        MobileMoreMenu: true,
        MobileBottomNav: true,
        DropdownMenu: true,
        RouterView: true,
      },
    },
  })
}

describe('main layout sidebar breakpoint', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('sidebar-collapsed', 'false')
    setViewportWidth(1440)
  })

  it('uses a rail below xl without overwriting the wide-screen preference', async () => {
    const wrapper = await mountLayout()
    const sidebar = () => wrapper.findComponent(SidebarStub)
    const main = () => wrapper.get('main')

    expect(sidebar().props('collapsed')).toBe(false)
    expect(main().classes()).toContain('ml-64')

    setViewportWidth(1000)
    await nextTick()

    expect(sidebar().props('collapsed')).toBe(true)
    expect(main().classes()).toContain('ml-16')
    expect(localStorage.getItem('sidebar-collapsed')).toBe('false')

    await sidebar().trigger('click')

    expect(sidebar().props('collapsed')).toBe(false)
    expect(main().classes()).toContain('ml-16')
    expect(localStorage.getItem('sidebar-collapsed')).toBe('false')

    setViewportWidth(1440)
    await nextTick()

    expect(sidebar().props('collapsed')).toBe(false)
    expect(main().classes()).toContain('ml-64')
    expect(localStorage.getItem('sidebar-collapsed')).toBe('false')

    await sidebar().trigger('click')
    expect(localStorage.getItem('sidebar-collapsed')).toBe('true')

    setViewportWidth(1000)
    await nextTick()
    setViewportWidth(1440)
    await nextTick()

    expect(sidebar().props('collapsed')).toBe(true)
    expect(main().classes()).toContain('ml-16')
  })
})
