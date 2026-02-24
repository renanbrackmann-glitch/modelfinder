# Repositório de Modelos — Gabinete Digital

## Visão Geral

Sistema de busca e acesso a modelos de decisões jurídicas (textos padrão) exportados do eproc. Permite que assessores encontrem modelos rapidamente usando busca textual e filtros por etiquetas processuais.

## Arquitetura

- **Frontend**: React + TypeScript + Tailwind CSS (Vite)
- **Backend**: Express (Node.js/TypeScript)
- **Banco de Dados**: PostgreSQL (Drizzle ORM)

## Estrutura de Pastas

```
client/src/
  pages/
    Dashboard.tsx    # Tela principal (busca + filtros por grupos dinâmicos)
    Admin.tsx        # Painel de administração em /admin
  components/
    ModelCard.tsx          # Card de modelo
    ModelContentSheet.tsx  # Painel lateral com íntegra completa
    AnalysisPanel.tsx      # Painel de análise de PDF com Gemini
  data/models.ts           # Dados de fallback + lógica de busca + tipos

server/
  index.ts    # Servidor Express
  routes.ts   # API: todos os endpoints
  storage.ts  # Interface com banco de dados (Drizzle)
  db.ts       # Conexão PostgreSQL

shared/
  schema.ts   # Schema Drizzle (tabelas models, pageGroups, appSettings)
```

## Endpoints de API

### Públicos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/models | Retorna todos os modelos salvos no banco |
| GET | /api/models/:id | Retorna modelo individual (com íntegra) |
| GET | /api/page-groups | Retorna grupos de etiquetas da página inicial (com seed automático) |
| POST | /api/analyze-pdf | Extrai texto do PDF e sugere modelos via Gemini |
| POST | /api/admin/verify-password | Verifica senha do admin sem alterar |

### Admin (requerem header `x-admin-password`)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/models/upload | Processa XLS do eproc e salva no banco |
| POST | /api/models/upload-content | Vincula íntegras aos modelos via XLS |
| PUT | /api/admin/page-groups | Substitui todos os grupos de etiquetas |
| PUT | /api/admin/models/:id/tags | Edita tags de um modelo manualmente |
| PUT | /api/admin/models/:id/reset-tags | Remove override manual, volta ao automático |
| PUT | /api/admin/password | Altera senha do administrador |

## Banco de Dados — Tabelas

### `models`
- id, eprocId (unique), orgao, descricao, sigla, classificacaoOriginal, categoria
- tags[] — tags ativas (auto ou manual)
- unifiedTags[] — tags normalizadas para busca (sem acento, lowercase)
- corHex — cor do card
- conteudo — íntegra completa (nullable)
- manualTags[] — tags definidas manualmente pelo admin (nullable); se preenchido, prevalece sobre auto-tags no próximo upload

### `page_groups`
- id, title, tags[], displayOrder
- Armazena a configuração dos grupos exibidos na página inicial
- Seeded automaticamente na primeira chamada a /api/page-groups

### `app_settings`
- id, key (unique), value
- Armazena configurações persistentes (ex: adminPassword)

## Funcionalidades

1. **Busca search-first**: Nenhum modelo exibido até o usuário pesquisar ou clicar em tag
2. **Unificação semântica**: "BANCÁRIO" e "Bancário" são tratados como iguais
3. **Upload de XLS**: Admin carrega planilha exportada do eproc. Sistema detecta automaticamente a linha de cabeçalho
4. **Auto-categorização**: Na importação, sistema atribui tags processuais automaticamente por palavras-chave na descrição
5. **Tags manuais persistentes**: Admin pode editar tags de qualquer modelo via /admin. Edições sobrevivem a novos uploads (vinculadas ao eprocId)
6. **Análise de PDF com Gemini**: Extração de texto + análise inteligente de questões jurídicas + sugestão de modelos
7. **Visualização de íntegra**: Painel lateral com texto completo do modelo ao clicar no card
8. **Painel Admin em /admin**: Interface completa para upload, configuração de grupos, edição de tags e alteração de senha
9. **Grupos configuráveis**: Grupos de etiquetas da página inicial são gerenciados via painel admin e salvos no banco

## Painel Admin (/admin)

- **Login**: Autenticação por senha, armazenada em sessionStorage (não pede novamente enquanto a aba está aberta)
- **Seção 1 — Upload**: Atualizar base e carregar íntegras
- **Seção 2 — Configurar Página Inicial**: CRUD de grupos e tags com autocomplete
- **Seção 3 — Gerenciar Tags dos Modelos**: Buscar modelo, expandir, editar tags, salvar, ou reverter para automático
- **Seção 4 — Segurança**: Alterar senha do administrador

## Variáveis de Ambiente

- `DATABASE_URL`: Conexão PostgreSQL (gerada pelo Replit)
- `GEMINI_API_KEY`: Chave da API Gemini para análise de PDFs
- `ADMIN_PASSWORD`: Senha fallback se não configurada no banco (padrão: admin123)
