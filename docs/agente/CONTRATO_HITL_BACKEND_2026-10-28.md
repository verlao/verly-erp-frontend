# Contrato de backend HITL — C01-S

28/10/2026 · orquestrador noturno · base service `origin/prod` `1dbd003` (servindo `b65f56a`, ver §0) · bot `origin/dev` `7cf350c` (só leitura).
Status: **proposto pelo orquestrador; revisão do Guia na §10**. Rege S01, S02, M01, S03, S04, S05, M02, S06, S07.
Não reabre D9–D15. Nomes de rotas abaixo são finais para esta frente; nada aqui afirma que já existem.

## 0. Fatos verificados antes do contrato

- `prod` do service está **vermelho desde 25/10**: #113 adicionou `V2_54__whatsapp_bot_portfolio_photos.sql` ao lado de
  `V2_54__whatsapp_bot_stage_jobs.sql` (#112). Flyway: "Found more than one migration with version 2.54"; run 40162648807
  falhou em testes, imagem e deploy pulados. **Servindo: `b65f56a`** (run 40162613381, deploy 25/10 04:43:35Z). Runner
  `orangepi-backend` online. Correção pertence à frente de fotos (não tocada aqui); a natural é renomear a de fotos para
  `V2_55` (a de stage_jobs já foi aplicada em prod como 2.54). **Esta frente reserva `V2_56` (M01) e `V2_57` (reserva para
  correção de coluna de quote, §6.3).** Gates locais rodam com renomeação temporária não commitada (§9).
- Tabelas do bot (`whatsapp_bot.*`) não têm DDL neste repo; o service as lê por SQL cru, e os testes criam stubs.
  DDL real (bot `migrations/V001`, `V009`): `contacts(phone_e164 PK, pushname_first_seen, pushname_current,
  verly_customer_id BIGINT, name_status, …)`, `media(id, raw_message_id, media_kind, mime_type, sha256, bytes BYTEA)`,
  `pix_comprovantes(id, raw_message_id, media_id → media, extraction JSONB, amount, entry_date, direction, …)`.
  Chaves de `extraction` usadas pelo bot: `payer_name`, `payer_doc`, `payee_name`, `payee_key`, `payee_cnpj`, `txid`,
  `amount`, `date`, `is_pix_receipt`.
- Autorização: tudo autenticado por JWT; não há papéis por rota fora de `/users`. Novas rotas seguem o padrão
  (autenticado, sem `@PreAuthorize`), exceto onde dito.
- Erros atuais devolvem `{"message": e.getMessage()}`. D10: a UI nunca lê `message`. **Rotas novas devolvem erro
  estruturado `{"code": "<ENUM>"}`** (sem `message`, sem stack), com o status HTTP abaixo. Não mexer nos handlers antigos.
- `QuoteDTO` não tem `leadId` nem `discount`. `PUT /quotes/{id}` (QuoteController.dtoToEntity + QuoteService.edit) anula
  `leadId`, `discount` e `createdDate`, e em quote de `from-lead` (`products.lineItems`) chama `Long.parseLong("lineItems")`.
- `quote.products` e `quote.observations` são `varchar(255)` no baseline. Um `from-lead` com várias peças pode exceder.
  **Não comprovado ainda**; S05 prova ou descarta com teste em Postgres real antes de qualquer outra mudança (§6.3).
- Nenhuma referência a `verly_customer_id` no service. O casamento por sufixo (`LeadService.resolveCustomerId`,
  `CustomerRepository.findByPhoneSuffix`) escolhe `get(0)` sem ordem; **não é reaproveitado** como decisão.

## 1. Decisões obrigatórias de C01 (MAPA, Onda 0)

1. **`LeadDTO.data` é string JSON.** Contrato novo (S01) devolve a forma interpretada pelo servidor (`signals`,
   `transcript`) com `null` quando inválida/ausente; `LeadDTO.data` permanece string, intocado. A UI de F01/F02 já faz parse
   defensivo e continua fazendo para registros servidos por versões antigas.
2. **`POST /quotes/from-lead` grava `customerId=null`.** Mantido. Estado do browser não muda isso. O vínculo com cliente
   existente passa a ser lido na conversão em pedido via vínculo humano ativo (S04-Q, §5).
3. **`convertedCustomerId` mantém semântica legada** (conversão com cadastro, arquiva, backfill). O vínculo humano com
   cliente existente vive em tabela própria (M01) e **não** muda status, `deletedAt` nem `convertedCustomerId`.
4. **Revisão/concorrência.** Mecanismo: `reviewToken` = SHA-256 hex minúsculo de UTF-8 da **serialização canônica**
   (fechada na revisão G03/G04):
   - JSON sem espaços, chaves nesta ordem fixa: `leadId`, `sourceExtractionId`, `lastActivityDate`,
     `extractionConfirmedAt`, `convertedCustomerId`, `activeLinkCustomerId`, `dataSha256`, `items`.
   - Nulos são explícitos (`null`), nunca omitidos. Datas `LocalDateTime` em ISO-8601 sem fuso e sem fração
     (`2026-10-27T14:02:11`). Decimais como string com 2 casas (`"1340.00"`), `BigDecimal.setScale(2, HALF_UP)`.
   - `dataSha256` = SHA-256 hex de `leads.data` exatamente como está (string vazia quando nulo).
   - `items`: ordenados por `id` asc (sem id por último, ordem estável); cada item inclui `id, productType, category,
     pricingBasis, color, areaM2 (4 casas), widthCm, heightCm, sheets, quantity, variantGroup, variantSelected,
     pendingMeasurement, estimatedValue (2 casas), estimatedProfit (2 casas)`. Itens ausentes = `[]`.
   - `activeLinkCustomerId` = vínculo ACTIVE de M01; **se a tabela não existir no ambiente, `null`** (consulta
     protegida por `to_regclass`; `availability` ganha `leadCustomerLink: UNAVAILABLE`) — S01 publica antes de M01
     sem quebrar (G02).
   - Alterar preço/custo extraído ou o conteúdo de `data` **muda** o token (G04). Vetores de teste compartilhados
     entre S01/S03/S04 ficam em `LeadReviewTokenTest` (mesmo input → mesmo hash; item fora de ordem → mesmo hash).
   Exposto por S01 e S03. Escritas humanas novas (S04) aceitam `expectedReviewToken` **opcional**; se presente e diferente
   → `409 {"code":"REVIEW_STALE","currentReviewToken":"…"}`. Ausente → comportamento sem checagem (clientes antigos
   não quebram). Escrita sob `SELECT … FOR UPDATE` da linha do lead. Sem coluna nova de versão.
   **G05 (limite desta noite):** não existe endpoint humano de confirmação de extração no service; `extraction_confirmed_at`
   é gravado pela síntese do bot. S01 é read-only e só expõe o token. A checagem de token na confirmação de extração
   fica explicitamente para o cartão que introduzir essa escrita humana (B02/S06, futuro) — registrado em PERGUNTAS
   nº16; não fingir que está coberto hoje.
5. **Candidato ≠ vínculo.** Consultas de candidatos (S03, S07) são leitura pura. Selecionar candidato não confirma alias,
   não grava chave Pix global, não funde clientes, não autoriza pagamento. Pista do bot (`contacts.verly_customer_id`) é
   evidência `BOT_HINT`, nunca vínculo.
6. **Nomes/payloads/erros** fechados nas seções 2–7.

## 2. S01 — contexto de revisão do lead

`GET /leads/{id}/review-context` → `200 LeadReviewContextDTO` | `404 {"code":"LEAD_NOT_FOUND"}`.

```json
{
  "leadId": 1,
  "reviewToken": "hex64",
  "sourceExtractionId": 991,
  "extractionConfirmedAt": null,
  "lastActivityDate": "2026-10-27T14:02:11",
  "provenance": { "level": "AGGREGATE" },
  "signals": {
    "negotiated": { "value": 1340.00, "quote": "fecho por 1340" },
    "visit": { "date": "2026-11-03", "quote": "pode vir terça" }
  },
  "transcript": [ { "body": "…", "fromMe": false, "at": "2026-10-27T13:58:00" } ],
  "contact": {
    "pushnameCurrent": "Ana Box", "pushnameFirstSeen": "Ana",
    "nameStatus": "valid",
    "botCustomerHint": { "customerId": 7, "customerExists": true }
  },
  "address": { "city": "…", "neighborhood": "…", "street": null, "number": "…", "reference": null,
               "state": null, "cep": null, "latitude": null, "longitude": null,
               "source": "LEAD_RECORD" },
  "availability": { "signals": "AVAILABLE", "transcript": "ABSENT", "contact": "UNAVAILABLE",
                    "address": "AVAILABLE", "botAddress": "UNAVAILABLE" }
}
```

- `availability` por seção: `AVAILABLE` (dado presente), `ABSENT` (fonte existe, sem dado para este lead),
  `UNAVAILABLE` (tabela/view do bot inexistente no ambiente — `to_regclass` nulo — ou erro de leitura isolado).
  Registro legado sem metadado = `ABSENT`, nunca valor fabricado.
- `signals`/`transcript` (fechado na revisão G07): parse de `leads.data` no servidor com allowlist; qualquer forma
  inesperada na raiz → `null` + `ABSENT`; um campo inválido dentro de objeto válido é anulado sem derrubar o resto.
  `signals.negotiated = {value: BRL 2 casas|null, quote: string≤500|null}`; `signals.visit = {date: "YYYY-MM-DD"|null,
  quote: string≤500|null}`. Objeto só existe se ao menos um campo válido; nunca inferir valor de texto.
  `transcript` é `[{body: string≤2000, fromMe: boolean, at: ISO|null}]`, limitado às **últimas 60** mensagens; mensagem
  sem `body` string ou sem `fromMe` boolean é descartada (não inventar `false`). Nada de `raw_payload`.
- `contact`: `whatsapp_bot.contacts` por igualdade de `phone_e164` normalizado com o telefone do lead (dígitos; mesmo
  número completo, nunca sufixo). `botCustomerHint` só se `verly_customer_id` não nulo; `customerExists` confere
  `public.customer`. Não muda nada.
- `address` (corrigido na revisão G01/G08/G09): **não existe `v_address_consolidated`** no bot (`origin/dev`); a fonte
  real é `whatsapp_bot.addresses` (`street, number, neighborhood, city, state, cep, confidence, requires_followup,
  extracted_at`). Sem `reference`/`source`/GPS nessa tabela.
  - Precedência por campo: valores já persistidos em `leads` (`city, neighborhood, number, reference, latitude,
    longitude`) vêm primeiro; `street, state, cep` só podem vir da última linha de `addresses` do contato.
    Nunca sobrescrever campo do lead com extração do bot.
  - `source`: `LEAD_RECORD` (todos os não-nulos vieram do lead), `BOT_EXTRACTED` (todos vieram do bot),
    `MIXED` (os dois), `ABSENT` (nenhum). `reference`/GPS do lead são `LEAD_RECORD`.
  - Join por telefone: só se o telefone do lead tiver 11 dígitos nacionais, ou 13 começando com `55` (aí remove o
    DDI). Fora disso, nenhuma consulta ao bot e `botAddress=ABSENT` — sufixo de número incompleto/internacional não
    casa.
  - `availability.botAddress`: `AVAILABLE` (linha do contato), `ABSENT` (contato sem endereço ou telefone não
    elegível), `UNAVAILABLE` (`to_regclass('whatsapp_bot.addresses')` nulo ou erro de leitura).
  - `availability.address` reflete o objeto combinado: `AVAILABLE` se algum campo não nulo; `ABSENT` se nenhum.
    `UNAVAILABLE` nunca é usado para `address` (o lead existe), só para `botAddress`.
- `availability` (fechado na revisão G06): `AVAILABLE` = ao menos um campo não nulo na seção; `ABSENT` = fonte
  legível, sem dado para este lead (inclui `leads.data` nulo, vazio ou JSON inválido); `UNAVAILABLE` = tabela/view
  do bot inexistente (`to_regclass` nulo) ou erro de leitura isolado. Todo campo não listado como obrigatório é
  anulável; nenhum campo ausente vira `0`, `""`, `"llm"` ou "confirmado".
- `provenance.level` é sempre `AGGREGATE` nesta fase (sem fonte por item — §8).
- Arquivos: novo `LeadReviewContextController` (ou rota no `LeadController` **apenas se** só adicionar o método),
  `LeadReviewContextService`, `LeadReviewContextDTO` (+ records internos), `LeadReviewSql` (util, SQL cru),
  `LeadReviewToken` (util compartilhado com S03/S04). Não editar `LeadService`/`LeadDTO`.

## 3. S02 — evidência e mídia do Pix pré-bridge

`GET /pix-reconciliation/{receiptId}/evidence` → `200 PixReceiptEvidenceDTO` | `404 {"code":"RECEIPT_NOT_FOUND"}`.

```json
{
  "receiptId": 10,
  "extracted": { "isPixReceipt": true, "amount": 380.00, "date": "2026-10-20",
                 "payerName": "Carlos Pagador", "payerDoc": "***.456.789-**", "payeeName": "Loja Exemplo",
                 "payeeKey": "…", "payeeCnpj": "…", "txid": "E…" },
  "conversation": { "phone": "5511900000001", "pushname": "Ana Box", "fromMe": false,
                    "receivedAt": "2026-10-20T10:11:12", "caption": "segue o pix" },
  "media": { "available": true, "mediaKind": "image", "mimeType": "image/jpeg", "sizeBytes": 123456, "sha256": "…" },
  "availability": { "extracted": "AVAILABLE", "conversation": "AVAILABLE", "media": "AVAILABLE" }
}
```

`GET /pix-reconciliation/{receiptId}/media` → bytes com `Content-Type` do registro, `Cache-Control: private, no-store`,
`X-Content-Type-Options: nosniff`, `Content-Disposition: inline` | `404 {"code":"RECEIPT_NOT_FOUND"}` |
`404 {"code":"MEDIA_NOT_AVAILABLE"}` (sem `media_id`, linha ausente ou tabela inexistente) |
`415 {"code":"MEDIA_TYPE_UNSUPPORTED"}` (MIME fora de `image/jpeg`, `image/png`, `image/webp`, `application/pdf`, ou nulo).

- Campos de `extracted` só das chaves listadas em §0, tipados defensivamente (string não vira número; inválido → `null`).
  Cada valor é **extraído por OCR/visão, não confirmado**. `payerDoc` mascarado no servidor (mantém só os 6 dígitos
  centrais de CPF; CNPJ mostra só raiz de 8 dígitos) — padrão conservador; perguntado ao dono (PERGUNTAS nº15).
- `conversation` é do `raw_message` do próprio comprovante: telefone de `remote_jid` (dígitos), `pushname`, `from_me`,
  `received_at`, `body` como legenda (2.000 chars). Nunca `raw_payload` nem outras mensagens.
- Não confundir com `GET /ledgers/{id}/receipt` (anexo do lançamento). Falta de OCR não vira confirmação.
- Arquivos: novo `PixReceiptEvidenceController` (rotas sob `/pix-reconciliation/{id}/…`), `PixReceiptEvidenceService`,
  DTO(s), `PixReceiptEvidenceSql`. Não editar `PixReconciliationService`/`PixReconciliationSql`/`PixReconciliationRowDTO`.

## 4. M01 — vínculo humano lead↔cliente (migração isolada `V2_56`)

```sql
CREATE TABLE public.lead_customer_link (
  id            BIGSERIAL PRIMARY KEY,
  lead_id       BIGINT NOT NULL REFERENCES public.leads(id),
  customer_id   BIGINT NOT NULL REFERENCES public.customer(id),
  status        VARCHAR(16) NOT NULL CHECK (status IN ('ACTIVE','REVOKED')),
  basis         VARCHAR(32) NOT NULL CHECK (basis IN ('HUMAN_SELECTED')),
  review_token  CHAR(64),
  decided_by    VARCHAR(128) NOT NULL,
  decided_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason        VARCHAR(512),
  revoked_by    VARCHAR(128),
  revoked_at    TIMESTAMPTZ,
  revoke_reason VARCHAR(512),
  CONSTRAINT lead_customer_link_revocation_ck CHECK (
    (status = 'ACTIVE'  AND revoked_by IS NULL AND revoked_at IS NULL AND revoke_reason IS NULL) OR
    (status = 'REVOKED' AND revoked_by IS NOT NULL AND revoked_at IS NOT NULL))
);
CREATE UNIQUE INDEX lead_customer_link_one_active_uq ON public.lead_customer_link (lead_id) WHERE status = 'ACTIVE';
CREATE INDEX lead_customer_link_customer_idx ON public.lead_customer_link (customer_id);
```

- Linhas são o histórico/auditoria: revogar preenche `revoked_*`; nunca `DELETE`. Sem backfill, sem alteração em
  `leads`, `customer`, `quote`. Comentários `COMMENT ON` explicando que não substitui `converted_customer_id`.
- Teste no mesmo PR (é o "código de produção SQL"): Flyway real aplica; unique parcial impede 2 ACTIVE; FK rejeita
  lead/cliente inexistente; check rejeita REVOKED sem `revoked_*` e ACTIVE com eles; `basis` inválido rejeitado.
- Nome de arquivo: `V2_56__lead_customer_link.sql`. Sem entidade JPA neste PR (entidade vem em S04, após M01 no ar).

## 5. S03 → S04 → S04-Q — candidatos e vínculo humano (PREPARADOS; dependem de M01 no ar)

**S03** `GET /leads/{id}/customer-candidates` → `200`:
```json
{ "leadId": 1, "reviewToken": "hex64",
  "activeLink": { "customerId": 7, "decidedBy": "…", "decidedAt": "…" },
  "candidates": [ { "customerId": 7, "name": "Ana Exemplo", "phoneOne": "…",
                    "reasons": ["CONVERTED_RECORD","HUMAN_LINK","BOT_HINT","PHONE_EXACT","PHONE_SUFFIX8"],
                    "strength": "STRONG" } ],
  "ambiguous": false }
```
Razões fortes: `CONVERTED_RECORD`, `HUMAN_LINK`, `PHONE_EXACT` (11 últimos dígitos iguais em `phone_one` ou `phone_two`).
`BOT_HINT` é forte só se o cliente existe; fraca caso contrário (não listado). `PHONE_SUFFIX8` é fraca. Nome nunca é
razão. `ambiguous = true` quando há >1 cliente distinto com razão forte. Ordem: força, nº de razões, id. Leitura pura.

**S04** `PUT /leads/{id}/customer-link` body `{customerId, decidedBy, reason?, expectedReviewToken?}` →
`200 {link}` | `404 LEAD_NOT_FOUND|CUSTOMER_NOT_FOUND` | `409 REVIEW_STALE|LEAD_CONVERTED_TO_OTHER_CUSTOMER|LINK_EXISTS_FOR_OTHER_CUSTOMER`.
Mesmo cliente já ativo → `200` idempotente sem nova linha. `DELETE /leads/{id}/customer-link` body
`{revokedBy, reason}` → `200` | `404 LINK_NOT_FOUND`. Efeito do PUT: grava linha ACTIVE; preenche `quote.customer_id`
**somente** nos quotes do lead com `customer_id IS NULL` e status `VALID` (mesma regra de `backfillQuoteCustomer`).
Não toca quote de outro cliente, pedido, ledger postado, `leads.status`, `deleted_at`, `converted_customer_id`.
Lock: `SELECT … FOR UPDATE` no lead. Testes: WON visível sem cadastro, convertido/arquivado, cliente já ligado, dois
candidatos, concorrência (dois PUT simultâneos com clientes diferentes → um 200, um 409).

**S04-Q** (após S05 mergeado): `QuoteService.resolveCustomerId` passa a considerar vínculo ACTIVE depois de
`quote.customerId` e `lead.convertedCustomerId`; `createFromLead` continua gravando `customerId=null` (decisão 2).

## 6. S05 — continuidade de orçamento

1. `GET /leads/{id}/quotes` → `200 QuoteDTO[]` (mais recente primeiro) | `404 {"code":"LEAD_NOT_FOUND"}`.
   Rota em controller novo `LeadQuotesController` para não editar `LeadController`.
2. `QuoteDTO` ganha `leadId` e `discount` (**somente resposta**, `@JsonProperty(access = READ_ONLY)`), e `PUT /quotes/{id}`
   passa a **preservar** `leadId`, `discount`, `createdDate` e `products.lineItems` do registro existente; campos
   ausentes no corpo do PUT não anulam `status`/`expirationDate` (preserva o atual). Quote `lineItems` não passa por
   `Long.parseLong`; edição de valores de `lineItems` não faz parte deste cartão (round-trip preserva).
   Valor final negociado: `finalPriceOverride` já é aplicado só no `from-lead`; S05 não o reinterpreta como frete e
   garante que GET→PUT sem mudança preserva `totalPrice`.
3. Antes de tudo: teste `from-lead` com 3 peças em Postgres real. **Se falhar por `varchar(255)`**, ESCALAR com o
   erro exato; a correção é migração isolada `V2_57__quote_products_text.sql` (`ALTER COLUMN products TYPE text`,
   `observations TYPE varchar(512)`?) em PR próprio — orquestrador decide; S05 não altera esquema.
- Arquivos: `QuoteController` (dtoToEntity/entityToDto), `QuoteService.edit` e `calculateQuotePrices`, `QuoteDTO`,
  novo `LeadQuotesController`, `QuoteRepository` (finder por lead, se faltar). **Não** toca `LeadService`/`LeadController`.

## 7. S07 — candidatos financeiros (PREPARADO; depende de S02 no ar)

`GET /pix-reconciliation/{receiptId}/candidates` → `{receiptId, roles:{sender, payer, payee}, customerCandidates[],
orderCandidates[], partnerCandidates[], conflicts[]}`; razões por papel (`SENDER_PHONE`, `PAYER_DOC`, `PAYER_NAME`(fraca),
`PAYEE_KEY_STORE`, `PARTNER_IDENTIFIER`, `ORDER_OPEN_AMOUNT_MATCH`(fraca), `ORDER_OF_CUSTOMER`). Leitura pura; reutiliza
`PartnerIdentityService.resolve` sem gravar. Pedido de outro cliente aparece como conflito, não candidato. Remetente ≠
pagador. Mesmo valor em vários pedidos → todos listados, `ambiguous`. Transferência própria: só sinaliza
`OWN_ACCOUNT_SUSPECT` (PERGUNTAS nº14 segue aberta; nenhum caminho contábil).

## 8. M02 / S06 — decisão: **M02 dispensada nesta fase; S06 não iniciado**

- Estrutura existente que atende S01–S05/S07: `leads.source_extraction_id` + `extraction_confirmed_at` +
  `lead_original_items` (snapshot da 1ª confirmação) + `leads.data` (sinais/transcrição) + `reviewToken` derivado.
  Revisionamento não exige coluna (decisão 4). Auditoria do vínculo cabe em M01.
- Proveniência **por item/campo** exige o bot enviar `source_extraction_ids` por item (B02) e um lugar para guardá-los
  (`lead_items` não tem coluna). Isso é M02 + S06 + B02, que dependem de desenho conjunto com o bot. Sem bot nesta noite,
  criar a migração agora seria "migração por hábito". Fica registrado: quando B02 for desenhado, M02 provável =
  `lead_items.source_extraction_ids BIGINT[] NULL` + `origin VARCHAR(16) NULL`, aditiva, legado `NULL` = desconhecido.

## 9. Ownership, ordem e gates

| Cartão | Worktree / branch | Arquivos (exclusivos) | Saída esta noite |
|---|---|---|---|
| S01 | `HITL-S01` `feat/hitl-s01-lead-review-context` | §2 + `LeadReviewToken` | PR draft contra prod |
| S02 | `HITL-S02` `feat/hitl-s02-pix-receipt-evidence` | §3 | PR draft contra prod |
| M01 | `HITL-M01` `feat/hitl-m01-lead-customer-link` | `V2_56__lead_customer_link.sql` + teste de migração | PR draft (só migração) |
| S05 | `HITL-S05` `feat/hitl-s05-quote-continuity` | §6 | PR draft contra prod (zero arquivo em comum com S01/S02/M01/S04) |
| S03/S04 | `HITL-S03S04`, base = head de M01 | novos controller/service/entity do vínculo, `LeadReviewToken` lido de S01 (cópia idêntica até S01 mergear) | PREPARADO local |
| S04-Q | depois de S05 no ar | `QuoteService.resolveCustomerId` | não iniciar |
| S07 | depois de S02 no ar | §7 | PREPARADO se sobrar tempo |

S04 foi refatiado em S04 (vínculo, sem `QuoteService`) e S04-Q (conversão em pedido) para que S05 não colida em
arquivo com S04, conforme o mapa de colisões. `LeadReviewToken` é criado por S01; S03/S04 usam a mesma classe a partir
da branch de S01 quando forem publicados.

Gates service: `mvn spotless:apply` (explícito) → `mvn -B -q test` com Postgres16/Flyway reais, **no máximo 3 Maven
simultâneos** (`/private/tmp/verly-mvn-slot.sh`). Enquanto `prod` tiver dois `V2_54`, o script renomeia temporariamente
a migração de fotos para `V2_55` no working tree, roda, e restaura; o arquivo nunca entra em commit. O CI do PR vai
falhar pelo mesmo motivo até a frente de fotos corrigir `prod` — PR fica **draft** enquanto o CI não estiver verde.
Testes obrigatórios por cartão: os casos do aceite do MAPA (legado sem metadado, mídia ausente, MIME inválido,
autorização sem token = 401, conflito, concorrência quando há escrita).

## 10. Revisão do Guia (28/10 01:2x, gpt-6.1-sol, read-only)

Veredito do Guia: **NAO_APTO** com 9 achados. Resolução do orquestrador (padrão conservador, sem reabrir escopo):

| ID | Sev. | Resolução neste contrato |
|---|---|---|
| G01 | ALTA | `v_address_consolidated` **não existe** no bot; trocado por `whatsapp_bot.addresses` (§2). `reference`/`source` deixam de ser atribuídos à view; `source` é derivado (§2). |
| G02 | ALTA | Tabela de vínculo ausente ⇒ `activeLinkCustomerId=null` e `availability.leadCustomerLink=UNAVAILABLE`; consulta protegida por `to_regclass` (decisão 4). |
| G03 | ALTA | Serialização canônica fechada: ordem de chaves, nulos explícitos, datas/decimais, ordenação de itens, SHA-256 de `data`; vetores de teste compartilhados (decisão 4). |
| G04 | ALTA | Token inclui `estimatedValue`/`estimatedProfit` e `dataSha256`; mudança de preço ou de `data` invalida a revisão (decisão 4). |
| G05 | ALTA | Não existe escrita humana de confirmação de extração hoje. S01 é read-only; enforcement fica no cartão que criar essa escrita (B02/S06). Registrado em PERGUNTAS nº16 — **não** declarado coberto. |
| G06 | MEDIA | Matriz `AVAILABLE/ABSENT/UNAVAILABLE` fechada; nulabilidade explícita; exemplo corrigido (§2). |
| G07 | MEDIA | Allowlist de `signals` e `transcript`, limites e descarte por campo (§2). |
| G08 | MEDIA | Precedência lead→bot por campo; `street/state/cep` só do bot; nunca sobrescrever o lead (§2). |
| G09 | MEDIA | Join só com 11 dígitos nacionais ou 13 iniciando em `55`; fora disso, sem consulta ao bot (§2). |

Achados aplicados ao contrato antes de liberar S01. Nenhum deles reabre D9–D15 nem aumenta o escopo da noite.
O contrato passa a **APTO_COM_RESSALVA**: S01 é implementável; G05 permanece dívida explícita de cartão futuro.

### Segunda passada (verificação do orquestrador, 01:40)

- `whatsapp_bot.v_address_consolidated` confirmado ausente em `origin/dev` `1b2314e` (grep em `migrations/`).
- `lead_items.variant_group/variant_selected` existem desde `V2_36`; `lead_items` não tem coluna de fonte por item.
- `leads` tem `city, neighborhood, number, reference, latitude, longitude`; **não** tem `street/state/cep`.
- `extraction_confirmed_at` só aparece em DTO/entidade; nenhum controller/service o escreve.
- `GlobalExceptionHandler` devolve `message`; as rotas novas **não** passam por ele: controller devolve
  `ResponseEntity` com `{"code": ...}` diretamente, sem editar handler antigo (D10 preservada).
