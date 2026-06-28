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
