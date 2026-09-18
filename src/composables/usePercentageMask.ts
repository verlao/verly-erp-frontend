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
   * Parse a percentage string to number, preservando a diferença entre
   * "vazio", "inválido" e "zero" — a MESMA semântica do `parseCurrency`.
   * Colapsar tudo em 0 aqui era o mesmo furo do parser de moeda, mas pelo ramo
   * percentual: `EditableValue` roteia `type="number"` e sufixo `%` para cá, e
   * quem consome esse valor escreve uma REGRA COMPARTILHADA — o campo
   * "Ganho %" chama `gainService.updateInline`, que zera a margem de TODOS os
   * produtos com o mesmo tipo/cor/folhas. Com 0 no lugar de vazio/inválido, a
   * guarda de "Campo obrigatório" do `EditableValue` nunca era alcançada e um
   * blur distraído com o campo apagado zerava margem em massa, silenciosamente.
   * @param input - The percentage string (e.g., "30%" or "30")
   * @returns `null` se o campo estiver vazio, `NaN` se o conteúdo não for um
   * número válido, ou o número (podendo ser 0) se o valor for válido.
   */
  const parsePercentage = (input: string): number | null => {
    if (typeof input !== 'string' || input.trim() === '') {
      return null
    }

    // Remove % and spaces
    const cleaned = input.replace(/%/g, '').replace(/\s/g, '').replace(',', '.')

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

