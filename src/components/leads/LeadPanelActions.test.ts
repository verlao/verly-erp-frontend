import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { buildWhatsAppUrl } from '../../lib/whatsapp'
import type { LeadDTO } from '../../services/lead'
import LeadListItem from './LeadListItem.vue'
import LeadPreview from './LeadPreview.vue'

const EmptyView = defineComponent({ template: '<div />' })

const lead: LeadDTO = {
  id: 42,
  name: 'Maria da Silva',
  phone: '(21) 99999-1234',
  email: '5521999991234@whatsapp.internal',
  description: 'Portas extraídas da conversa',
  city: 'Rio de Janeiro',
  neighborhood: 'Centro',
  latitude: '-22.9068',
  longitude: '-43.1729',
  source: 'gps_pin',
  data: '{}',
  createdDate: '2026-09-02T15:00:00Z',
  status: 'NEW',
  suggestedReply: 'Pra fechar o orçamento do porta, me passa a largura × altura?',
  items: [
    { id: 1, productType: 'PORTA', quantity: 12, estimatedValue: 1200 },
    { id: 2, productType: 'PORTA', quantity: 1, estimatedValue: 100 },
  ],
}

async function mountPreview(selectedLead: LeadDTO = lead) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/leads', component: EmptyView },
      { path: '/leads/:id/orcamento', component: EmptyView },
    ],
  })
  await router.push('/leads')
  await router.isReady()

  return {
    router,
    wrapper: mount(LeadPreview, {
      props: { lead: selectedLead },
      global: { plugins: [router] },
    }),
  }
}

describe('lead panel actions', () => {
  it('emits the backend suggested reply unchanged for WhatsApp', async () => {
    const { wrapper } = await mountPreview()

    await wrapper.get('[aria-label="Enviar pergunta no WhatsApp"]').trigger('click')

    expect(wrapper.emitted('openWhatsapp')).toEqual([[lead.suggestedReply]])
    expect(wrapper.text()).toContain('Copiar')
    expect(buildWhatsAppUrl(lead.phone, lead.suggestedReply!)).toBe(
      'https://web.whatsapp.com/send?phone=5521999991234&text=Pra%20fechar%20o%20or%C3%A7amento%20do%20porta%2C%20me%20passa%20a%20largura%20%C3%97%20altura%3F',
    )
  })

  it.each([
    ['Extraído automaticamente — confira antes de enviar'],
    ['Conferir/corrigir'],
    ['Conferir extração'],
  ])('opens the correct quote review from "%s"', async (label) => {
    const { router, wrapper } = await mountPreview()
    const action = wrapper.findAll('button').find(button => button.text().includes(label))

    expect(action).toBeDefined()
    await action!.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/leads/42/orcamento')
  })

  it('replaces the list email action with extraction review', async () => {
    const wrapper = mount(LeadListItem, { props: { lead } })

    expect(wrapper.find('[title="Enviar email"]').exists()).toBe(false)
    await wrapper.get('[title="Conferir extração"]').trigger('click')

    expect(wrapper.emitted('quickAction')).toEqual([['review-extraction']])
  })

  it('shows the confirmed badge in the panel and removes the review warning', async () => {
    const { wrapper } = await mountPreview({
      ...lead,
      extractionConfirmedAt: '2026-09-02T22:00:00',
    })

    expect(wrapper.text()).toContain('✓ Conferido')
    expect(wrapper.text()).not.toContain('Extraído automaticamente — confira antes de enviar')
  })

  it('shows the confirmed badge in the lead list', () => {
    const wrapper = mount(LeadListItem, {
      props: {
        lead: {
          ...lead,
          extractionConfirmedAt: '2026-09-02T22:00:00',
        },
      },
    })

    expect(wrapper.text()).toContain('✓ Conferido')
  })

  it('shows a lazy keyless OSM map while preserving the external map link', async () => {
    const { wrapper } = await mountPreview()
    const iframe = wrapper.get('iframe[title="Mapa da localização de Maria da Silva"]')
    const mapLink = wrapper.findAll('a').find(link => link.text().includes('Ver no mapa'))

    expect(iframe.attributes('loading')).toBe('lazy')
    expect(iframe.attributes('src')).toContain('https://www.openstreetmap.org/export/embed.html')
    expect(iframe.attributes('src')).not.toContain('key=')
    expect(mapLink?.attributes('href')).toBe(
      'https://www.google.com/maps/search/?api=1&query=-22.9068,-43.1729'
    )
    expect(wrapper.text()).toContain('Enviada por Maria da Silva')
    expect(wrapper.text()).toContain('Origem: Pin GPS')
    expect(wrapper.text()).toContain('Se o mapa estiver indisponível')
    expect(wrapper.text()).not.toContain('Coordenadas')
    expect(wrapper.text()).not.toContain('-22.9068')

    await iframe.trigger('error')
    expect(wrapper.text()).toContain('Informações de Contato')
    expect(wrapper.text()).toContain('WhatsApp — Abrir conversa')
  })
})
