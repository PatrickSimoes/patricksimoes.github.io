# Site do desenvolvedor — patricksimoes.github.io

Site estático do Cadu Vendas (landing + política + termos + exclusão de conta + app-ads.txt).
**Esta pasta não faz parte do app** — é só o conteúdo do site do GitHub Pages.

## Páginas

| Arquivo               | URL                                                    | Para que serve                                  |
| --------------------- | ------------------------------------------------------ | ----------------------------------------------- |
| `index.html`          | https://patricksimoes.github.io/                        | Landing / site de contato na Play               |
| `privacy.html`        | https://patricksimoes.github.io/privacy.html            | Política de Privacidade (campo na Play Console) |
| `delete-account.html` | https://patricksimoes.github.io/delete-account.html     | URL de exclusão de conta (exigida pela Play)    |
| `terms.html`          | https://patricksimoes.github.io/terms.html              | Termos de Uso                                   |
| `app-ads.txt`         | https://patricksimoes.github.io/app-ads.txt             | Verificação do AdMob                            |

## Como publicar

Commit + push na branch `main` do repo `patricksimoes.github.io`. Settings → **Pages** →
Source: `Deploy from a branch`, branch `main`, pasta `/ (root)`. O deploy leva ~1-2 min.

Depois confira que todas as URLs da tabela acima abrem em aba anônima (sem login, sem redirect).

## Configurar na Google Play Console

- **Política → Conteúdo do app → Política de privacidade:**
  `https://patricksimoes.github.io/privacy.html`
- **Política → Conteúdo do app → Exclusão de dados / conta:**
  URL web `https://patricksimoes.github.io/delete-account.html`
  (e marcar que o app também oferece exclusão in-app: Perfil → Conta → Excluir conta e dados)
- **Aumentar número de usuários → Presença na loja → Configurações da loja →
  Detalhes de contato → Site:** `https://patricksimoes.github.io`

> ⚠️ **Não aponte a Play Console para o repo antigo `public-terms-play-store`.**
> Aquela política é genérica (nem cita o Cadu Vendas), fala de Supabase/Google Sign-In/Expo
> push — serviços que o app não usa mais — e diz que a exclusão de conta "não está disponível
> no app". Qualquer um desses pontos derruba a revisão com "Política de Privacidade inválida".
> O ideal é substituir o conteúdo daquele repo por um `<meta http-equiv="refresh">` apontando
> para `https://patricksimoes.github.io/privacy.html`, ou despublicar o GitHub Pages dele.

## Manutenção

Quando uma feature nova mexer em dados, atualize **os três lugares**:

1. `privacy.html` (aqui) — e a data de "Última atualização" no topo;
2. a tela in-app `src/app/termos.tsx` no repo do app;
3. o formulário **Segurança dos dados** na Play Console (ele precisa bater com a política).

## AdMob

Com o site no ar + campo Site salvo na Play → no AdMob, abra o app e clique em
**Verificar/Rastrear** o app-ads.txt. A verificação leva de horas a ~1 dia.
