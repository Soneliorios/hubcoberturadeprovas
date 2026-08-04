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

## Área de administrador

- **/admin/login** — entrar (contas com e-mail + senha, hash bcrypt).
- **/admin** — lista, cria, edita e exclui conteúdos.
- Rotas `/admin/*` são protegidas por `src/proxy.ts` (Auth.js). Sem login → redireciona para o login.
- Criar/gerenciar contas de admin: `npm run create-admin -- --nome "..." --email "..." --senha "..."` (o mesmo comando atualiza a senha se o e-mail já existir).

## Banco de dados

- **Dev (local):** SQLite (`prisma/dev.db`), zero configuração.
- **Produção (Supabase/Postgres):**
  1. Em `prisma/schema.prisma`, troque `provider = "sqlite"` por `provider = "postgresql"`.
  2. No `.env`, aponte `DATABASE_URL` para a connection string do Supabase.
  3. Gere/rode a migração: `npx prisma migrate dev --name init` (ou rode o SQL de
     `prisma/migrations` adaptado — ver conversa) e depois `npm run create-admin`.

Modelos: `User` (admins) e `Conteudo`. Os 6 blocos são fixos em
`src/data/blocos.ts`; cada conteúdo referencia um `blocoId`.

## Fluxo de telas

| Rota | Descrição |
|------|-----------|
| `/` | Redireciona para `/cadastro` |
| `/cadastro` | Captura de lead (nome, e-mail, telefone, provas). **Visual apenas** — sem CRM ainda. |
| `/conteudos` | Home: header fixo + filtro por estado + 6 blocos em carrossel |
| `/conteudos/[bloco]` | "Ver todos" — grade com todos os itens de um bloco |

## Estrutura

```
src/
  app/
    layout.tsx              # Fonte Montserrat, metadata, tema
    globals.css             # Tokens de cor (dark), classes .input/.carousel
    page.tsx                # Redirect → /cadastro
    cadastro/page.tsx       # Tela de cadastro
    conteudos/page.tsx      # Home do hub
    conteudos/[bloco]/page.tsx
  components/
    Header.tsx              # Header fixo (logo + sino)
    Logo.tsx
    NotificationBell.tsx    # Sino com dropdown de notificações
    StateFilter.tsx         # Chips de estados (UF)
    HubContent.tsx          # Orquestra filtro + blocos (client)
    ContentCarousel.tsx     # Carrossel horizontal de um bloco
    ContentCard.tsx         # Card de conteúdo (vídeo/arquivo)
    CadastroForm.tsx        # Formulário de lead com validação
  data/
    conteudos.ts            # DADOS MOCKADOS — trocar por reais/CMS
    estados.ts              # UFs brasileiras
  lib/
    types.ts                # Tipos de domínio
    filtro.ts               # Regra de visibilidade por estado
    youtube.ts              # Extração de ID/thumbnail do YouTube
public/
  brand/                    # Logos Medway
  arquivos/                 # (colocar aqui os PDFs das Previsões Medbrain)
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
- [ ] **Integração do cadastro com CRM** (RD Station / HubSpot / Sheets) —
  ponto de entrada em `CadastroForm.tsx` (`// TODO: integrar com o CRM`).
- [ ] Upload de arquivos (hoje é link colado) + storage.
- [ ] Migrar o banco para o Supabase (ver seção "Banco de dados").
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
