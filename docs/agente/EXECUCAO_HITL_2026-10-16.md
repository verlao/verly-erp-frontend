# Execução HITL — 16/10/2026

Autorização: Matheus respondeu “pode disparar” ao mapa de 16/10 e reiterou “continue”. Lote atual: C00/C01 e P01–P03, com uma nova prévia navegável para avaliar G2. Sem merge/deploy ou produção pelo agente.

## C00 — bases e coexistência

Refs atualizadas sem trocar os checkouts principais:

| Repo/base | SHA | Situação |
|---|---|---|
| ERP `origin/prod` | `c7b4e968549fc25ce5c976a984441506d078d7f4` | nenhuma PR aberta ao consultar |
| Service `origin/prod` | `2aa53c0622139a4b593f9781620378caa42e6861` | pipeline38811271508 success; deploy verificado no sweep. PR112 jobs duráveis e97 credenciais permanecem de outras frentes |
| Bot `origin/dev` | `8679727df34852cbcf7ac5c41f9d89259b959a24` | pipeline38788642328 success. PR95 plano de jornada permanece de outra frente; base confirmada dev |

Prévia segue em `wt/orq/G2-INTEGRATED`, branch descartável `prototype/financeiro-integrated-g2`. Aplicação real continua usando seu bootstrap/router originais. Entrada local em `evidencias/g2-integrado/main.ts` bloqueia API e usa identidade sintética sem token. Não há leitura de registros reais.

## C01 — contrato da primeira prévia

A prévia usa `reviewContext.ts` como fonte única dos casos de revisão e clientes conhecidos. Esse módulo não é um novo DTO de produção. Campos: `{value, origin, sourceLabel, quote?}` com origens `record/extracted/default/calculated/confirmed/unknown`. A origem pode continuar desconhecida; nome do perfil não é nome legal e candidato não é vínculo.

Casos sintéticos compartilhados:

- lead1: perfil Ana Box, cliente candidato1 Ana Exemplo, janela120×80cm, preço estimado134000centavos, pedido1048; Carlos é pagador distinto. Visita sugerida apenas pelo dia, horário ausente.
- lead2: perfil Bia Janela, cliente candidato2 Beatriz Teste, box com largura150cm e altura ausente; cor/folhas padrão precisam ser conferidas. Endereço parcial não substitui endereço completo da obra.
- lead232: Paula compara incolor e verde para a mesma janela180×210cm. As alternativas têm o mesmo grupo; não somar ambas como compra.
- lead219: Caio pede12m² de PVC branco. Área é suficiente para a modalidade; não exigir largura/altura de vidro.
- cliente3 Ana Teste tem telefone com sufixo igual e cadastro diferente; não escolher pelo sufixo/nome automaticamente.

Estado de vendas preserva `leadId/customerId`, campos opcionais de área/tipo/base de preço, quantidade e todas as linhas. Salvar orçamento de lead não exige CPF nem confirma candidato. Converter quote em pedido exige cliente válido escolhido pela pessoa quando ainda não vinculado. O vínculo simulado não escreve `convertedCustomerId`, não muda status do lead nem faz cadastro automático.

Preços da prévia são respostas/estimativas sintéticas identificadas como exemplo; cálculo de produção continua autoritativo no service. Valor ausente não vira zero, não usar multiplicador30% como regra comercial nem condição50% arbitrária. Edição invalida o resultado que deixou de representar a peça. Datas de ações novas vêm do que foi combinado ou ficam vazias.

A API atual dá contexto agregado, não proveniência completa por campo, mídia original pré-bridge ou vínculo humano com cliente existente. Os cenários ricos ilustram o fluxo proposto, não endpoints já ligados. Produção mantém as dependências do mapa e D11.

## Ownership desta onda

| Agente | Modelo | Arquivos exclusivos |
|---|---|---|
| P01 | gpt-6-luna | LeadsPreview, LeadQuotePreview, NovoOrcamentoPreview, FunilPreview; previewPricing se necessário |
| P02 | gpt-6-luna | ClientesPreview, ParceirosPreview, ProdutosPreview, PedidosPreview, UsuariosPreview |
| P03 | gpt-6-luna | FinanceiroPreview, usePreviewFinance, fixtures |
| root | sessão principal | reviewContext, ReviewValue, vendasPreviewState, OrcamentosPreview, sharedCSS, entrypoint, inspeções e docs |

