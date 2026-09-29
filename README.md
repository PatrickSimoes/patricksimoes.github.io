# Site do Cadu Vendas — caduvendas.com.br

Site estático da marca: landing, páginas de recurso (feitas pra busca), política de privacidade,
termos, exclusão de conta e `app-ads.txt`. **Esta pasta não faz parte do app** — no repositório
do app ela é o submódulo `site/`.

Sem build, sem framework: HTML + um CSS + dois JS pequenos. A identidade é a mesma dos prints da
Play (`assets/store-assets/playstore-frames.html` no repo do app): papel manteiga, verde-musgo,
ocre e dourado, Fraunces nos títulos e DM Sans no texto. Os celulares são mockups em HTML/CSS
(tema escuro do app), não imagens — ficam nítidos em qualquer tela e não pesam.

## Páginas

| Arquivo                   | URL                                            | Para que serve                                   |
| ------------------------- | ---------------------------------------------- | ------------------------------------------------ |
| `index.html`              | https://caduvendas.com.br/                     | Landing da marca                                 |
| `pix/index.html`          | https://caduvendas.com.br/pix/                 | Recurso: QR Code Pix                             |
| `fiado/index.html`        | https://caduvendas.com.br/fiado/               | Recurso: controle de fiado                       |
| `pedidos/index.html`      | https://caduvendas.com.br/pedidos/             | Recurso: pedidos e encomendas                    |
| `precificacao/index.html` | https://caduvendas.com.br/precificacao/        | Calculadora de preço de venda (funciona no site) |
| `relatorios/index.html`   | https://caduvendas.com.br/relatorios/          | Recurso: relatórios e lucro                      |
| `privacy.html`            | https://caduvendas.com.br/privacy.html         | Política de Privacidade (campo na Play Console)  |
| `delete-account.html`     | https://caduvendas.com.br/delete-account.html  | URL de exclusão de conta (exigida pela Play)     |
| `terms.html`              | https://caduvendas.com.br/terms.html           | Termos de Uso                                    |
| `app-ads.txt`             | https://caduvendas.com.br/app-ads.txt          | Verificação do AdMob                             |
| `404.html`                | —                                              | Página de "não encontrado" (`noindex`)           |

Arquivos de apoio: `assets/css/site.css`, `assets/js/site.js` (menu do celular),
`assets/js/calculadora.js` (a mesma conta de `src/lib/pricing.ts` do app), `sitemap.xml`,
`robots.txt`, `site.webmanifest`, `favicon.svg`, `apple-touch-icon.png` e
`assets/img/og/cadu-vendas.png` (imagem de compartilhamento 1200×627 — é o `linkedin.png` dos
store assets). Os ícones ficam num sprite SVG embutido no começo do `<body>` de cada página.

