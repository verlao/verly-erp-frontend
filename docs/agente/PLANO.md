# Plano do agente — redesenho Verly (ERP + app iPhone/iPad)

Descoberta feita em 06/10/2026 sobre `origin/prod` dos dois repos:

| repo | commit lido |
|---|---|
| `verlao/verly-erp-frontend` | `f90c95e` (merge #53, 04/10) |
| `verlao/verly-service` | `0bb0ba9` (merge #93, 18/09) |

Fonte do pedido: `design/AGENT_HANDOFF.md` (pacote `verly-app-design`, 06/10/2026). O pacote de design
**não** entra no repo: `design/telas/` tem nomes e valores reais de clientes.

---

## 1. Stack

### verly-erp-frontend

| item | o que é |
|---|---|
| framework | Vue 3.5 + `<script setup>` + TypeScript 5.8 |
| build | Vite 7 (`vue-tsc -b && vite build`), PWA via `vite-plugin-pwa` (`registerType: 'prompt'`) |
| store | Pinia 3 (`src/stores/auth.ts`, `src/stores/notification.ts`) |
| roteador | vue-router 4 (`src/router/routes.ts`, `src/router/navigation.ts`) |
| UI | Tailwind v4 + primitivos locais em `src/components/ui/` (estilo shadcn-vue), ícones `lucide-vue-next` |
| HTTP | axios, cliente único `src/services/api.ts` (token em `localStorage.token`) |
| testes | Vitest 4 + happy-dom + `@vue/test-utils` (`src/tests/setup.ts`) |
| lint/format | **não há** ESLint nem Prettier configurados; o gate é `vue-tsc -b` |
| deploy | workflow `Deploy to GitHub Pages` no push em `prod` (não mexer) |

Comandos:

```bash
npm ci
npx vue-tsc -b        # typecheck (faz parte do npm run build)
npm run build
npm run test:run      # vitest run
npm run dev           # http://localhost:5173, API em VITE_API_URL ou localhost:8080/verly-service
```

### verly-service

| item | o que é |
|---|---|
| framework | Spring Boot 3.2.5, Java 21, Maven |
| camadas | `application/{controller,service,repository,entity,dto,enums,exception,security,events}` |
| banco | Postgres + Flyway (`src/main/resources/db/migration`, último `V2_50__ledger_confirmed_at.sql`) |
| auth | JWT HMAC512 próprio (`security/filter/JWTValidationFilter.java`), `POST /login-v2` |
| format | Spotless + google-java-format 1.17 AOSP, **aplicado automaticamente** na fase `validate` |
| cobertura | JaCoCo |
| testes | JUnit 5 / Spring Boot Test; `mvn test` roda com H2/Testcontainers conforme o teste |
| deploy | `CI/CD Pipeline`, build da imagem no runner self-hosted `orangepi-backend` (não mexer) |

Comandos:

```bash
mvn -B test           # 597 testes na linha de base
mvn -B spotless:apply # formatação (também roda sozinho no validate)
```

## 2. Padrões encontrados no ERP

- **Services** em `src/services/<domínio>.ts`: objeto `xxxService` com métodos `async` que chamam `api`
  e devolvem `response.data`; tipos DTO no mesmo arquivo. Teste do service ao lado (`lead.test.ts`).
- **`api.ts`**: interceptor de request põe `Authorization: Bearer`; interceptor de response desloga
  **só em 401** (`src/services/api.ts:32-39`).
- **`stores/auth.ts`**: login em `/login-v2`; `isAuthenticated` já usa `isTokenExpired` (`src/lib/jwt.ts`);
  `initializeAuth()` desloga token vencido no boot.
- **Lógica pura** em `src/lib/*.ts` com teste `*.test.ts` ao lado (leadStatus, leadFreshness, dailySeries…).
  Composables em `src/composables/`.
- **Erros**: 28 lugares fazem `error.response?.data?.message || 'texto próprio'` — ou seja, mostram o
  `message` do backend quando existe (que pode ser stack trace, ver §3.9).
- **Dinheiro**: `useCurrency().formatCurrency` monta `R$` com `toFixed(2)` (float, sem `Intl`).
- **Commits**: frase em inglês no imperativo ("Bind ledger reads to…") ou `fix(escopo): …`; PR por branch
  `fix/…` / `feat/…`, merge commit.

## 3. Verificações no código (seção 2.2 do handoff)

Caminhos do backend relativos a `src/main/java/com/verly/verlyservice/application/`.

1. **Estados da conciliação** — `enums/PixReconciliationState.java:12-37`: `UNMEASURED`, `NEEDS_REVIEW`,
   `READY`, `BRIDGED`; derivados por SQL a cada leitura. Bloqueios em `enums/PixReconciliationBlock.java`:
   `NONE`, `MISSING_DIRECTION`, `MISSING_AMOUNT`, `MISSING_DIRECTION_AND_AMOUNT`, `DUPLICATE_SUSPECT`.
2. **`POST /pix-reconciliation/{id}/classification`** NÃO é "de quem é": é a correção da **conta de despesa**
   de uma **saída** (`service/PixReconciliationService.java:131-183`, `dto/OverridePixClassificationDTO.java`).
   Recusa entrada (`:144-151`) e comprovante já lançado (`:135-141`). Não cria nem posta lançamento.
3. **`POST /pix-reconciliation/{id}/bridge`** cria o lançamento **PENDING** a partir do comprovante e grava
   o vínculo; idempotente; **não posta** (`service/PixReconciliationService.java:195-277`). Corpo:
   `createdBy`, `acknowledgeDuplicate`, `note` (`dto/BridgePixReceiptDTO.java`). **Não aceita pedido**: chama
   `recordPixProof` com `leadId = null` (`:230-243`). 409 = comprovante não medido ou duplicata não reconhecida
   (`controller/PixReconciliationController.java:96-111`). Postar = `POST /ledgers/{id}/post` (já usado no ERP).
4. **Nenhum endpoint de "não é pagamento"** para comprovante ainda não lançado: só existe `cancel`/`reverse`
   de lançamento (`controller/LedgerController.java:222,236`).
5. **Filas de `GET /leads/queues`** — `enums/LeadQueue.java:9-20`, exclusivas, primeira que casa vence:
   `CONFIRM_PURCHASE`, `QUOTE_REGISTERED`, `REPLY_NOW`, `QUOTE_NOW`, `COMPLETE_MEASURES`, `REVIEW_DATA`.
   Ordem dentro da fila: maior espera, depois valor (`controller/LeadController.java:187-201`).
6. **`/products/calculate`** — `controller/ProductController.java:74-90` devolve o próprio `ProductDTO` com
   `cost`, `price`, `profit`, `laborValue`, `accessory`, `gainValue` (margem %), `measure` (m²), `priceOptions`
   (`cashMoney`, `cashCard`, `installments4x…12x`) e `priceUnavailableReason` (`dto/ProductDTO.java`). Vidro
   **não** vem separado, mas sai da conta: `vidro = cost − laborValue − accessory`
   (`service/ProductCalculationService.java:172-176`). Campos são `Double`.
7. **`/api/accessory-costs`** — `controller/AccessoryCostController.java:29-180` devolve a **entidade**
   (`entity/AccessoryCostEntity.java`): `id, type, sheets, width?, height?, accessoryValue (BigDecimal),
   active, description, createdDate, updatedDate, createdBy, updatedBy`. **Não há seed** de acessórios
   nas migrações nem em `insert_test_data.sql` → **R$ 267,00 da PORTA 2 folhas NÃO VERIFICADO** (precisa de
   GET autenticado; não há token de leitura no ambiente).
8. **`/leads/{id}/measurement`** NÃO é medida: é o **estado da visita técnica** (`PATCH`, corpo
   `{status: NONE|NEEDED|SCHEDULED|DONE, date?}`) — `controller/LeadController.java:125-137`,
   `enums/MeasurementStatus.java`, colunas `measurement_status`/`measurement_date` em `entity/LeadEntity.java:92-96`.
   As medidas ficam **por item**: `width_cm`/`height_cm` em `entity/LeadItemEntity.java:42-46` (várias peças).
9. **Arredondamento** — preço é `double` com `org.decimal4j.util.DoubleRounder.round(x, 2)` (HALF_UP) em
   `service/ProductCalculationService.java:172-178`. Medido localmente com o jar do repo: 150×210 incolor →
   custo 856,35, preço **1.113,26**; verde 180 → **1.240,20** (bate com o design).
10. **Taxa do cartão** — entra só em `priceOptions`: `cashCard = preço / (1 − taxaDébito/100)`,
    parcelas `preço / (1 − taxaN/100)` (`service/ProductCalculationService.java:800-816`). Não altera `price`.
    A suposição do design ("preço ÷ (1 − taxa)") está certa.
11. **Ledger × pedido** — `ledger.order_id` e `customer_id` existem (`entity/LedgerEntity.java:65-69`);
    `POST /ledgers/payment` aceita `orderId` (`dto/RecordPaymentDTO.java:19`), mas `POST /ledgers/expense`
    **não** (`dto/RecordExpenseDTO.java`) e o bridge também não.
12. **401 × 403** — sem token: Spring Security sem entry point → **403** (`security/config/WebSecurityConfig.java:41-66`).
    Token **vencido ou inválido: já responde 401** com JSON (`security/filter/JWTValidationFilter.java:58-69`).
    Validade do token: 25 h (`constant/Constants.java:8`, `TOKEN_EXPIRATION = 90000000L`).
13. **Stack trace no corpo** — `exception/GlobalExceptionHandler.java:318-358`: `RuntimeException` e `Exception`
    põem `printStackTrace` em `message` (500).
14. **SSE** — `GET /dashboard/stream` só emite se `verly.events.enabled` (`EVENTS_ENABLED`, padrão **false**,
    `src/main/resources/application.yml:130-132`). Eventos `lead.created`, `pix.recorded`, `pix.posted`,
    `customer.created` (`events/BotEventStreamListener.java:43-61`), heartbeat 25 s.
15. **Bot × auth** — o bot sempre manda token e re-loga em 401 (`verly-whatsapp-bot/src/verly_whatsapp_bot/verly_client.py:85-90`).
    Trocar o 403-sem-token por 401 não o afeta.
16. **Código morto do ERP** — `services/kit-cost.ts` e `services/product-cost.ts` não têm importador; já existe
    `services/accessory-cost.ts` (só o `PATCH inline`, usado em `views/Products.vue`).

## 4. Linha de base (06/10/2026, worktree limpo de `origin/prod`)

| repo | comando | resultado |
|---|---|---|
| ERP | `npm ci` | ok |
| ERP | `vue-tsc -b` | ok, 0 erros |
| ERP | `vite build` | ok (PWA 64 entradas) |
| ERP | `vitest run` | **25 arquivos, 167 testes, todos passando** |
| service | `mvn -B test` | **597 testes, 0 falhas, 0 erros** (os `ERROR` no log são de testes negativos) |

## 5. Plano das fases, ajustado ao código

Cada item é um PR contra `prod`. Nada é mergeado nem deployado pelo agente.

**Fase 0 — Fundamentos**
- 0.1 Sessão: *(service)* `authenticationEntryPoint` = 401 para requisição sem token (o vencido já é 401).
  *(ERP)* interceptor desloga em 401 **e** em 403 quando o token local está vencido (`isTokenExpired`);
  `lead.ts` faz `PATCH /status` por `fetch` cru e passa a tratar o mesmo caso.
- 0.2 Erros: *(ERP)* `lib/errors.ts` com `friendlyError(err, fallback)` que **nunca** lê `message`; trocar os 28
  usos. *(service)* `RuntimeException`/`Exception` param de pôr stack trace no `message` (texto genérico +
  `errorId`; o stack continua no log). Status e chaves do JSON não mudam.
- 0.3 Código morto: apagar `kit-cost.ts` (o substituto `accessory-cost.ts` já existe; ganha `list`) e
  `product-cost.ts`; remover `glass-cost.ts` `getById/update/delete/getPriceByColor` e `lead.ts` `update/delete`
  depois de conferir chamadores.
- 0.4 Utilitários: `lib/money.ts` (centavos inteiros, HALF_UP, `Intl` pt-BR, teste 856,35 × 1,30 = 1.113,26),
  `lib/deferredAction.ts` (commit adiado com desfazer), `lib/sse.ts` (fetch + ReadableStream + JWT, reconexão,
  heartbeat), `lib/flags.ts` (flags por `VITE_FLAG_*`, desligadas por padrão).

**Fase 1 — Conciliação de Pix (ERP)**
- `services/pix-reconciliation.ts`; fila única "Para confirmar" = `NEEDS_REVIEW` + `READY` + `BRIDGED` com
  `ledgerStatus = PENDING`.
- "Confirmar recebimento" = `bridge` (se ainda não lançado) + `POST /ledgers/{id}/post`, com commit adiado.
- "De qual pedido": **backend aditivo** (`orderId` opcional no bridge, `ledger.order_id` já existe) → UI atrás
  de flag até mergear.
- "Não é pagamento": lançado → `cancel` do lançamento PENDING; não lançado → **sem endpoint** → backend
  aditivo (migração + endpoint) e UI atrás de flag.
- Classificação de saída (`classification`) aparece como "Tipo de despesa", não como "de quem é".

**Fase 2 a 6** seguem o handoff, com estas correções do que o código mostrou:
- Despesa ligada a pedido: `orderId` opcional em `RecordExpenseDTO` (aditivo, coluna já existe).
- Visita técnica: **reaproveitar** `measurement_status/measurement_date` antes de criar agenda nova; a migração
  da fase 4 cobre só instalação, `snooze_until` e `lost_reason`.
- Medição por peça: usa `lead_item.width_cm/height_cm` que já existem.
- "Como fica o preço": dá para mostrar vidro/mão de obra/acessório/margem hoje (§3.6); PR aditivo só para
  `glassValue`/`colorPrice` explícitos.
- Fila: abas do design mapeadas para filas do backend (ver `DECISOES.md`).
- SSE: ligado só por flag e só depois de confirmar `EVENTS_ENABLED=true` no ambiente.
- App Framework7: `framework7-vue` (o ERP é Vue), no **mesmo repo** em `apps/mobile/` reaproveitando `src/services`.
