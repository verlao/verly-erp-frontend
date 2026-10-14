// Feature flags de build. Cada flag lê `VITE_FLAG_<NOME>` no momento da chamada
// e só liga com o valor exato 'true'. Ausente ou qualquer outro valor = desligada.
// Para ligar numa build, defina a variável no .env correspondente (ver .env.example).

export type FlagName =
  | 'PIX_ORDER_LINK'
  | 'PIX_DISMISS'
  | 'LIVE_EVENTS'
  | 'LEAD_SNOOZE'
  | 'LEAD_LOST_REASON'
  | 'INSTALLATION_SCHEDULE'
  | 'MOBILE_SHELL'

/** True se a flag `name` estiver ligada no ambiente de build (padrão: desligada). */
export function isEnabled(name: FlagName): boolean {
  return import.meta.env['VITE_FLAG_' + name] === 'true'
}
