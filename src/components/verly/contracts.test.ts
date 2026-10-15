import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ActionButton from './ActionButton.vue'
import ChoiceChip from './ChoiceChip.vue'
import PieceDrawing from './PieceDrawing.vue'

describe('Verly design components', () => {
  it('disables an action when its reason is supplied and exposes that reason accessibly', async () => {
    const onClick = vi.fn()
    const wrapper = mount(ActionButton, {
      props: { disabledReason: 'Aguarde a confirmação' },
      attrs: { 'aria-describedby': 'contexto-anterior', onClick },
      slots: { default: 'Salvar' },
    })

    const button = wrapper.get('button')
    expect(button.attributes('disabled')).toBeDefined()
    const describedBy = button.attributes('aria-describedby')?.split(' ')
    expect(describedBy).toContain('contexto-anterior')
    expect(wrapper.get(`#${describedBy?.find((id) => id !== 'contexto-anterior')}`).text()).toBe('Aguarde a confirmação')
    await button.trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('announces the selected state and emits the next value when a chip is activated', async () => {
    const wrapper = mount(ChoiceChip, { props: { selected: false }, slots: { default: 'Temperado' } })
    expect(wrapper.get('button').attributes('aria-pressed')).toBe('false')
    expect(wrapper.find('svg').exists()).toBe(false)

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('update:selected')).toEqual([[true]])
    await wrapper.setProps({ selected: true })
    expect(wrapper.get('button').attributes('aria-pressed')).toBe('true')
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('provides complete dimension text and handles invalid measurements accessibly', () => {
    const measured = mount(PieceDrawing, { props: { widthCm: 120.5, heightCm: 80, label: 'Lateral' } })
    expect(measured.get('svg').attributes('aria-label')).toBe('Lateral: 120.5 × 80 cm')
    expect(measured.get('figcaption').text()).toBe('Lateral: 120.5 × 80 cm')

    const invalid = mount(PieceDrawing, { props: { widthCm: Number.NaN, heightCm: 80 } })
    expect(invalid.get('figcaption').text()).toBe('Peça de vidro: Medidas indisponíveis')
    expect(invalid.find('rect').exists()).toBe(false)
  })
})
