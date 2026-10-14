# Decisões do agente

Formato: `data · contexto · opções · escolha · por quê · como reverter`.

---

**D1** · 06/10/2026 · Onde ficam `docs/agente/` · (a) nos dois repos, (b) só no ERP · **só no ERP** ·
o app novo e quase todas as telas vivem aqui; as verificações de backend citam `verly-service` por caminho ·
mover a pasta.

**D2** · 06/10/2026 · O pacote `design/` entra no repo? · (a) commitar, (b) não · **não** · `design/telas/` e os
prints têm nomes e valores reais de clientes (regra 6) · se o dono quiser, commitar só README e handoffs.

**D3** · 06/10/2026 · `classification` e `bridge` da conciliação · (a) seguir o design ("de quem é" +
"de qual pedido"), (b) seguir o código · **código** · `classification` é conta de despesa de saída e `bridge`
cria lançamento PENDING sem pedido (PLANO §3.2-3.3). "Confirmar recebimento" = `bridge` + `post`; "de qual
pedido" vira PR aditivo no backend com UI atrás de flag · n/a (é leitura do contrato).

**D4** · 06/10/2026 · Abas da fila (A responder / Aguardando / Adiados) × filas do backend · (a) renomear
filas, (b) mapear na UI · **mapear** · backend não muda. A responder = `REPLY_NOW`; demais filas
(`QUOTE_NOW`, `COMPLETE_MEASURES`, `QUOTE_REGISTERED`, `CONFIRM_PURCHASE`, `REVIEW_DATA`) viram filtros com
texto do dono ("Pronto para orçar", "Sem medida", "Orçamento enviado", "Confirmar compra", "Revisar dados").
Aguardando e Adiados ficam atrás de flag: não há direção da última mensagem nem `snooze_until` · trocar o
mapa em um arquivo (`lib/leadQueues.ts`, fase 4).

**D5** · 06/10/2026 · Visita técnica · (a) tabela de agenda nova, (b) reaproveitar
`measurement_status/measurement_date` · **reaproveitar** para visita; agenda nova só para instalação ·
critério "reaproveitar vence criar" · criar a agenda geral e migrar.

**D6** (REVOGADA por D9, 14/10) · 06/10/2026 · App Framework7 · (a) repo novo, (b) `apps/mobile/` no ERP importando `src/services` ·
**(b)** · reuso direto de `api.ts`, services e store de auth sem publicar pacote · extrair para pacote depois.

**D7** · 06/10/2026 · 401 × 403 · (a) só no front, (b) front + entry point 401 no service · **os dois, PRs
separados** · o vencido já é 401 no service; o 403 sem token é o que sobra. Front também desloga em 403 com
`exp` vencido para não depender do deploy do service (Pi pode estar sem runner) · reverter cada PR.

**D8** · 06/10/2026 · Dinheiro no front · (a) `toFixed` em float, (b) centavos inteiros HALF_UP · **(b)** · o
backend é `DoubleRounder` HALF_UP; float puro dá 1.113,25 no caso de referência · n/a.

**D9** · 14/10/2026 · Framework do app no celular · (a) Framework7 (`framework7-vue`), (b) o próprio ERP
(Vue + Tailwind + shadcn-vue) com casca mobile e PWA · **(b)**, decidido pelo Matheus · o F7 deixou o
design misturado (iOS + Material) e daria duas identidades para o mesmo dono; o ERP já é PWA. **Revoga D6**:
sem `apps/mobile/`, sem origem nova no CORS · voltar a D6 e criar `apps/mobile/` com `framework7-vue`.