Sem commits/typechecks concorrentes pelos executores. Root integra, revisa os diffs e serializa os gates. Shared state precisa de contrato antes de alterar. Os três executores foram interrompidos pelo limite de gastos do workspace. Suas alterações foram preservadas; root concluiu a integração e revisão, sem reiniciar agentes. A revisão separada do Guia para contratos de backend continua pendente.

## Contratos de backend e gate separado

C01 da apresentação está fechado para P01–P03. Antes de disparar S01–S07/M01/M02, fechar em documento de contrato específico as rotas, campos opcionais, nulabilidade, revisionamento, propriedade dos dados, auditoria e armazenamento mínimo, com revisão do Guia. Nenhum endpoint novo será escrito só por um agente ter desenhado seu resultado na prévia.

Regras já fechadas para esse desenho: `data` é JSON textual; `convertedCustomerId` mantém semântica legada; fontes opcionais ausentes não geram confirmação; ids de candidatos não são decisão; revisão desatualizada pede reconferência; migração antes do consumidor; endpoint mergeado e comprovado antes do PR bot/UI dependente. M02 não está reservado nem aprovado como necessário por esta prévia.

## Registro de entrega

C00 e C01 da apresentação concluídos. P01/P02/P03 integrados e revisados pelo root; aguardam a avaliação G2 do Matheus. Nenhum PR, push, merge ou deploy neste lote.

Entregue na prévia:

- Fichas de lead com campos conhecidos para leitura, origem visível, “Corrigir esta peça”, entradas apenas para lacunas, padrões sujeitos à conferência e revisão geral explícita.
- Orçamento multipeças sem CPF obrigatório; alternativas mutuamente exclusivas; PVC por área. Preço desconhecido aparece como “A calcular”. Estimativas são sintéticas e isoladas por tipo/cor; não definem política comercial.
- Revisão atualizada bloqueia salvamento até reconferência e preserva correções humanas. Esse comportamento é simulado localmente, sem controle de concorrência de servidor implementado.
- Produto escolhido atravessa orçamento; IDs de cliente/lead acompanham a navegação. Conversão em pedido só aceita cadastro válido escolhido quando ainda não vinculado. Todas as linhas/quantidades/áreas acompanham o pedido.
- Dia conhecido da visita é reaproveitado, horário ausente fica vazio. Agendar instalação reaproveita data/equipe existentes sem avançar etapa.
- Cadastro de cliente/parceiro com telefone opcional, sem campos persistentes inventados. Usuário usa nome de acesso/permissão; catálogo utiliza tipos/categorias suportados.
- Pix diferencia remetente, pagador, recebedor e cliente comercial; candidatos não viram vínculo. Divergência de valor não pré-seleciona finalidade. Conferir preserva correções. Valor não medido não vira zero. Confirmação adiada com desfazer; referência não altera saldo.

Validação: `npx vue-tsc -b`, `npm run build`, `git diff --check`. Navegador: 10 cenários funcionais, sem erros JavaScript ou requisições externas; 11 rotas × 393/768/1440 px sem overflow, tela vazia, texto abaixo de15px, botão abaixo de44px ou botão sem nome nas páginas inspecionadas. Os checks dimensionais não substituem uma auditoria completa de acessibilidade.

Evidências locais: `~/Documents/repositories/verly/hitl-review-2026-10-16/flows.json`, `all-tabs/inspection.json` e capturas sintéticas. Inspeções reutilizáveis na mesma pasta. Build padrão valida o app real e os tipos; a entrada navegável da prévia é servida pelo Vite em `/evidencias/g2-integrado/index.html`.

Próximo gate: Matheus avalia esta prévia G2. Depois, F01/F02/F03/F04 podem seguir em worktrees por cartão, com APIs existentes, revisão e PRs contra prod. C01-S e revisão do Guia antecedem S01–S07 e migrações; o limite de gastos interrompeu essa delegação. API nova depende de prova de deploy antes dos PRs consumidores, conforme D11. Não apresentar os dados enriquecidos da prévia como contrato já implementado.
