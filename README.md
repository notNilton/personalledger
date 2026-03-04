# Project Budget

Plataforma de Gerenciamento de Orçamento Pessoal em arquitetura monorepo utilizando **NPM Workspaces**.

O projeto é dividido em diferentes aplicativos e pacotes compartilhados:

- `apps/backend`: API desenvolvida em NestJS.
- `packages/database`: Módulo responsável pelo banco de dados (Prisma, PostgreSQL e Redis).

## 🚀 Como Iniciar

Siga os passos abaixo para configurar e rodar o projeto localmente pela primeira vez.

### 1. Instalar Dependências

Na raiz do projeto, instale todas as dependências:

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env` para o banco de dados baseando-se no arquivo de exemplo:

```bash
cp packages/database/.env.example packages/database/.env
```

_(As credenciais padrões do `.env.example` já servem para o ambiente de desenvolvimento local)._

### 3. Subir os Contêineres (Infraestrutura)

O projeto utiliza um banco de dados PostgreSQL 18 e o Redis 7. Para levantá-los usando Docker via painel de atalhos globais, execute:

```bash
npm run db:docker:up
```

### 4. Rodar as Migrações do Banco de Dados

Com o banco rodando, execute o Prisma Migrate para criar todas as tabelas e schemas necessários:

```bash
npm run db:migrate
```

### 5. Iniciar a API Backend

Inicie o servidor de desenvolvimento do NestJS:

```bash
npm run dev:backend
# ou
npm run start:dev:backend
```

---

## 📜 Scripts Úteis (Root `package.json`)

Para evitar a necessidade de entrar em cada pasta (`cd apps/backend` ou `cd packages/database`), a raiz do projeto provê os comandos principais:

### 🌍 Scripts Globais

- `npm run build` - Roda o build de todos os projetos simultaneamente.
- `npm run dev` - Roda todos os projetos em modo watch/dev (ótimo para rodar o sistema inteiro).
- `npm run lint` - Executa o ESLint em todo o código.

### 📦 Scripts de Banco de Dados (`packages/database`)

- `npm run db:docker:up` - Inicia o PostgreSQL + Redis em background.
- `npm run db:docker:down` - Desliga e remove os referidos contêineres Docker.
- `npm run db:migrate` - Aplica novas alterações do schema no banco e gera tipos atuais (sempre prefira migrar usando este script ao invés do `push`).
- `npm run db:generate` - Gera ou atualiza localmente os tipos do Prisma Client sem tocar no banco de dados.
- `npm run db:studio` - Abre a ferramenta administrativa Prisma Studio na interface web (`http://localhost:5555`).

### 🛠️ Scripts do Backend (`apps/backend`)

- `npm run dev:backend` - Executa o servidor NestJS do backend com live-reload.
- `npm run build:backend` - Roda o processo de compilação apenas do Backend.
- `npm run start:prod:backend` - (Para produção) inicializa a a versão pré-compilada da aplicação.

## 🧱 Padrão e Ferramentas Adicionais

O projeto está configurado com as ferramentas mais recentes do ecossistema:

- **Husky** em conjunto com **Lint-Staged** validam erros sintáticos (via ESLint/Prettier) antes de autorizar um novo commit na base.
- **Prisma** em seu `schema.prisma` adota os `@@map` e `@map` para garantir o uso estrito de `snake_case` nas estruturas tabulares do Banco.
