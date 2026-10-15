import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { formatBRL } from '@/lib/money'
import MoneyInput from './MoneyInput.vue'

function mountInput(modelValue: number | null = null, extra: Record<string, unknown> = {}) {
  return mount(MoneyInput, {
    props: { modelValue, label: 'Valor', ...extra },
  })
}

describe('MoneyInput', () => {
  it('distingue valor vazio de zero', async () => {
    const wrapper = mountInput(null)
    const input = wrapper.get('input')

    expect((input.element as HTMLInputElement).value).toBe('')
    await input.setValue('')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([null])

    await input.setValue('0')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0])
    expect(wrapper.emitted('invalid')?.at(-1)).toEqual([false])
  })

  it('emits cents and rounds decimal input with HALF_UP', async () => {
    const wrapper = mountInput()
    const input = wrapper.get('input')

    await input.setValue('1.113,26')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([111326])
    await input.setValue('856,355')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([85636])
    expect(wrapper.emitted('invalid')?.at(-1)).toEqual([false])
  })

  it('keeps malformed text and never turns it into zero', async () => {
    const wrapper = mountInput(1250)
    const input = wrapper.get('input')

    await input.setValue('12,3x')
    expect((input.element as HTMLInputElement).value).toBe('12,3x')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('invalid')?.at(-1)).toEqual([true])
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(wrapper.text()).toContain('Digite um valor válido')
  })

  it('formats valid input on blur using the money helper', async () => {
    const wrapper = mountInput()
    const input = wrapper.get('input')
    await input.setValue('1113,26')
    await input.trigger('blur')
    expect((input.element as HTMLInputElement).value).toBe(formatBRL(111326))
  })

  it('marks unsafe parent cents as invalid without formatting or rounding them', async () => {
    const wrapper = mountInput(Number.MAX_SAFE_INTEGER + 1)
    const input = wrapper.get('input')

    expect((input.element as HTMLInputElement).value).toBe('')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(wrapper.text()).toContain('Digite um valor válido')

    await wrapper.setProps({ modelValue: 500 })
    expect((input.element as HTMLInputElement).value).toBe(formatBRL(500))
    expect(input.attributes('aria-invalid')).toBeUndefined()
  })

  it('reflects parent replacements and resets while preserving a v-model echo during editing', async () => {
    const wrapper = mountInput(1234)
    const input = wrapper.get('input')

    await input.setValue('12,345')
    const emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as number
    await wrapper.setProps({ modelValue: emitted })
    expect((input.element as HTMLInputElement).value).toBe('12,345')

    await wrapper.setProps({ modelValue: 2500 })
    expect((input.element as HTMLInputElement).value).toBe(formatBRL(2500))
    await wrapper.setProps({ modelValue: null })
    expect((input.element as HTMLInputElement).value).toBe('')
    await wrapper.setProps({ modelValue: 0 })
    expect((input.element as HTMLInputElement).value).toBe(formatBRL(0))
  })

  it('uses the supplied label, error, hint, id and disabled state accessibly', () => {
    const wrapper = mountInput(0, {
      label: 'Preço',
      id: 'price',
      hint: 'Informe em reais',
      error: 'Preço obrigatório',
      disabled: true,
    })
    const input = wrapper.get('input')

    expect(wrapper.get('label').attributes('for')).toBe('price')
    expect(input.attributes('id')).toBe('price')
    expect(input.attributes('disabled')).toBeDefined()
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe('price-hint price-error')
    expect(wrapper.text()).toContain('Preço obrigatório')
    expect(wrapper.text()).toContain('Informe em reais')
  })
})
