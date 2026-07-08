// Utilitários de JWT no client — apenas leitura do payload (sem verificar
// assinatura, que é responsabilidade do backend). Usado pra decidir logout
// quando o token expira, sem esperar a próxima chamada de API dar 401.

interface JwtPayload {
  exp?: number // segundos desde epoch (padrão JWT)
  [key: string]: unknown
}

/** Decodifica o payload de um JWT (base64url). Retorna null se malformado. */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const pad = base64.length % 4 ? '='.repeat(4 - (base64.length % 4)) : ''
    return JSON.parse(atob(base64 + pad)) as JwtPayload
  } catch {
    return null
  }
}

/**
 * True se o token está expirado ou é inválido/malformado.
 * Um token sem `exp` é tratado como não-expirado (não força logout à toa).
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload) return true
  if (typeof payload.exp !== 'number') return false
  return payload.exp * 1000 <= Date.now()
}
