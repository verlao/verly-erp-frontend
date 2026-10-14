import { isTokenExpired } from './jwt'

/**
 * Decide se uma resposta HTTP deve deslogar o usuário.
 * - 401: sempre.
 * - 403: só quando o token local já está vencido (um 403 com token válido é
 *   falta de permissão, não sessão expirada).
 */
export function shouldLogout(status: number | undefined, token: string | null): boolean {
  if (status === 401) return true
  if (status === 403) return !!token && isTokenExpired(token)
  return false
}

/** Limpa a sessão local e volta para a tela de login. */
export function forceLogout(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/'
}
