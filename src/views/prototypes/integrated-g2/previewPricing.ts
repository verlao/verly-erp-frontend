import { reviewLeads, type ReviewPiece } from './reviewContext'

export interface DemoPrice {
  cents: number | null
  source: string
}

// Synthetic responses for exploring the review flow. Production pricing belongs to the service.
export function priceReviewPiece(piece: ReviewPiece, width: number | null, height: number | null, area: number | null, color = piece.color.value): DemoPrice {
  const positive = (value: number | null): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0
  const candidates = reviewLeads.value.flatMap(lead => lead.items)
  const reference = color === piece.color.value && piece.estimatedUnitCents != null ? piece : candidates.find(item =>
    item.productType === piece.productType && item.color.value === color && item.estimatedUnitCents != null,
  )
  if (piece.pricingBasis === 'PER_M2') {
    if (!positive(area)) return { cents: null, source: 'Complete a área que falta' }
    if (!reference || !positive(reference.areaM2.value) || reference.estimatedUnitCents == null) return { cents: null, source: 'Preço de exemplo indisponível para esta configuração' }
    return { cents: Math.round(reference.estimatedUnitCents * area / reference.areaM2.value), source: 'Valor de exemplo para conferir o fluxo · cálculo real no serviço' }
  }
  if (!positive(width) || !positive(height)) return { cents: null, source: 'Complete a medida que falta' }
  if (reference && positive(reference.widthCm.value) && positive(reference.heightCm.value) && reference.estimatedUnitCents != null) {
    return { cents: Math.round(reference.estimatedUnitCents * width * height / (reference.widthCm.value * reference.heightCm.value)), source: 'Estimativa de exemplo · confira o preço antes de enviar' }
  }
  if (piece.productType === 'BOX' && color === 'INCOLOR') {
    return { cents: Math.round(112000 * width * height / (150 * 190)), source: 'Estimativa de exemplo para box incolor · confira o preço antes de enviar' }
  }
  return { cents: null, source: 'Preço de exemplo indisponível para esta configuração' }
}
