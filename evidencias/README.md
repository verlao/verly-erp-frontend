# Evidências — altura de Leads sem número mágico

As capturas usam o backend determinístico de `mock-server.mjs`. Ele reproduz os totais do parecer
(232 leads, pipeline medido de R$ 53.245,74, R$ 17.931,00 sem medida, 88 novos e parceiros de
R$ 8.043,21) sem depender do backend real.

## Preparação

```sh
cp evidencias/seed.html public/evidence-seed.html
node evidencias/mock-server.mjs
npm run dev -- --host 127.0.0.1
```

## Comandos das screenshots

Antes (executados sobre `prod`, antes da alteração):

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --virtual-time-budget=3000 --screenshot="evidencias/leads-before-1000x506.png" --window-size=1000,506 http://127.0.0.1:5173/evidence-seed.html
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --virtual-time-budget=3000 --screenshot="evidencias/leads-before-1000x600.png" --window-size=1000,600 http://127.0.0.1:5173/evidence-seed.html
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --virtual-time-budget=3000 --screenshot="evidencias/leads-before-1280x800.png" --window-size=1280,800 http://127.0.0.1:5173/evidence-seed.html
```

Depois:

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --virtual-time-budget=3000 --screenshot="evidencias/leads-after-1000x506.png" --window-size=1000,506 http://127.0.0.1:5173/evidence-seed.html
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --virtual-time-budget=3000 --screenshot="evidencias/leads-after-1000x600.png" --window-size=1000,600 http://127.0.0.1:5173/evidence-seed.html
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --virtual-time-budget=3000 --screenshot="evidencias/leads-after-1280x800.png" --window-size=1280,800 http://127.0.0.1:5173/evidence-seed.html
```

| Janela | Antes | Depois |
|---|---|---|
| 1000×506 | [PNG](leads-before-1000x506.png) | [PNG](leads-after-1000x506.png) |
| 1000×600 | [PNG](leads-before-1000x600.png) | [PNG](leads-after-1000x600.png) |
| 1280×800 | [PNG](leads-before-1280x800.png) | [PNG](leads-after-1280x800.png) |

## Contagem dos contextos de scroll

O script `measure-scroll.mjs` usa o Chrome DevTools Protocol para fixar o viewport CSS no tamanho
informado. Ele conta a página quando `documentElement.scrollHeight > innerHeight` e cada elemento
cujo `overflow-y` computado é `auto`/`scroll` e `scrollHeight > clientHeight + 1`.

```sh
node evidencias/measure-scroll.mjs after-1000x506 1000x506
node evidencias/measure-scroll.mjs after-1000x600 1000x600
node evidencias/measure-scroll.mjs after-1280x800 1280x800
```

| Janela | Página rolável | Elementos roláveis depois | Total depois |
|---|---:|---|---:|
| 1000×506 | não (506/506px) | lista (255/2282px) | **1** |
| 1000×600 | não (600/600px) | lista (349/2282px) | **1** |
| 1280×800 | não (800/800px) | lista (549/1882px) | **1** |

Em 1000×600, o card `🔥 Quentes (4)` começa em y=446 e intercepta o viewport até y=600, com
`scrollY=0`: ele está visível sem rolar a página. Em 1280×800, o card inteiro fica visível
(y=426–699).

## Outras rotas no mesmo layout

Também foram renderizadas em 1000×600:

```sh
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --virtual-time-budget=3000 --screenshot="evidencias/products-after-1000x600.png" --window-size=1000,600 "http://127.0.0.1:5173/evidence-seed.html?to=/products"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --virtual-time-budget=3000 --screenshot="evidencias/quotes-after-1000x600.png" --window-size=1000,600 "http://127.0.0.1:5173/evidence-seed.html?to=/quotes"
```

- [Produtos](products-after-1000x600.png): conteúdo longo preservado no scroll do `main`
  (600/1487px), sem scroll da página.
- [Orçamentos](quotes-after-1000x600.png): conteúdo preservado no scroll do `main`
  (600/697px), sem scroll da página.

O mock local foi usado porque o backend real não é necessário para provar a geometria e não foi
consultado durante esta reprodução.
