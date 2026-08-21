/**
 * Address line + GPS pin helpers for the lead preview.
 *
 * Coordinates are VARCHAR(255) on the lead (verly-service PR #76) — they arrive
 * as strings, not numbers. Street name is not on LeadDTO (it lives on the
 * address resource); the lead does carry `number`, `neighborhood`, `city`,
 * `reference`, `latitude`, and `longitude`. Extra keys are read structurally
 * so this module does not need to widen `src/services/lead.ts`.
 */

export interface LeadLocationInput {
  street?: string | null
  number?: string | null
  neighborhood?: string | null
  city?: string | null
  reference?: string | null
  latitude?: string | number | null
  longitude?: string | number | null
  locationSource?: string | null
}

export interface ParsedLeadCoordinates {
  latitude: number
  longitude: number
  mapsUrl: string
  provenance: string | null
}

const PROVENANCE_LABELS: Record<string, string> = {
  gps_pin: 'Pin GPS',
  geolocation: 'Geolocalização do navegador',
  browser: 'Geolocalização do navegador',
}

/** Trim a value to a non-empty string, or null. Never returns whitespace. */
export function nonempty(value: unknown): string | null {
  if (value == null) return null
  const text = String(value).trim()
  return text.length > 0 ? text : null
}

function joinParts(parts: unknown[], separator = ', '): string | null {
  const cleaned = parts.map(nonempty).filter((part): part is string => part != null)
  return cleaned.length > 0 ? cleaned.join(separator) : null
}

/**
 * Visible address: street+number when any of those exist, else neighborhood+city,
 * else nothing. Missing parts are omitted — never an empty label or a lone comma.
 */
export function formatLeadAddress(input: LeadLocationInput): string | null {
  return joinParts([input.street, input.number]) ?? joinParts([input.neighborhood, input.city])
}

/** Human location hint ("em frente à padaria"), or null when absent. */
export function formatLeadReference(input: LeadLocationInput): string | null {
  return nonempty(input.reference)
}

const COORD_PATTERN = /^[+-]?(?:\d+|\d*\.\d+)$/

/**
 * Parse a single coordinate string. Accepts a Brazilian decimal comma when no
 * period is present (`-22,5234`). Stored samples use a period (`-23.5505`);
 * comma is tolerated because VARCHAR capture can produce either.
 */
export function parseCoordinate(raw: unknown, min: number, max: number): number | null {
  if (raw == null) return null
  let text = String(raw).trim()
  if (!text) return null
  if (text.includes(',') && !text.includes('.')) {
    text = text.replace(',', '.')
  }
  if (!COORD_PATTERN.test(text)) return null
  const value = Number(text)
  if (!Number.isFinite(value)) return null
  if (value < min || value > max) return null
  return value
}

export function googleMapsSearchUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
}

export function formatCaptureProvenance(raw?: string | null): string | null {
  const key = nonempty(raw)
  if (!key) return null
  return PROVENANCE_LABELS[key] ?? PROVENANCE_LABELS[key.toLowerCase()] ?? key
}

/**
 * Both coordinates must be non-empty, parseable, and in range. A malformed
 * value yields null — the preview must not render a broken map link.
 */
export function parseLeadCoordinates(input: LeadLocationInput): ParsedLeadCoordinates | null {
  const latitude = parseCoordinate(input.latitude, -90, 90)
  const longitude = parseCoordinate(input.longitude, -180, 180)
  if (latitude == null || longitude == null) return null
  return {
    latitude,
    longitude,
    mapsUrl: googleMapsSearchUrl(latitude, longitude),
    provenance: formatCaptureProvenance(input.locationSource),
  }
}

type LeadLocationRecord = {
  street?: string | null
  number?: string | null
  neighborhood?: string | null
  city?: string | null
  reference?: string | null
  latitude?: string | number | null
  longitude?: string | number | null
  locationSource?: string | null
  source?: string | null
}

/**
 * Pick location fields off a lead without widening LeadDTO. `number` / `street`
 * / `reference` / `locationSource` may exist at runtime even when the TS type
 * on this branch does not declare them.
 */
export function leadLocationInput(lead?: object | null): LeadLocationInput {
  if (!lead) return {}
  const extra = lead as LeadLocationRecord
  const locationSource =
    nonempty(extra.locationSource) ??
    (nonempty(extra.source)?.toLowerCase() === 'gps_pin' ? extra.source : null)
  return {
    street: extra.street,
    number: extra.number,
    neighborhood: extra.neighborhood,
    city: extra.city,
    reference: extra.reference,
    latitude: extra.latitude,
    longitude: extra.longitude,
    locationSource,
  }
}
