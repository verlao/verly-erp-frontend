import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import LeadQuote from './LeadQuote.vue'
import leadService from '../services/lead'
import productService from '../services/product'
import quoteService from '../services/quote'

const notification = vi.hoisted(() => ({
  success: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
}))

vi.mock('../services/lead', () => ({
  default: { getById: vi.fn(), getFreshById: vi.fn() },
}))
vi.mock('../services/product', () => ({
  default: { calculate: vi.fn() },
}))
vi.mock('../services/quote', () => ({
  default: { createFromLead: vi.fn(), getPDF: vi.fn() },
}))
vi.mock('../composables/useNotification', () => ({
  useNotification: () => notification,
}))

const lead = () => ({
  id: 1,
  name: 'Ana Box',
  phone: '11999999999',
  email: '',
  description: '',
  city: 'São Paulo',
  neighborhood: 'Centro',
  data: '{}',
  createdDate: '2026-10-20T10:00:00',
  items: [
    { quantity: 1, productType: 'BOX', color: 'INCOLOR', sheets: 1, widthCm: 100, heightCm: 100 },
  ],
})

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => (resolve = r))
  return { promise, resolve }
}

async function mountQuote() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/leads/:id/orcamento', component: LeadQuote }],
  })
  router.push('/leads/1/orcamento')
  await router.isReady()
  const wrapper = mount(LeadQuote, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

// inputs numéricos na ordem da tela: largura, altura, folhas, qtd (+ desconto/preço no fim)
const widthInput = (w: Awaited<ReturnType<typeof mountQuote>>) =>
  w.findAll('input[type="number"]')[0]
const heightInput = (w: Awaited<ReturnType<typeof mountQuote>>) =>
  w.findAll('input[type="number"]')[1]

describe('LeadQuote pricing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(leadService.getById).mockResolvedValue(lead() as never)
  })

  it('sends dimensions in centimetres so the backend derives m²', async () => {
    vi.mocked(productService.calculate).mockResolvedValue({ price: 120 } as never)
    const wrapper = await mountQuote()

    expect(productService.calculate).toHaveBeenCalledWith({
      category: 'VIDRO_TEMPERADO',
      type: 'BOX',
      color: 'INCOLOR',
      sheets: 1,
      width: 100,
      height: 100,
    })
    expect(wrapper.text()).toContain('R$ 120,00')
  })

  it('keeps the newest price when an older calculation answers last', async () => {
    const initial = deferred<{ price: number }>()
    const forWidth = deferred<{ price: number }>()
    const forHeight = deferred<{ price: number }>()
    vi.mocked(productService.calculate)
      .mockReturnValueOnce(initial.promise as never)
      .mockReturnValueOnce(forWidth.promise as never)
      .mockReturnValueOnce(forHeight.promise as never)

    const wrapper = await mountQuote()
    initial.resolve({ price: 120 })
    await flushPromises()
    expect(wrapper.text()).toContain('R$ 120,00')

    await widthInput(wrapper).setValue('200')
    await flushPromises()
    await heightInput(wrapper).setValue('300')
    await flushPromises()

    // a resposta da medição mais nova chega primeiro…
    forHeight.resolve({ price: 900 })
    await flushPromises()
    expect(wrapper.text()).toContain('R$ 900,00')

    // …e a da medição antiga (200×100) chega depois: não pode sobrescrever
    forWidth.resolve({ price: 200 })
    await flushPromises()
    expect(wrapper.text()).toContain('R$ 900,00')
    expect(wrapper.text()).not.toContain('R$ 200,00')
  })

  it('ignores a late price after the measurement becomes incomplete', async () => {
    const initial = deferred<{ price: number }>()
    const late = deferred<{ price: number }>()
    vi.mocked(productService.calculate)
      .mockReturnValueOnce(initial.promise as never)
      .mockReturnValueOnce(late.promise as never)

    const wrapper = await mountQuote()
    initial.resolve({ price: 120 })
    await flushPromises()

    await widthInput(wrapper).setValue('200')
    await flushPromises()

    // limpar a largura invalida a medição em voo
    await widthInput(wrapper).setValue('0')
    await flushPromises()
    expect(wrapper.text()).toContain('Pendente de medida')

    late.resolve({ price: 500 })
    await flushPromises()
    expect(wrapper.text()).toContain('Pendente de medida')
    expect(wrapper.text()).not.toContain('R$ 500,00')
  })

  it('does not turn an unavailable price into R$ 0,00', async () => {
    vi.mocked(leadService.getById).mockResolvedValue({
      ...lead(),
      totalEstimatedValue: 0,
      items: [{ quantity: 1, productType: 'BOX', color: 'INCOLOR', sheets: 1, widthCm: 100, heightCm: 100, pendingMeasurement: true }],
    } as never)
    vi.mocked(productService.calculate).mockResolvedValue({
      price: null,
      priceUnavailableReason: 'Medida fora do catálogo',
    } as never)
    const wrapper = await mountQuote()

    const text = wrapper.text()
    expect(text).toContain('Pendente de medição')
    expect(text).toContain('Aguardando preço')
    expect(text).not.toContain('R$ 0,00')
    expect(text).not.toContain('Estimativa da IA')
  })

  it('counts only the chosen alternative of an A/B group', async () => {
    vi.mocked(leadService.getById).mockResolvedValue({
      ...lead(),
      items: [
        { quantity: 1, productType: 'BOX', color: 'INCOLOR', sheets: 1, widthCm: 100, heightCm: 100, variantGroup: 'A', variantSelected: true },
        { quantity: 1, productType: 'JANELA', color: 'INCOLOR', sheets: 1, widthCm: 200, heightCm: 200, variantGroup: 'A', variantSelected: false },
      ],
    } as never)
    vi.mocked(productService.calculate)
      .mockResolvedValueOnce({ price: 100 } as never)
      .mockResolvedValueOnce({ price: 250 } as never)

    const wrapper = await mountQuote()
    const total = () => wrapper.find('[data-testid="quote-total"]').text()
    expect(total()).toBe('R$ 100,00')

    const radios = wrapper.findAll('input[type="radio"]')
    await radios[1].trigger('change')
    await flushPromises()
    expect(total()).toBe('R$ 250,00')
  })

  it('never shows the backend message when saving fails', async () => {
    vi.mocked(productService.calculate).mockResolvedValue({ price: 120 } as never)
    vi.mocked(quoteService.createFromLead).mockRejectedValue({
      response: { status: 500, data: { message: 'SQL boom' } },
    })
    const wrapper = await mountQuote()

    const saveButton = wrapper.findAll('button').find((b) => b.text() === 'Salvar')
    await saveButton!.trigger('click')
    await flushPromises()

    expect(notification.error).toHaveBeenCalledWith(
      'Erro ao confirmar',
      'O sistema falhou. Tente de novo em instantes.',
    )
    const shown = String(vi.mocked(notification.error).mock.calls[0]?.[1] ?? '')
    expect(shown).not.toContain('SQL')
  })
})

