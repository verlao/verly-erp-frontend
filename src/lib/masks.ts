/**
 * Utilitários para máscaras de formatação
 */

/**
 * Aplica máscara de CPF (000.000.000-00)
 */
export function maskCpf(value: string): string {
  if (!value) return ''
  
  // Remove tudo que não é dígito
  const digits = value.replace(/\D/g, '')
  
  // Aplica a máscara
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')
}

/**
 * Remove máscara do CPF
 */
export function unmaskCpf(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Valida CPF
 */
export function validateCpf(cpf: string): boolean {
  const digits = unmaskCpf(cpf)
  
  if (digits.length !== 11) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(digits)) return false
  
  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i)
  }
  let remainder = sum % 11
  let digit1 = remainder < 2 ? 0 : 11 - remainder
  
  if (parseInt(digits[9]) !== digit1) return false
  
  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i)
  }
  remainder = sum % 11
  let digit2 = remainder < 2 ? 0 : 11 - remainder
  
  return parseInt(digits[10]) === digit2
}

/**
 * Aplica máscara de telefone
 * Formato: (00) 0000-0000 ou (00) 00000-0000
 */
export function maskPhone(value: string): string {
  if (!value) return ''
  
  // Remove tudo que não é dígito
  const digits = value.replace(/\D/g, '')
  
  // Aplica a máscara baseada no tamanho
  if (digits.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  } else {
    // Celular: (00) 00000-0000
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }
}

/**
 * Remove máscara do telefone
 */
export function unmaskPhone(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Valida telefone (10 ou 11 dígitos)
 */
export function validatePhone(phone: string): boolean {
  const digits = unmaskPhone(phone)
  return digits.length === 10 || digits.length === 11
}

/**
 * Aplica máscara de CEP (00000-000)
 */
export function maskCep(value: string): string {
  if (!value) return ''
  
  // Remove tudo que não é dígito
  const digits = value.replace(/\D/g, '')
  
  // Aplica a máscara
  return digits
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1')
}

/**
 * Remove máscara do CEP
 */
export function unmaskCep(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Valida CEP (8 dígitos)
 */
export function validateCep(cep: string): boolean {
  const digits = unmaskCep(cep)
  return digits.length === 8
}