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
   * Parse a currency string to number, preserving the difference between
   * "vazio", "inválido" e "zero" — quem chama decide o que fazer com cada
   * caso (ex: bloquear persistência). Isto é proposital: colapsar tudo em 0
   * antes da validação foi a causa raiz de orçamentos salvos com termos
   * zerados por um blur com campo vazio ou com lixo digitado.
   * @param input - The currency string (e.g., "R$ 1.234,56" or "1234,56")
   * @returns `null` se o campo estiver vazio, `NaN` se o conteúdo não for um
   * número válido, ou o número (podendo ser 0) se o valor for válido.
   */
  const parseCurrency = (input: string): number | null => {
    if (typeof input !== 'string' || input.trim() === '') {
      return null
    }

    // Remove R$, spaces, and dots (thousand separators)
    let cleaned = input.replace(/R\$/g, '').replace(/\s/g, '').replace(/\./g, '')

    // Replace comma with dot for decimal separator
    cleaned = cleaned.replace(',', '.')

    if (cleaned === '') {
      return null
    }

    // NaN aqui é proposital: sinaliza "inválido" pra quem consome, em vez de
    // ser reescrito para 0 como antes.
    return parseFloat(cleaned)
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
