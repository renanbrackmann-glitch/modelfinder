# Objetivo
Criar um painel de administração em /admin com controle completo sobre tags e grupos da página inicial. Inclui:
1. **Configurar Página Inicial** — grupos e etiquetas da tela principal gerenciados via banco, sem código
2. **Gerenciar Tags dos Modelos** — edição manual de tags por modelo, vinculada ao eprocId, persistente entre uploads
3. **Upload de planilhas** — centralizado no painel admin
4. **Alterar senha** — admin define sua própria senha

**Tags reais existentes no banco (seed inicial):**
Admissibilidade(26), MÉRITO(24), Liminares(18), Despachos(18), Locação(15),
Gratuidade de Justiça(11), Execução(9), Sentença(9), Bancário(9),
Embargos de declaração(6), CDC(6), Honorários(6), Prescrição(5), Nulidades(5),
Instrução(4), Decisões Interlocutórias(4), Sucumbência(4), Mandatos(3),
Responsabilidade Civil(4), Petição Inicial(2), Juros e Correção Monetária(2), Contestação(1), Corretagem(1)

**Configuração inicial dos grupos (seed):**
- Competência: Locação, Honorários, Corretagem, Mandatos, Bancário, Representação Comercial, Comissão Mercantil, Gestão de Negócios, Depósito Mercantil
- Fase Processual: Petição Inicial, Liminares, Contestação, Instrução, Sentença, Execução
- Tipo de Decisão: Despachos, Decisões Interlocutórias, Admissibilidade
- Natureza: Mérito, Liminares, Embargos de declaração
- Temáticas: Nulidades, Prescrição, Sucumbência, Gratuidade de Justiça, Juros e Correção Monetária, CDC, Responsabilidade Civil

# Tarefas

### T001: Schema — novas tabelas e campo manualTags
- **Bloqueado por**: []
- **Detalhes**:
  - Em `shared/schema.ts`:
    1. Adicionar campo `manualTags: text().array()` (nullable) à tabela `models` — armazena tags definidas manualmente pelo admin; preservadas entre uploads
    2. Criar tabela `pageGroups`: `id serial PK`, `title text NOT NULL`, `tags text[] NOT NULL DEFAULT []`, `displayOrder integer NOT NULL DEFAULT 0`
    3. Criar tabela `appSettings`: `id serial PK`, `key text UNIQUE NOT NULL`, `value text NOT NULL` — usada para armazenar a senha do admin
  - Rodar `npm run db:push`
  - Aceite: três alterações existem no banco

### T002: Backend — storage e endpoints
- **Bloqueado por**: [T001]
- **Detalhes**:
  **server/storage.ts** — adicionar métodos:
  - `getPageGroups()` — retorna grupos ordenados
  - `savePageGroups(groups)` — delete all + insert (substituição completa)
  - `updateModelTags(id: number, tags: string[])` — salva em `manualTags` E em `tags` + recalcula `unifiedTags`
  - `getSetting(key)` / `setSetting(key, value)` — leitura/escrita na tabela appSettings

  **server/routes.ts** — adicionar endpoints:
  - `GET /api/page-groups` (público) — retorna grupos; se vazio, faz seed e retorna
  - `PUT /api/admin/page-groups` (auth) — salva grupos completos
  - `PUT /api/admin/models/:id/tags` (auth) — atualiza tags do modelo (manual override)
  - `PUT /api/admin/password` (auth com senha atual) — verifica senha atual, salva nova via setSetting
  - **Alterar autenticação**: em vez de comparar com a string "admin123" hardcoded, comparar com `getSetting("adminPassword")`, com fallback para "admin123" se não configurada
  - **Upload de planilha (POST /api/admin/upload)**: após processar cada linha, verificar se o modelo com aquele eprocId tem `manualTags != null` — se tiver, usar `manualTags` como `tags` finais em vez das auto-geradas (preserva edições manuais)

  Aceite: todos endpoints respondem corretamente; upload preserva manualTags; autenticação usa senha do banco

### T003: Dashboard — consumir grupos do banco, simplificar
- **Bloqueado por**: [T002]
- **Detalhes**:
  - Em `client/src/pages/Dashboard.tsx`:
    - Remover `EPROC_GROUPS` hardcoded
    - Buscar grupos via `GET /api/page-groups` no carregamento
    - Botão "Admin" no header navega para `/admin` via wouter (sem popup de senha no Dashboard)
    - Remover estados de autenticação do Dashboard (showAdminLogin, adminPassword, loginError, isAdmin, botões de upload)
  - Aceite: grupos vêm do banco; botão Admin leva à rota /admin

### T004: Página /admin — painel completo
- **Bloqueado por**: [T002]
- **Detalhes**:
  Criar `client/src/pages/Admin.tsx` com:

  **Login gate**:
  - Tela de senha simples antes de mostrar qualquer conteúdo
  - Ao autenticar com sucesso, armazena em sessionStorage (não pede de novo enquanto a aba estiver aberta)
  - Link "← Voltar ao repositório" que leva de volta ao /

  **Seção 1 — Upload de Planilhas**:
  - Botão "Atualizar Base (.xls)" — lógica igual ao atual, apenas movida para cá
  - Botão "Carregar Íntegras (.xls)" — lógica igual ao atual
  - Feedback de resultado (quantos atualizados/erros)

  **Seção 2 — Configurar Página Inicial**:
  - Lista os grupos atuais buscados via GET /api/page-groups
  - Cada grupo: título editável + lista de tags como chips com botão "×"
  - Campo de texto para adicionar tag ao grupo (com sugestões autocomplete das tags existentes)
  - Botão para remover o grupo
  - Botão "＋ Adicionar Grupo" no final
  - Botão "Salvar alterações" que chama PUT /api/admin/page-groups

  **Seção 3 — Gerenciar Tags dos Modelos**:
  - Campo de busca por sigla, descrição ou tag atual
  - Lista paginada de modelos (card compacto: sigla + trecho da descrição + tags atuais como chips coloridos)
  - Ícone de lápis/editar ao hover; ao clicar, expande um editor inline:
    - Tags atuais como chips com "×" para remover
    - Campo para adicionar nova tag (autocomplete das tags existentes no banco)
    - Indicador visual se o modelo tem `manualTags` definido (edições manuais ativas)
    - Botão "Salvar" → PUT /api/admin/models/:id/tags
    - Botão "Redefinir para automático" → limpa manualTags, voltando às tags geradas pelo upload

  **Seção 4 — Segurança**:
  - Campo "Senha atual" + "Nova senha" + "Confirmar nova senha"
  - Botão "Alterar Senha" → PUT /api/admin/password
  - Feedback de sucesso/erro

  Registrar rota em `client/src/App.tsx`: `<Route path="/admin" component={Admin} />`

  Aceite: todas as seções funcionam; login por sessionStorage; edições de tag salvas; senha alterável
