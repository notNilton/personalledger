# 💰 Project Budget

Plataforma unificada de **Gerenciamento de Orçamento Pessoal** baseada no princípio de **Partidas Dobradas (Double-Entry Bookkeeping)** e estruturada em arquitetura Monorepo via **NPM Workspaces**.

O produto tem a visão futura de se tornar um Hub Financeiro Preditivo, atuando desde um "Smart Budgeting" até predição financeira com IA, ecossistema colaborativo/familiar e Open Finance. Para o levantamento completo das arquiteturas, fluxos de sistema e modelo de negócios, visite os documentos oficiais de design.

> 📚 **Documentação Oficial:** Toda a visão do produto e esquemas arquiteturais encontram-se na pasta **[`docs/designs/`](./docs/designs)**.
> Recomendamos ler o [Project Design (Roadmap)](./docs/designs/PROJECT_DESIGN.md) e o [Database Design](./docs/designs/DATABASE_DESIGN.md).

---

## 🧩 Ecossistema do Monorepo

O projeto é dividido em diferentes aplicativos e pacotes compartilhados:

- **[`apps/backend`](./apps/backend/README.md)**: API backend principal desenvolvida em **NestJS**. Processa lógica de transações, validação e atua como middleware entre nossos clients e o WorkOS/Database.
- **`packages/database`**: Agrupamento da fonte de dados base (**Prisma ORM** + PostgreSSQL), tipagens globais inferidas via banco e orquestração de infraestrutura (`docker-compose`).
- _(Próximos passos)_ **`apps/web`** & **`apps/mobile`**: Nossos clientes em Vite/React e React Native.

---

## 🚀 Como Iniciar

Siga os passos abaixo para configurar e rodar o projeto localmente pela primeira vez.

### 1. Instalar Dependências

Na raiz do projeto, instale todas as dependências do monorepo:

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

Com o banco rodando, execute o Prisma Migrate para criar todas as tabelas e schemas necessários (Tabelas geradas formatadas obrigatoriamente em `snake_case`):

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

- `npm run db:docker:up` - Inicia o PostgreSQL + Redis em background (usando os atalhos do docker compose).
- `npm run db:docker:down` - Desliga e remove os referidos contêineres Docker.
- `npm run db:migrate` - Aplica novas alterações do schema no banco e atualiza na sub-dependência Prisma Client.
- `npm run db:generate` - Atualiza somente as tipagens locais do Prisma Client sem tocar diretamente no schema do banco atual.
- `npm run db:studio` - Abre o Prisma Studio na interface web (`http://localhost:5555`).

### 🛠️ Scripts do Backend (`apps/backend`)

- `npm run dev:backend` - Executa o servidor NestJS do backend com live-reload estendido.
- `npm run build:backend` - Compila para JS padronizado apenas a nossa aplicação de Backend.
- `npm run start:prod:backend` - Inicializa a a versão pré-compilada da aplicação.

---

## 🧱 Padrão e Ferramentas Adicionais

O projeto está estritamente ajustado com boas pŕaticas e as ferramentas mais recentes do ecossistema voltadas a monorepos:

- **Husky** em conjunto com **Lint-Staged** formatam e validam erros sintáticos (via ESLint/Prettier) antes de autorizar com sucesso um novo commit na base.
- Controle unificado de tipagens restritas exportadas do Schema do DB. (Toda DTO do `backend` reflete os Enums/Models gerados no pacote `database`).
