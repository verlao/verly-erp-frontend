import { describe, expect, it } from 'vitest'
import {
  formatCaptureProvenance,
  formatLeadAddress,
  formatLeadReference,
  googleMapsSearchUrl,
  leadLocationInput,
  openStreetMapEmbedUrl,
  parseCoordinate,
  parseLeadCoordinates,
} from './leadLocation'

describe('formatLeadAddress', () => {
  it('prefers street+number when present, even if neighborhood/city exist', () => {
    expect(
      formatLeadAddress({
        street: 'Rua das Flores',
        number: '100',
        neighborhood: 'Aterrado',
        city: 'Volta Redonda',
      })
    ).toBe('Rua das Flores, 100')
  })

  it('shows a street without a number and omits an orphan number', () => {
    expect(formatLeadAddress({ street: 'Rua das Flores', neighborhood: 'Centro' })).toBe(
      'Rua das Flores'
    )
    expect(formatLeadAddress({ number: '52' })).toBeNull()
    expect(
      formatLeadAddress({ number: '52', neighborhood: 'Centro', city: 'Volta Redonda' })
    ).toBe('Centro, Volta Redonda')
  })

  it('falls back to neighborhood+city when street and number are missing', () => {
    expect(formatLeadAddress({ neighborhood: 'Aterrado', city: 'Volta Redonda' })).toBe(
      'Aterrado, Volta Redonda'
    )
  })

  it('shows a single locality part when the other is missing', () => {
    expect(formatLeadAddress({ neighborhood: 'Centro' })).toBe('Centro')
    expect(formatLeadAddress({ city: 'Volta Redonda' })).toBe('Volta Redonda')
  })

  it('returns null when every part is missing, empty, or whitespace', () => {
    expect(formatLeadAddress({})).toBeNull()
    expect(
      formatLeadAddress({
        street: '  ',
        number: '',
        neighborhood: null,
        city: undefined,
      })
    ).toBeNull()
  })

  it('never renders a lone comma for missing parts', () => {
    expect(formatLeadAddress({ street: '', number: '671' })).toBeNull()
    expect(formatLeadAddress({ street: 'Rua X', number: '   ' })).toBe('Rua X')
    expect(formatLeadAddress({ neighborhood: '', city: 'Volta Redonda' })).toBe('Volta Redonda')
    expect(formatLeadAddress({ neighborhood: 'Aterrado', city: '  ' })).toBe('Aterrado')
  })
})

describe('formatLeadReference', () => {
  it('returns a trimmed reference or null', () => {
    expect(formatLeadReference({ reference: 'em frente à padaria' })).toBe('em frente à padaria')
    expect(formatLeadReference({ reference: '  ' })).toBeNull()
    expect(formatLeadReference({})).toBeNull()
  })
})

describe('parseCoordinate', () => {
  it('parses period decimals within range', () => {
    expect(parseCoordinate('-23.5505', -90, 90)).toBeCloseTo(-23.5505)
    expect(parseCoordinate('-46.6333', -180, 180)).toBeCloseTo(-46.6333)
  })

  it('parses comma decimals when no period is present', () => {
    expect(parseCoordinate('-22,5234', -90, 90)).toBeCloseTo(-22.5234)
    expect(parseCoordinate(' -44,1042 ', -180, 180)).toBeCloseTo(-44.1042)
  })

  it('accepts inclusive bounds', () => {
    expect(parseCoordinate('90', -90, 90)).toBe(90)
    expect(parseCoordinate('-90', -90, 90)).toBe(-90)
    expect(parseCoordinate('180', -180, 180)).toBe(180)
    expect(parseCoordinate('-180', -180, 180)).toBe(-180)
  })

  it('rejects empty, malformed, and non-numeric values', () => {
    expect(parseCoordinate('', -90, 90)).toBeNull()
    expect(parseCoordinate('   ', -90, 90)).toBeNull()
    expect(parseCoordinate(null, -90, 90)).toBeNull()
    expect(parseCoordinate(undefined, -90, 90)).toBeNull()
    expect(parseCoordinate('abc', -90, 90)).toBeNull()
    expect(parseCoordinate('23.5abc', -90, 90)).toBeNull()
    expect(parseCoordinate('1.234,56', -90, 90)).toBeNull()
    expect(parseCoordinate('NaN', -90, 90)).toBeNull()
    expect(parseCoordinate('Infinity', -90, 90)).toBeNull()
  })

  it('rejects out-of-range values', () => {
    expect(parseCoordinate('90.0001', -90, 90)).toBeNull()
    expect(parseCoordinate('-90.1', -90, 90)).toBeNull()
    expect(parseCoordinate('181', -180, 180)).toBeNull()
    expect(parseCoordinate('-180.01', -180, 180)).toBeNull()
  })
})

