// Converte um erro de requisição em texto seguro para a tela.
// NUNCA lê response.data.message: a mensagem do backend não é para o usuário.
export function friendlyError(err: unknown, fallback: string): string {
  const e = err as { response?: { status?: unknown } | null } | null | undefined
  const response = e?.response
  if (!response) return 'Sem conexão. Confira a internet e tente de novo.'

  const status = typeof response.status === 'number' ? response.status : 0
  if (status === 401) return 'Sua sessão acabou. Entre de novo.'
  if (status === 403) return 'Você não tem permissão para fazer isso.'
  if (status === 404) return 'Não encontramos isso. Pode ter sido apagado.'
  if (status >= 500) return 'O sistema falhou. Tente de novo em instantes.'
  return fallback
}