const discountInput = (w: Awaited<ReturnType<typeof mountQuote>>) =>
  w.findAll('input[type="number"]')[4]
const finalPriceInput = (w: Awaited<ReturnType<typeof mountQuote>>) =>
  w.findAll('input[type="number"]')[5]

describe('LeadQuote manual price and discount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(leadService.getById).mockResolvedValue(lead() as never)
    vi.mocked(leadService.getFreshById).mockResolvedValue({
      ...lead(),
      extractionConfirmedAt: '2026-10-30T10:00:00',
    } as never)
    vi.mocked(productService.calculate).mockResolvedValue({ price: 120 } as never)
    vi.mocked(quoteService.createFromLead).mockResolvedValue({ id: 7 } as never)
  })

  const total = (w: Awaited<ReturnType<typeof mountQuote>>) =>
    w.find('[data-testid="quote-total"]').text().replace(/ /g, ' ')

  async function clickSendMessage(w: Awaited<ReturnType<typeof mountQuote>>) {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    const button = w.findAll('button').find((b) => b.text().includes('Enviar mensagem'))
    await button!.trigger('click')
    await flushPromises()
    const url = String(open.mock.calls[0]?.[0] ?? '')
    open.mockRestore()
    return decodeURIComponent(url).replace(/ /g, ' ')
  }

  it('treats an erased manual price as no override', async () => {
    const wrapper = await mountQuote()

    await finalPriceInput(wrapper).setValue('500')
    await flushPromises()
    expect(total(wrapper)).toBe('R$ 500,00')

    await finalPriceInput(wrapper).setValue('')
    await flushPromises()
    expect(total(wrapper)).toBe('R$ 120,00')

    const message = await clickSendMessage(wrapper)
    const payload = vi.mocked(quoteService.createFromLead).mock.calls[0]?.[0]
    expect(payload).not.toHaveProperty('finalPriceOverride')
    expect(payload).not.toHaveProperty('discount')
    expect(message).toContain('💰 *TOTAL: R$ 120,00*')
    expect(message).not.toContain('R$ 0,00')
  })

  it('treats an erased discount as no discount', async () => {
    const wrapper = await mountQuote()

    await discountInput(wrapper).setValue('20')
    await flushPromises()
    expect(total(wrapper)).toBe('R$ 100,00')

    await discountInput(wrapper).setValue('')
    await flushPromises()
    expect(total(wrapper)).toBe('R$ 120,00')

    const message = await clickSendMessage(wrapper)
    const payload = vi.mocked(quoteService.createFromLead).mock.calls[0]?.[0]
    expect(payload).not.toHaveProperty('discount')
    expect(message).toContain('💰 *TOTAL: R$ 120,00*')
    expect(message).not.toContain('Desconto')
  })

  it('ignores a negative manual price', async () => {
    const wrapper = await mountQuote()

    await finalPriceInput(wrapper).setValue('-5')
    await flushPromises()
    expect(total(wrapper)).toBe('R$ 120,00')

    const message = await clickSendMessage(wrapper)
    const payload = vi.mocked(quoteService.createFromLead).mock.calls[0]?.[0]
    expect(payload).not.toHaveProperty('finalPriceOverride')
    expect(message).toContain('💰 *TOTAL: R$ 120,00*')
  })
})

