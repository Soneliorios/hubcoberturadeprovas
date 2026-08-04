# Central Cobertura de Provas — Medway

Hub de conteúdos da Cobertura de Provas Medway. Direciona o usuário para vídeos
no YouTube (Ultra Revisões e Lives de Correção) e arquivos para download
(Previsões Medbrain), organizados em blocos e filtráveis por estado.

Projeto **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4**, tema dark,
tipografia Montserrat.

## Como rodar

```bash
npm install
npm run db:migrate           # cria o banco local (SQLite)
npm run db:seed              # popula com conteúdos de exemplo (opcional)
npm run create-admin -- --nome "Seu Nome" --email "voce@medway.com.br" --senha "SuaSenha123"
npm run dev                  # http://localhost:3000
```

Depois acesse **/admin/login** para gerenciar os conteúdos.

## Acesso público × cadastrados

O hub é **aberto** — ninguém precisa de login para entrar. Cada **seção** tem um
nível de acesso, definido pelo admin:

- **🌐 Aberto** — qualquer visitante vê os conteúdos.
- **🔒 Somente cadastrados** — visitante sem cadastro vê a seção **borrada**
  (placeholders, sem nenhum dado real no HTML) com CTA "Fazer cadastro grátis".

O cadastro (`/cadastro`) salva um **Lead** no banco (upsert por e-mail) e marca o
navegador com o cookie httpOnly `ccp_cadastrado` (1 ano) — as seções destravam.
É um gate suave de marketing (sem senha). Admins logados enxergam tudo.

## Área de administrador

- **/admin/login** — entrar (contas com e-mail + senha, hash bcrypt).
- **/admin** — lista, cria, edita e exclui conteúdos.
- **/admin/secoes** — cria, edita, exclui, **reordena** e define o acesso
  (aberto/cadastrados) de cada seção. Seção com conteúdos não pode ser excluída.
- **/admin/usuarios** — gestão de admins (sem cadastro público).
- Rotas `/admin/*` são protegidas por `src/proxy.ts` (Auth.js). Sem login → redireciona para o login.
- Criar admin por CLI: `npm run create-admin -- --nome "..." --email "..." --senha "..."`.

## Banco de dados

Postgres no **Supabase** via Prisma (`DATABASE_URL` pooler :6543 + `DIRECT_URL`
:5432 no `.env`). Migrações: `npm run db:migrate`.

Modelos: `User` (admins), `Secao` (categorias, com `acesso` e `ordem`),
`Conteudo` (referencia a seção; coluna legada `blocoId`) e `Lead` (cadastros).

## Fluxo de telas

| Rota | Descrição |
|------|-----------|
| `/` | Redireciona para `/conteudos` (entrada pública) |
| `/cadastro` | Captura de lead → cookie que destrava as seções restritas |
| `/conteudos` | Home: filtros (nível/estado) + seções em carrossel (bloqueadas = blur + CTA) |
| `/conteudos/[bloco]` | "Ver todos" de uma seção (também respeita o bloqueio) |

## Estrutura

```
src/
  app/
    layout.tsx              # Fonte Montserrat, IntroSplash, tema
    globals.css             # Tokens de cor (dark), intro, .input/.carousel
    page.tsx                # Redirect → /conteudos (entrada pública)
    cadastro/               # Tela + action de cadastro (lead + cookie)
    conteudos/page.tsx      # Home do hub (gate por seção)
    conteudos/[bloco]/page.tsx  # "Ver todos" (com gate)
    admin/                  # Painel: conteúdos, secoes/, usuarios/
  components/
    Header.tsx              # Header fixo (logo + CTA cadastro + sino)
    IntroSplash.tsx         # Intro estilo Netflix (a cada load)
    HubContent.tsx          # Filtros + seções (client)
    SecaoBloqueada.tsx      # Seção restrita: blur + placeholders + CTA
    ContentCarousel.tsx     # Carrossel horizontal de uma seção
    ContentCard.tsx         # Card de conteúdo (vídeo/arquivo)
    CadastroForm.tsx        # Formulário de lead com validação
  server/
    conteudos.ts            # Consultas/CRUD de conteúdos (com gate)
    secoes.ts               # CRUD + reordenação de seções
    leads.ts                # Lead + cookie de cadastro
  data/
    conteudos.ts            # Dados de exemplo (apenas para o seed)
    estados.ts              # UFs brasileiras
  lib/                      # types, schemas zod, filtro por UF, youtube
public/
  brand/                    # Logos Medway (fundo transparente)
```

## Como editar o conteúdo

O conteúdo agora é gerenciado pela **área de admin** (`/admin`) e persiste no
banco. Cada conteúdo tem:

- `tipo`: `"youtube"` (abre o vídeo) ou `"arquivo"` (baixa/abre o link)
- `url`: link do YouTube ou do arquivo
- `estados`: UFs marcadas. **Sem estados = conteúdo nacional** (aparece em
  qualquer filtro).
- `prova`, `descricao`, `duracaoMin`, `thumbnail`: opcionais.

As thumbnails de vídeos do YouTube são geradas automaticamente pela URL.
O arquivo `src/data/conteudos.ts` serve apenas como fonte do seed de exemplo.

## Próximos passos (roadmap)

Já previstos na arquitetura, prontos para evoluir sem reformular a interface:

- [x] **Painel admin protegido** para cadastrar conteúdos (`/admin`).
- [x] Migrar o banco para o Supabase.
- [x] **Seções gerenciáveis** com acesso aberto/cadastrados (blur + CTA).
- [x] **Captura de leads** no banco (upsert por e-mail) + cookie de desbloqueio.
- [ ] **Integração do cadastro com CRM** (RD Station / HubSpot / Sheets) —
  ponto de entrada em `src/app/cadastro/actions.ts` (`// TODO: enviar também ao CRM`).
- [ ] Tela de leads no admin (listagem/exportação — `listarLeads` já existe).
- [ ] Upload de arquivos (hoje é link colado) + storage.
- [ ] Notificações reais (sino já preparado) e pop-ups contextuais
  ("Faltam 7 dias para sua prova").
- [ ] Favoritar conteúdos (+ bloco de favoritos automático).
- [ ] "Continuar assistindo" (progresso de vídeos).

## Notas

- Os dados atuais são exemplos. Os PDFs de Previsões apontam para
  `/arquivos/*.pdf`, que ainda não existem — colocar os arquivos reais em
  `public/arquivos/`.
- Site responsivo (mobile-first). Carrosséis têm scroll horizontal
  independente do scroll vertical.