describe('parseLeadCoordinates', () => {
  it('returns parsed numbers, a Maps search URL, and provenance', () => {
    const parsed = parseLeadCoordinates({
      latitude: '-23.5505',
      longitude: '-46.6333',
      locationSource: 'gps_pin',
    })
    expect(parsed).toEqual({
      latitude: -23.5505,
      longitude: -46.6333,
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=-23.5505,-46.6333',
      embedUrl: openStreetMapEmbedUrl(-23.5505, -46.6333),
      provenance: 'Pin GPS',
    })
  })

  it('accepts comma-decimal string pairs from VARCHAR capture', () => {
    const parsed = parseLeadCoordinates({
      latitude: '-22,5234',
      longitude: '-44,1042',
    })
    expect(parsed?.latitude).toBeCloseTo(-22.5234)
    expect(parsed?.longitude).toBeCloseTo(-44.1042)
    expect(parsed?.mapsUrl).toBe(googleMapsSearchUrl(parsed!.latitude, parsed!.longitude))
    expect(parsed?.provenance).toBeNull()
  })

  it('returns null when either coordinate is missing or malformed', () => {
    expect(parseLeadCoordinates({ latitude: '-23.5505' })).toBeNull()
    expect(parseLeadCoordinates({ longitude: '-46.6333' })).toBeNull()
    expect(parseLeadCoordinates({ latitude: 'not-a-coord', longitude: '-46.6333' })).toBeNull()
    expect(parseLeadCoordinates({ latitude: '-23.5505', longitude: '' })).toBeNull()
    expect(parseLeadCoordinates({})).toBeNull()
  })

  it('returns null when either coordinate is out of range', () => {
    expect(parseLeadCoordinates({ latitude: '91', longitude: '0' })).toBeNull()
    expect(parseLeadCoordinates({ latitude: '0', longitude: '181' })).toBeNull()
    expect(parseLeadCoordinates({ latitude: '-91', longitude: '-46.6333' })).toBeNull()
  })
})

describe('openStreetMapEmbedUrl', () => {
  it('builds a keyless OSM embed centered on the lead pin', () => {
    const url = new URL(openStreetMapEmbedUrl(-22.9068, -43.1729))

    expect(url.origin).toBe('https://www.openstreetmap.org')
    expect(url.pathname).toBe('/export/embed.html')
    expect(url.searchParams.get('bbox')).toBe('-43.1809,-22.9128,-43.1649,-22.9008')
    expect(url.searchParams.get('layer')).toBe('mapnik')
    expect(url.searchParams.get('marker')).toBe('-22.9068,-43.1729')
    expect([...url.searchParams.keys()]).not.toContain('key')
  })

  it('keeps the embed bounds inside valid coordinate ranges', () => {
    const northeast = new URL(openStreetMapEmbedUrl(90, 180))
    const southwest = new URL(openStreetMapEmbedUrl(-90, -180))

    expect(northeast.searchParams.get('bbox')).toBe('179.992,89.994,180,90')
    expect(southwest.searchParams.get('bbox')).toBe('-180,-90,-179.992,-89.994')
  })
})

describe('formatCaptureProvenance', () => {
  it('maps known sources and passes unknown labels through', () => {
    expect(formatCaptureProvenance('gps_pin')).toBe('Pin GPS')
    expect(formatCaptureProvenance('geolocation')).toBe('Geolocalização do navegador')
    expect(formatCaptureProvenance('manual-drop')).toBe('manual-drop')
    expect(formatCaptureProvenance('  ')).toBeNull()
  })
})

describe('leadLocationInput', () => {
  it('reads extra payload fields without requiring them on LeadDTO', () => {
    const input = leadLocationInput({
      neighborhood: 'Aterrado',
      city: 'Volta Redonda',
      latitude: '-22.5234',
      longitude: '-44.1042',
      street: 'Rua X',
      number: '671',
      reference: 'portão azul',
      source: 'gps_pin',
    })
    expect(formatLeadAddress(input)).toBe('Rua X, 671')
    expect(formatLeadReference(input)).toBe('portão azul')
    expect(parseLeadCoordinates(input)?.provenance).toBe('Pin GPS')
  })

  it('does not treat a generic lead source as GPS provenance', () => {
    const input = leadLocationInput({
      latitude: '-22.5234',
      longitude: '-44.1042',
      source: 'WHATSAPP',
    })
    expect(parseLeadCoordinates(input)?.provenance).toBeNull()
  })

  it('returns an empty input for a missing lead', () => {
    expect(leadLocationInput(null)).toEqual({})
    expect(leadLocationInput(undefined)).toEqual({})
  })
})
