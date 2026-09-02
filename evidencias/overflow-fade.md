# Evidências — affordance de overflow em KPIs e filtros

As capturas usam `mock-server.mjs`, com os mesmos dados nos dois worktrees. A sidebar fica expandida
para reproduzir a largura disponível na captura do dono. A base (`prod` em `7c16694`) foi servida em
`5175` e esta branch em `5173`.

## Preparação

Em cada worktree:

```sh
cp evidencias/overflow-seed.html public/evidence-seed.html
printf 'VITE_API_URL=http://127.0.0.1:8080/verly-service\nVITE_POST_LOGIN_REDIRECT=/leads\n' > .env.local
```

Processos usados:

```sh
node evidencias/mock-server.mjs
npm run dev -- --host 127.0.0.1 --port 5173
npm run dev -- --host 127.0.0.1 --port 5175
```

## Comandos das screenshots

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --virtual-time-budget=5000 --screenshot="evidencias/overflow-before-1000x600.png" --window-size=1000,600 "http://127.0.0.1:5175/evidence-seed.html"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --virtual-time-budget=5000 --screenshot="evidencias/overflow-after-1000x600.png" --window-size=1000,600 "http://127.0.0.1:5173/evidence-seed.html"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --virtual-time-budget=5000 --screenshot="evidencias/overflow-before-1440x900.png" --window-size=1440,900 "http://127.0.0.1:5175/evidence-seed.html"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --virtual-time-budget=5000 --screenshot="evidencias/overflow-after-1440x900.png" --window-size=1440,900 "http://127.0.0.1:5173/evidence-seed.html"
```

## Resultado

| Janela | Antes | Depois |
|---|---|---|
| 1000×600 | [corte abrupto](overflow-before-1000x600.png) | [fade à direita nas duas faixas](overflow-after-1000x600.png) |
| 1440×900 | [todo o conteúdo cabe](overflow-before-1440x900.png) | [sem fade](overflow-after-1440x900.png) |

Em 1000×600, `Fornec.` e `$$$ Alto` deixam de terminar num corte duro: o fade indica continuação nas
duas faixas. Em 1440×900, as capturas antes/depois são visualmente idênticas porque não existe
overflow e a máscara fica desativada.

A solução usa máscara, não uma camada sobreposta: ela funciona sobre qualquer fundo. O `padding-right`
de 24 px deixa uma área vazia depois do último item, então o último caractere fica totalmente legível
quando a faixa chega ao fim. No meio do scroll, a máscara sinaliza os dois lados; nos limites, sinaliza
somente o lado que ainda tem conteúdo. Esses quatro estados também estão cobertos pelos testes.
