# Casa de Carnes Cruzado — site

Site institucional da **Casa de Carnes Cruzado**, feito com o Design System da marca:
preto profundo, ouro e o vermelho que chama a atenção. Minimalista, em blocos de exposição,
com bordas neon, degradês e animações.

Site estático (HTML + CSS + JavaScript puro): não precisa de build nem de servidor especial.

## Páginas

| Página | Arquivo |
| --- | --- |
| Site (one-page) | `index.html` |
| Design System (cores, tipografia, botões, inputs, cards, raios, sombras, espaçamento) | `design-system.html` |

## Seções do site

1. **Hero** — título com degradê animado, emblema 3D com anel neon girando e CTAs com pulso vermelho.
2. **Faixas cruzadas** — duas faixas em “X” (vermelha e dourada) com os cortes passando.
3. **Sobre** — manifesto em que as palavras acendem conforme a rolagem.
4. **Diferenciais** — cards com glow dourado e borda que acende seguindo o cursor.
5. **Vitrine** — cortes com filtros (Bovinos, Suínos, Aves, Especiais) e botão “Pedir” direto no WhatsApp.
6. **Como pedir** — linha do tempo que se ilumina em vermelho.
7. **Kit churrasco** — card vermelho com calculadora (pessoas → kg de carne).
8. **Contato** — endereço, horários e formulário que monta a mensagem e abre o WhatsApp.

Efeitos: preloader, barra de progresso de rolagem, brilho vermelho que segue o cursor, botões
magnéticos com brilho e ripple, revelação ao rolar e botão flutuante do WhatsApp. Tudo respeita
a preferência de “reduzir movimento” do sistema.

## Como personalizar

### 1. Dados da loja — `assets/js/config.js`

```js
whatsapp: "5511999998888",        // DDI + DDD + número, só dígitos
whatsappLabel: "(11) 99999-8888", // como aparece no site
endereco: "Rua ..., 123 — Bairro",
cidade: "Cidade — UF",
horarios: [["Seg a Sex", "08h às 19h"], ...],
instagram: "seuperfil",           // vazio esconde o bloco
gramasPorPessoa: 400,             // calculadora do kit churrasco
```

Enquanto o número estiver como `5500000000000`, os botões de pedido levam ao formulário de contato
em vez de abrir o WhatsApp.

### 2. Cortes da vitrine — `index.html`

Cada corte é um `<article class="card ... card-product" data-cat="bovinos">` dentro de
`<div class="products">`. Copie um bloco, troque nome, descrição, categoria (`bovinos`, `suinos`,
`aves` ou `especiais`) e a mensagem do botão (`data-msg`).

### 3. Fotos reais dos produtos (opcional)

Coloque a foto em `assets/img/` e adicione dentro de `.product-media`:

```html
<img class="product-photo" src="assets/img/picanha.jpg" alt="Picanha">
```

A foto ocupa o card e a ilustração dourada some automaticamente.

### 4. Logo

| Arquivo | Uso |
| --- | --- |
| `assets/img/logo-cruzado.webp` | selo grande (topo do site, preloader) |
| `assets/img/logo-cruzado-2x.webp` | selo pequeno (menu, rodapé, card do kit) |
| `assets/img/favicon-32.png`, `favicon-64.png`, `apple-touch-icon.png` | ícone (boi com faca e cutelo) |
| `assets/img/og-cruzado.jpg` | imagem ao compartilhar o link (WhatsApp, Instagram, Facebook) |

Os arquivos foram recortados da arte da paleta. Se tiver a logo original em alta resolução
(PNG com fundo transparente ou SVG), substitua os dois `.webp` mantendo os mesmos nomes.

### 5. Cores e tipografia — `assets/css/tokens.css`

Todos os tokens do Design System estão em variáveis CSS no início do arquivo
(`--c-vermelho`, `--g-ouro`, `--fs-display`, `--r-lg`, `--s-red`, `--sp-4`, ...).

## Publicar com GitHub Pages

1. No repositório, abra **Settings → Pages**.
2. Em **Build and deployment**, escolha **Deploy from a branch**.
3. Selecione a branch `main` e a pasta `/ (root)` e clique em **Save**.
4. Em cerca de um minuto o site fica disponível em
   https://lurveassessoria-wq.github.io/cruzadoigara-u/.

## Rodar localmente

Abra `index.html` no navegador ou, para simular o servidor:

```bash
npx http-server .
```

## Estrutura

```
index.html
design-system.html
assets/
  css/tokens.css          tokens + componentes (botões, inputs, cards, neon)
  css/site.css            layout das seções
  css/design-system.css   estilos da página do Design System
  js/config.js            dados da loja
  js/main.js              animações e interações
  fonts/                  Montserrat (variável, licença OFL)
  img/                    logo, favicons e imagem de compartilhamento
```
