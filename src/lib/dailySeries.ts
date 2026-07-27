import type { DailyFlowDTO } from '../services/ledger'

/**
 * Preenche os dias sem movimento com zeros entre startDate e endDate (YYYY-MM-DD).
 * Datas construídas LOCALMENTE (new Date(y, m-1, d)) — parse de string ISO usa UTC
 * e desloca um dia em UTC-3. Cap de segurança em ~370 dias.
 */
export function fillMissingDays(
  points: DailyFlowDTO[],
  startDate: string,
  endDate: string
): DailyFlowDTO[] {
  const byDate = new Map(points.map(p => [p.date, p]))
  const out: DailyFlowDTO[] = []

  const [sy, sm, sd] = startDate.split('-').map(Number)
  const [ey, em, ed] = endDate.split('-').map(Number)
  const cursor = new Date(sy, sm - 1, sd)
  const end = new Date(ey, em - 1, ed)

  let guard = 0
  while (cursor.getTime() <= end.getTime() && guard < 370) {
    const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
    out.push(byDate.get(iso) ?? { date: iso, in: 0, out: 0 })
    cursor.setDate(cursor.getDate() + 1)
    guard++
  }
  return out
}

/** Maior fluxo individual da série (mínimo 1 pra evitar divisão por zero). */
export function maxFlow(series: DailyFlowDTO[]): number {
  return Math.max(1, ...series.flatMap(d => [d.in, d.out]))
}