describe('LeadQuote while a price is recalculating', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(leadService.getById).mockResolvedValue(lead() as never)
    vi.mocked(leadService.getFreshById).mockResolvedValue({
      ...lead(),
      extractionConfirmedAt: '2026-10-30T10:00:00',
    } as never)
    vi.mocked(quoteService.createFromLead).mockResolvedValue({ id: 7 } as never)
  })

  const footer = (w: Awaited<ReturnType<typeof mountQuote>>, testid: string) =>
    w.find(`[data-testid="${testid}"]`).text().replace(/ /g, ' ')
  const actionButtons = (w: Awaited<ReturnType<typeof mountQuote>>) =>
    ['Salvar', 'Enviar PDF', 'Enviar mensagem'].map((label) => {
      const button = w.findAll('button').find((b) => b.text().includes(label))
      expect(button, label).toBeTruthy()
      return button!
    })

  async function startRecalculation() {
    const pending = deferred<{ price: number }>()
    vi.mocked(productService.calculate)
      .mockReturnValueOnce(Promise.resolve({ price: 120 }) as never)
      .mockReturnValueOnce(pending.promise as never)
    const wrapper = await mountQuote()
    expect(footer(wrapper, 'quote-total')).toBe('R$ 120,00')

    await widthInput(wrapper).setValue('200')
    await flushPromises()
    return { wrapper, pending }
  }

  it('shows no price and blocks the actions until the new price arrives', async () => {
    const { wrapper, pending } = await startRecalculation()

    expect(wrapper.text()).toContain('calculando…')
    expect(footer(wrapper, 'quote-subtotal')).toBe('Aguardando preço')
    expect(footer(wrapper, 'quote-total')).toBe('Aguardando preço')
    for (const button of actionButtons(wrapper)) {
      expect(button.attributes('disabled'), button.text()).toBeDefined()
    }

    pending.resolve({ price: 240 })
    await flushPromises()
    expect(footer(wrapper, 'quote-total')).toBe('R$ 240,00')
    for (const button of actionButtons(wrapper)) {
      expect(button.attributes('disabled'), button.text()).toBeUndefined()
    }
  })

  it('shows no price even with a manual final price', async () => {
    const { wrapper } = await startRecalculation()

    await finalPriceInput(wrapper).setValue('500')
    await flushPromises()
    expect(footer(wrapper, 'quote-total')).toBe('Aguardando preço')
  })

  it('does not save or send the message while the price is recalculating', async () => {
    const { wrapper } = await startRecalculation()
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    const sendMessage = actionButtons(wrapper)[2]

    await sendMessage.trigger('click')
    await flushPromises()
    expect(quoteService.createFromLead).not.toHaveBeenCalled()

    // sem o disabled, o próprio save() tem que recusar
    sendMessage.element.removeAttribute('disabled')
    await sendMessage.trigger('click')
    await flushPromises()
    expect(quoteService.createFromLead).not.toHaveBeenCalled()
    expect(open).not.toHaveBeenCalled()
    expect(notification.warning).toHaveBeenCalledWith('Atenção', 'Aguarde o cálculo do preço terminar')
    open.mockRestore()
  })

  it('is not blocked by an unchosen A/B alternative that is recalculating', async () => {
    vi.mocked(leadService.getById).mockResolvedValue({
      ...lead(),
      items: [
        { quantity: 1, productType: 'BOX', color: 'INCOLOR', sheets: 1, widthCm: 100, heightCm: 100, variantGroup: 'A', variantSelected: true },
        { quantity: 1, productType: 'JANELA', color: 'INCOLOR', sheets: 1, widthCm: 200, heightCm: 200, variantGroup: 'A', variantSelected: false },
      ],
    } as never)
    const pending = deferred<{ price: number }>()
    vi.mocked(productService.calculate)
      .mockReturnValueOnce(Promise.resolve({ price: 100 }) as never)
      .mockReturnValueOnce(Promise.resolve({ price: 250 }) as never)
      .mockReturnValueOnce(pending.promise as never)
    const wrapper = await mountQuote()

    // largura da JANELA (2ª linha): o cálculo dela fica pendurado
    await wrapper.findAll('input[type="number"]')[4].setValue('300')
    await flushPromises()
    expect(wrapper.text()).toContain('calculando…')

    expect(footer(wrapper, 'quote-total')).toBe('R$ 100,00')
    expect(actionButtons(wrapper)[0].attributes('disabled')).toBeUndefined()
  })
})
