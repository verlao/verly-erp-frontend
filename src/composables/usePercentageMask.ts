/**
 * Composable for percentage formatting and parsing
 */
export function usePercentageMask() {
  /**
   * Format a number value to percentage string
   * @param value - The numeric value to format
   * @returns Formatted percentage string (e.g., "30%")
   */
  const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0%'
    }
    return `${value}%`
  }

  /**
   * Parse a percentage string to number
   * @param input - The percentage string (e.g., "30%" or "30")
   * @returns Numeric value
   */
  const parsePercentage = (input: string): number => {
    if (!input || typeof input !== 'string') {
      return 0
    }

    // Remove % and spaces
    const cleaned = input.replace(/%/g, '').replace(/\s/g, '').replace(',', '.')
    
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  /**
   * Format input value for display during typing
   * @param value - The numeric value
   * @returns Formatted string for input display (without %)
   */
  const formatInput = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return ''
    }
    return String(value)
  }

  return {
    formatPercentage,
    parsePercentage,
    formatInput
  }
}

