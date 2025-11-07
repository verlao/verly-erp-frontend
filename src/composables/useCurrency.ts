/**
 * Composable for currency formatting and parsing (BRL)
 */
export function useCurrency() {
  /**
   * Format a number value to BRL currency string
   * @param value - The numeric value to format
   * @returns Formatted currency string (e.g., "R$ 1.234,56")
   */
  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'R$ 0,00'
    }

    return `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
  }

  /**
   * Parse a currency string to number
   * @param input - The currency string (e.g., "R$ 1.234,56" or "1234,56")
   * @returns Numeric value
   */
  const parseCurrency = (input: string): number => {
    if (!input || typeof input !== 'string') {
      return 0
    }

    // Remove R$, spaces, and dots (thousand separators)
    let cleaned = input.replace(/R\$/g, '').replace(/\s/g, '').replace(/\./g, '')

    // Replace comma with dot for decimal separator
    cleaned = cleaned.replace(',', '.')

    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  /**
   * Format input value for display during typing
   * @param value - The numeric value
   * @returns Formatted string for input display
   */
  const formatInput = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return ''
    }

    return value.toFixed(2).replace('.', ',')
  }

  /**
   * Handle currency input masking
   * @param event - The input event
   * @returns Object with formatted display value and numeric value
   */
  const handleCurrencyInput = (event: Event): { display: string; value: number } => {
    const target = event.target as HTMLInputElement
    let input = target.value

    // Remove everything except digits
    const digits = input.replace(/\D/g, '')

    if (digits === '') {
      return { display: '', value: 0 }
    }

    // Convert to number (considering last 2 digits as cents)
    const numericValue = parseInt(digits) / 100

    // Format for display
    const display = `R$ ${numericValue.toFixed(2).replace('.', ',')}`

    return { display, value: numericValue }
  }

  return {
    formatCurrency,
    parseCurrency,
    formatInput,
    handleCurrencyInput
  }
}