As fontes (Fraunces e DM Sans, variáveis, recorte latino) estão em `assets/fonts/`, com as
licenças SIL OFL ao lado — são os mesmos arquivos que o Google Fonts servia, vindos do
[Fontsource](https://fontsource.org/). Hospedar aqui tira dois domínios de terceiros do
carregamento e deixa o texto aparecer bem mais cedo no celular.

## Ver localmente

Os caminhos são relativos, então dá pra abrir o `index.html` direto no navegador ou pelo Live
Server do VS Code. Pra navegar entre as páginas como no site publicado (`/pix/` abrindo o
`pix/index.html`), use um servidor na pasta:

```bash
npx serve .
```

Aberto direto do disco (`file://`), o Chrome não carrega as fontes e mostra a letra reserva —
é só no teste local; com qualquer servidor elas aparecem.

### Lighthouse

- Rode numa **janela anônima**: extensões do Chrome injetam JavaScript na página e inflam
  "JavaScript não usado", "trabalho na thread principal" e o TBT — o site só tem ~2 KB de JS.
- O Live Server não comprime nada; o `npx serve .` comprime (gzip), como o nginx e o GitHub Pages.
  Sem compressão, HTML e CSS chegam ~5× maiores e o FCP no celular sobe.
- O número que vale é o do site publicado: https://pagespeed.web.dev/ com a URL de produção.

## Onde o site roda

1. **caduvendas.com.br** — servidor próprio (Oracle Cloud, Ubuntu 24.04, nginx 1.24), com a
   **Cloudflare na frente** (proxy laranja: ela entrega HTTPS, HTTP/2-3 e compressão ao visitante).
   O nginx serve um clone deste repositório em `/var/www/caduvendas/frontend` e manda `/api/` pro
   backend `meu-back` (PM2, porta 3000).
2. **patricksimoes.github.io** — GitHub Pages deste mesmo repositório (push na `main`). Continua no
   ar como espelho: é a URL que a Play Console e o app ainda usam hoje. Todas as páginas têm
   `<link rel="canonical">` pra caduvendas.com.br, então o Google trata o domínio próprio como o
   principal.

> Não adicione um arquivo `CNAME` aqui: ele faria o GitHub Pages redirecionar pro domínio próprio,
> que é servido pelo nginx, não pelo GitHub.

### Primeira publicação no servidor (uma vez só)

Pré-requisito: a `main` deste repositório já no GitHub (o servidor clona de lá).

```bash
# 1. guarda a página provisória e põe o clone do site no lugar dela
sudo mv /var/www/caduvendas/frontend /var/www/caduvendas/frontend.antigo
sudo git clone https://github.com/PatrickSimoes/patricksimoes.github.io.git /var/www/caduvendas/frontend

# 2. nginx: backup da config atual e a versão nova (mantém /api/ e as linhas do certbot)
sudo cp /etc/nginx/sites-available/caduvendas /etc/nginx/sites-available/caduvendas.bak
sudo cp /var/www/caduvendas/frontend/deploy/nginx/caduvendas.com.br.conf /etc/nginx/sites-available/caduvendas
sudo nginx -t && sudo systemctl reload nginx

# 3. publicação automática: o servidor puxa a main a cada 5 minutos
echo '*/5 * * * * root git -C /var/www/caduvendas/frontend pull --ff-only -q' | sudo tee /etc/cron.d/caduvendas-site

# 4. a renovação do certificado da origem funciona com a Cloudflare na frente?
sudo certbot renew --dry-run
```

Deu errado no passo 2? `sudo cp /etc/nginx/sites-available/caduvendas.bak /etc/nginx/sites-available/caduvendas && sudo systemctl reload nginx`.

Depois disso, **publicar = commit + push na `main`**. Em até 5 minutos o servidor puxa, e o GitHub
Pages atualiza o espelho em 1–2 minutos. O nginx bloqueia `.git/`, `deploy/` e `README.md`.

Cloudflare: SSL/TLS em **Full (strict)** (a origem tem certificado válido, com o www). HTML não fica
em cache na Cloudflare; CSS/JS ficam — por isso o `?v=N` nos links. O certificado da origem vence
em 27/12/2026 e renova sozinho pelo certbot, se o `--dry-run` do passo 4 passar.

Se o repositório virar privado, o `git pull` do servidor passa a precisar de uma deploy key.

### Conferir depois de publicar

```bash
curl -sI https://caduvendas.com.br/ | head -1              # 200
curl -sI https://www.caduvendas.com.br/ | grep -i location  # → https://caduvendas.com.br/
curl -s  https://caduvendas.com.br/app-ads.txt             # a linha do AdMob
curl -sI https://caduvendas.com.br/nao-existe | head -1    # 404 (com a página 404.html)
```

## Quando o domínio estiver no ar — trocar as URLs

Só depois de confirmar que https://caduvendas.com.br abre este site:

- **Play Console → Política → Conteúdo do app → Política de privacidade:**
  `https://caduvendas.com.br/privacy.html`
- **Play Console → Conteúdo do app → Exclusão de dados / conta:**
  `https://caduvendas.com.br/delete-account.html`
- **Play Console → Presença na loja → Configurações da loja → Detalhes de contato → Site:**
  `https://caduvendas.com.br`
- **AdMob:** com o site novo salvo na Play, clique em **Verificar** o app-ads.txt de novo. O AdMob lê
  o `app-ads.txt` do domínio do campo "Site" da Play — e não segue redirecionamento pra outro
  domínio, por isso o arquivo precisa estar em caduvendas.com.br.
- **App (`src/app/termos.tsx`):** trocar os links de `patricksimoes.github.io` por
  `caduvendas.com.br` na próxima versão.

## SEO — o que já está feito

- Título, descrição e `canonical` únicos em cada página; `lang="pt-BR"`; um `h1` por página.
- Open Graph + Twitter Card (prévia bonita no WhatsApp, Instagram e redes).
- Dados estruturados (JSON-LD): `Organization`, `WebSite`, `MobileApplication` com as ofertas,
  `FAQPage` nas perguntas, `BreadcrumbList` nas páginas internas e `WebApplication` na calculadora.
  Não há nota/avaliação no schema de propósito — inventar nota é contra as regras do Google.
- `sitemap.xml`, `robots.txt`, favicon, `site.webmanifest` (com o app da Play em
  `related_applications`).
- Páginas de recurso pras buscas que o app resolve: fiado, QR Code Pix, controle de pedidos,
  calculadora de preço de venda e relatório de lucro — com links entre elas.
- Leve: sem imagens pesadas, sem framework, sem cookies e sem rastreamento.

## SEO — o que só dá pra fazer fora do código

1. **Google Search Console:** adicionar a propriedade de **domínio** `caduvendas.com.br` (a
   verificação é um registro TXT na Cloudflare), enviar `https://caduvendas.com.br/sitemap.xml` e
   pedir a indexação da página inicial.
2. **Bing Webmaster Tools:** importar direto do Search Console.
3. Colocar `https://caduvendas.com.br` na bio do Instagram e em outros perfis da marca.

## Manutenção

- **Caminhos sempre relativos:** `assets/...` nas páginas da raiz, `../assets/...` nas páginas
  dentro de pasta (`pix/`, `fiado/`…). A `404.html` é especial: o servidor a devolve em qualquer
  URL, então ela tem `<base href="/">` (e um script que, só no teste local, usa a pasta dela como
  raiz). Por isso ela não usa o sprite de ícones nem link de âncora pra própria página.
- **Ícones:** o sprite (`<svg>` com os `<symbol>`) é o mesmo bloco no começo de todas as páginas.
  Ícone novo ou alterado? Troque o bloco em todas elas.
- **Mexeu no CSS ou no JS?** Suba o `?v=N` dos links (`site.css?v=3`) em todas as páginas — o
  servidor guarda esses arquivos em cache por 30 dias.
- **Links da Play:** abrem em nova aba (`target="_blank" rel="noopener"` + aviso escondido pro
  leitor de tela) e usam **uma única URL por página** (`utm_campaign` = nome da página). Links com
  o mesmo texto e destinos diferentes derrubam a auditoria de acessibilidade do Lighthouse.
- **Mudou uma página?** Atualize o `<lastmod>` dela no `sitemap.xml`.
- **Mudou preço ou recurso Premium?** Atualize a seção Planos do `index.html` e as `offers` do
  JSON-LD — os preços reais vêm da Google Play, o site só descreve.
- **Feature nova mexendo em dados?** Atualize os **três lugares** juntos:
  1. `privacy.html` (aqui) — e a data de "Última atualização" no topo;
  2. a tela in-app `src/app/termos.tsx` no repo do app;
  3. o formulário **Segurança dos dados** na Play Console.

  Divergência entre eles derruba a revisão com "Política de Privacidade inválida".
