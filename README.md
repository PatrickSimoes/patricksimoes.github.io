# Site do desenvolvedor — patricksimoes.github.io

Site estático do Cadu Vendas (landing + política + termos + app-ads.txt).
**Esta pasta não faz parte do app** — é só o conteúdo do site do GitHub Pages.

## Como publicar

1. No GitHub, crie um repositório **Público** com o nome **exatamente**:
   `patricksimoes.github.io`
2. Suba **o conteúdo desta pasta** (os arquivos, não a pasta) para a **raiz** desse repo:
   `app-ads.txt`, `index.html`, `privacy.html`, `terms.html`.
3. Settings → **Pages** → Source: `Deploy from a branch`, branch `main`, pasta `/ (root)` → Save.
4. Aguarde ~1-2 min e confira se abrem:
   - https://patricksimoes.github.io/
   - https://patricksimoes.github.io/app-ads.txt  (texto puro, 1 linha)
   - https://patricksimoes.github.io/privacy.html
   - https://patricksimoes.github.io/terms.html

## Configurar na Google Play Console

- **Aumentar número de usuários → Presença na loja → Configurações da loja →
  Detalhes de contato → Site:** `https://patricksimoes.github.io`
- **Política → Conteúdo do app → Política de privacidade:**
  `https://patricksimoes.github.io/privacy.html`
  (opcional trocar; a URL antiga em `public-terms-play-store` também funciona
  enquanto existir. Manter uma só é mais organizado.)

## AdMob

Depois do site no ar + campo Site salvo na Play → no AdMob, abra o app e clique
em **Verificar/Rastrear** o app-ads.txt. A verificação leva de horas a ~1 dia.

> Lembrete: no repo antigo `public-terms-play-store`, apague o `index.html` que
> foi adicionado por engano (ele redireciona pra si mesmo = loop). A política
> antiga em si pode ficar; a nova (aqui) é a versão consolidada.
