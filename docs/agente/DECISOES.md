# Decisões do agente

Formato: `data · contexto · opções · escolha · por quê · como reverter`.

**D15** · 15/10/2026 · Direção visual G1 · **opção A (fila em destaque) aprovada pelo Matheus**:
após abrir a prévia em A, respondeu “lindo, pode implementar”. A referência é a reconstrução local
`design-review-g1-2026-10-14/prototype-g1.html`, preservada no commit `66ef0ba` da branch descartável
`prototype/g1-visual-review`, não o canvas Claude (inacessível nesta sessão). Mantém a paleta e as fontes
descritas no handoff. Libera os fundamentos F10 e o redesenho U0; **G2 do fluxo Pix continua pendente**.
Tokens e novos componentes são aditivos; telas existentes serão migradas por fluxo após G2, sem flags.
Para reverter a direção, o Matheus escolhe outra proposta antes da integração das telas.

---

**D1** · 06/10/2026 · Onde ficam `docs/agente/` · (a) nos dois repos, (b) só no ERP · **só no ERP** ·
o app novo e quase todas as telas vivem aqui; as verificações de backend citam `verly-service` por caminho ·
mover a pasta.

**D2** · 06/10/2026 · O pacote `design/` entra no repo? · (a) commitar, (b) não · **não** · `design/telas/` e os
prints têm nomes e valores reais de clientes (regra 6) · se o dono quiser, commitar só README e handoffs.

**D3** · 06/10/2026 · `classification` e `bridge` da conciliação · (a) seguir o design ("de quem é" +
"de qual pedido"), (b) seguir o código · **código** · `classification` é conta de despesa de saída e `bridge`
cria lançamento PENDING sem pedido (PLANO §3.2-3.3). "Confirmar recebimento" = `bridge` + `post`; "de qual
pedido" vira PR aditivo no backend; pela D11, PR de UI só depois do endpoint mergeado e comprovadamente
no ar (a proposta original de flag foi revogada) · n/a (é leitura do contrato).

**D4** · 06/10/2026 · Abas da fila (A responder / Aguardando / Adiados) × filas do backend · (a) renomear
filas, (b) mapear na UI · **mapear** · backend não muda. A responder = `REPLY_NOW`; demais filas
(`QUOTE_NOW`, `COMPLETE_MEASURES`, `QUOTE_REGISTERED`, `CONFIRM_PURCHASE`, `REVIEW_DATA`) viram filtros com
texto do dono ("Pronto para orçar", "Sem medida", "Orçamento enviado", "Confirmar compra", "Revisar dados").
Na descoberta de 06/10, Aguardando e Adiados foram propostos atrás de flag por falta de direção da última
mensagem e de `snooze_until`. D11 substitui essa proposta por sequência: só abrir PR da UI após os endpoints
necessários mergeados e comprovadamente no ar · trocar o mapa em um arquivo (`lib/leadQueues.ts`, fase 4).

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

**D10** · 14/10/2026 · Erros do backend · (a) erro 500 genérico sem stack trace no service, (b) proteção só
no front · **(b)**, decidido pelo Matheus: service #98 fechado **sem merge**; backend fica como está e o
trabalho de erro genérico não deve ser reproposto. `friendlyError` (`src/lib/errors.ts`) nunca lê
`message`; usa o fallback da tela, inclusive em 400/409 · reabrir apenas por nova decisão do Matheus.

**D11** · 14/10/2026 · Dependência entre API e UI · (a) flags de build `VITE_FLAG_*`, (b) sequência ·
**(b)**, decidido pelo Matheus: ERP #56 fechado **sem merge**, sem flags. PR da UI que depende de endpoint
novo só abre depois do endpoint **mergeado e comprovadamente no ar**. Migração também deve estar no ar
antes do PR do consumidor; merge e pipeline em andamento não provam implantação · reabrir apenas por
nova decisão do Matheus.

**D12** · 14/10/2026 · Destino opcional do bridge Pix (B4b) · (a) sobrescrever vínculo de lançamento
reutilizado, (b) preencher apenas destino ausente em PENDING · **(b)** · evita atribuir a um pedido um
Pix já confirmado sem o correspondente abatimento. Pedido/cliente efetivos devem corresponder quando o
pedido existe; conflito retorna 409. Não inferir cliente novo nem mudar o caminho do bot. IDs inexistentes
continuam aceitos como em payment/expense (#102), sem abatimento quando o pedido não existe; a UI deve
selecionar IDs válidos · alterar apenas o novo contrato em PR posterior, preservando os vínculos existentes.

**D13** · 14/10/2026 · Adiamento e perda (B8) · (a) esconder de todas as listas, (b) suspender só as filas
operacionais · **(b)** · preserva os contadores/listagens existentes e permite reaparecer quando o prazo
vence, no fuso de São Paulo, sem job. Perda mantém LOST/deletedAt do contrato existente, limpa adiamento
e aceita os motivos da V2_52. Campos no DTO são só de resposta para a ingestão não apagar decisão humana ·
reverter o novo endpoint e o filtro das filas, sem apagar as colunas.

**D14** · 14/10/2026 · Remover instalação da agenda (B9) · (a) apagar registro, (b) cancelar mantendo
histórico · **(b), padrão reversível** · DELETE marca CANCELLED; PUT pode corrigir ou voltar a SCHEDULED.
Status ausente no PUT preserva o atual; campos opcionais nulos são limpos. Datas são locais de São Paulo,
inclusive passado para corrigir histórico. Pedido precisa existir e corresponder ao cliente convertido do
lead quando esse vínculo é conhecido; visita técnica continua em measurement_status (D5) · mudar o novo
contrato após decisão do dono, sem remoção de registros como efeito implícito.
