/**
 * Helper único pra montar URL do WhatsApp.
 *
 * Comportamento por plataforma:
 * - Desktop (web): força WhatsApp Web (web.whatsapp.com/send) — evita abrir
 *   o app nativo do desktop que muita gente não tem instalado/logado.
 * - Mobile (iOS/Android): usa wa.me — redireciona pro app nativo da plataforma.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '')
  // BR DDI: anexa 55 se o número não começar com isso
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`
  const encoded = encodeURIComponent(message)

  const isMobile = isMobileDevice()

  return isMobile
    ? `https://wa.me/${withCountry}?text=${encoded}`
    : `https://web.whatsapp.com/send?phone=${withCountry}&text=${encoded}`
}

export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

interface QuoteMessageArgs {
  customerName: string
  quoteId: number | string
  items: Array<{ qty: number; label: string }>
  total: number
}

/**
 * Monta a mensagem padrão de envio de orçamento ao cliente.
 * Markdown leve compatível com WhatsApp (* para negrito).
 */
export function buildQuoteMessage(args: QuoteMessageArgs): string {
  const lines = args.items.map(i => `• ${i.qty}× ${i.label}`)
  const totalFormatted = args.total.toFixed(2)

  return (
    `Olá ${args.customerName}, segue seu orçamento Verly #${args.quoteId}:\n\n` +
    lines.join('\n') +
    `\n\n*Total: R$ ${totalFormatted}*\n\nQualquer dúvida estou à disposição.`
  )
}

interface RichQuoteMessageArgs {
  customerName: string
  quoteId: number | string
  items: Array<{ qty: number; label: string; lineTotal: number }>
  total: number
  discount?: number
  validityDays?: number
}

const brl = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)

/**
 * Mensagem "comercial" do orçamento conferido (tela de conferência do lead):
 * itens com preço por linha, total em destaque, validade e fechamento com CTA.
 * Markdown leve compatível com WhatsApp (* = negrito).
 */
export function buildRichQuoteMessage(args: RichQuoteMessageArgs): string {
  const firstName = args.customerName.trim().split(' ')[0] || args.customerName
  const divider = '━━━━━━━━━━━━━━━'
  const lines = args.items.map(i => `▫ ${i.qty}× ${i.label} — ${brl(i.lineTotal)}`)
  const discountLine = args.discount && args.discount > 0 ? `Desconto: ${brl(args.discount)}\n` : ''

  return (
    `*ORÇAMENTO #${args.quoteId} — Verly Vidraçaria* 🏷️\n\n` +
    `Olá ${firstName}! Conferimos as medidas da nossa conversa e preparamos seu orçamento:\n\n` +
    `${divider}\n` +
    lines.join('\n') +
    `\n${divider}\n` +
    discountLine +
    `💰 *TOTAL: ${brl(args.total)}*\n\n` +
    `✅ Vidro temperado com garantia\n` +
    `📅 Orçamento válido por ${args.validityDays ?? 7} dias\n` +
    `💳 Parcelamos no cartão\n\n` +
    `Podemos agendar a instalação?`
  )
}
