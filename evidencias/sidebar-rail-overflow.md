# Evidências — overflow vertical do trilho

Medições feitas pelo Chrome DevTools Protocol com
`node evidencias/measure-sidebar.mjs <rótulo> <largura>x<altura>`. Para cada destino, o script compara
seu `getBoundingClientRect()` com o retângulo do `nav`.

| Janela | Antes | Ocultos antes | Depois | Ocultos depois |
|---|---:|---|---:|---|
| 1000×506 | 7/9 | Financeiro, Usuários | **9/9** | nenhum |
| 1000×600 | 9/9 | nenhum | **9/9** | nenhum |
| 1280×800 | 9/9 | nenhum | **9/9** | nenhum |

Em 1000×506, o `nav` permaneceu em `top=93`, `bottom=429`, `clientHeight=336`. Seu
`scrollHeight` caiu de 428 para 336 px. Financeiro passou de `top=429`, `bottom=473`, oculto, para
`top=129`, `bottom=161`, visível. O botão Sair permaneceu em `top=446`, `bottom=490`, totalmente
visível e aprovado pelo hit-test de `elementFromPoint()`.

Em uma altura adversa de 1000×420, o `nav` mede 250/320 px e exibe o controle
`aria-label="Ver mais destinos"` junto ao fade inferior. Leads e Financeiro continuam visíveis; Sair
permanece totalmente visível e clicável.

## Screenshots

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --virtual-time-budget=3000 --screenshot="evidencias/rail-before-1000x506.png" --window-size=1000,506 http://127.0.0.1:5173/evidence-seed.html
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --screenshot="evidencias/rail-after-1000x506.png" --window-size=1000,506 http://127.0.0.1:5173/evidence-seed.html
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --screenshot="evidencias/rail-after-1000x420.png" --window-size=1000,420 http://127.0.0.1:5173/evidence-seed.html
```

| Estado | Captura |
|---|---|
| Antes, 1000×506 | [PNG](rail-before-1000x506.png) |
| Depois, 1000×506 | [PNG](rail-after-1000x506.png) |
| Affordance em altura menor, 1000×420 | [PNG](rail-after-1000x420.png) |

## Espaço e prioridade

No trilho, cada destino passou de 44 para 32 px; o espaço de 4 px entre itens foi preservado. O
alvo de 32 px é restrito ao desktop colapsado, operado por ponteiro. O menu expandido, o celular, o
toggle e Sair continuam com 44 px.

A ordem é Leads, Financeiro, Funil, Clientes, Parceiros, Produtos, Orçamentos, Pedidos e Usuários.
Leads e Financeiro ficam primeiro por concentrarem, respectivamente, o trabalho operacional e as
confirmações financeiras acionáveis.

Dashboard já não possui entrada de navegação, portanto ocupa 0 px. Remover Pedidos devolveria 36 px
no trilho (32 px do alvo + 4 px de intervalo) e 48 px no menu expandido (44 + 4); nenhuma rota foi
removida.
