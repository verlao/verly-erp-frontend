import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import UndoToast from './UndoToast.vue'

describe('UndoToast', () => {
  it('announces pending state politely and emits undo without taking focus', async () => {
    const wrapper = mount(UndoToast, { props: { message: 'Lead movido' } })
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.attributes('aria-live')).toBe('polite')
    expect(wrapper.attributes('aria-atomic')).toBe('true')
    expect(wrapper.text()).not.toContain('Salvando…')
    expect(wrapper.find('button').text()).toBe('Desfazer')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('undo')).toHaveLength(1)
    expect(wrapper.element.contains(document.activeElement)).toBe(false)
  })

  it('shows an alert and dismiss action for errors', async () => {
    const wrapper = mount(UndoToast, { props: { message: 'Lead movido', pending: false, error: 'Não foi possível salvar' } })
    expect(wrapper.find('[role="alert"]').text()).toBe('Não foi possível salvar')
    expect(wrapper.text()).toContain('Fechar aviso')
    expect(wrapper.find('button').text()).toBe('Fechar aviso')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('Desfazer')
  })

  it('shows saving feedback without an undo action while committing', () => {
    const wrapper = mount(UndoToast, { props: { message: 'Lead movido', pending: false } })
    expect(wrapper.text()).toContain('Salvando…')
    expect(wrapper.findAll('button')).toHaveLength(0)
  })
})
