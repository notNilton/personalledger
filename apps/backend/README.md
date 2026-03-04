# ⚙️ Project Budget - Backend API

Esta é a API central para a plataforma **Project Budget**, desenvolvida com **[NestJS](https://nestjs.com/)**.

O Backend é o motor de nossa plataforma unificada, responsável por toda a lógica de roteamento, controle e segurança dos dados contábeis.

## 📖 Sobre a Arquitetura Backend

O Backend atua como a única ponte autorizada para manipular os dados confidenciais do sistema monetário da aplicação. Ele não é conectado diretamente a banco de dados legados e gerencia a comunicação importando o modulo `@project-budget/database` derivado de nosso Monorepo Workspace.

### Princípios (Reflexos do Design Documentado)

1. **Partidas Dobradas (Double-Entry Bookkeeping):**
   Não existe conceito de vazamento de saldo. Modificações financeiras utilizam roteamento rigoroso para criar correspondência exata de passivos, ativos, origens e destinos da transação.

2. **Autenticação Desacoplada via SSO (WorkOS):**
   A segurança da autenticação, o armazenamento de senhas e todo mecanismo de Autenticação/MFA foi tercerizado com sucesso sob a alçada do provedor `WorkOS`. Nossos tokens recebidos são validados globalmente por intermédio de Guards padronizados nativos do ecossistema Nest (ex: `WorkOsAuthGuard`) extraindo o `workos_id` local.

3. **Carga Massiva e Performance:**
   Como a importação é massiva (Fase 1 focada em processamento OFX e CSV paralelos), todas as filas lógicas e rotinas assíncronas do backend futuramente conversarão com instâncias de redis e RabbitMQ usando filas BullMQ gerenciadas pelo próprio NestJS.

4. **Trilhas de Auditoria (Audit Logs):**
   Modificações fundamentais são armazenadas de forma inerte e imutável para rastreios anti-fraude.

## 🗂 Estrutura e Domínios da API

A estrutura lógica do projeto segue a segmentação dos domínios especificados no planejamento (`docs/designs/DATABASE_DESIGN.md`):

- **`/users`**: Gerenciamento de preferências do perfil não-sensíveis, avatares, sincronia de níveis premium.
- **`/accounts`**: Gestão de portfólio (Carteiras digitais, Investimento, Dinheiro, CC, Poupança).
- **`/transactions & /transfers`**: Endpoint principal de entradas, saídas, pendentes e pagamentos de cartão.
- **`/budgets`**: O grande motor "Smart Budgeting" em base-zero.
- **`/goals`**: Sistema de metas/caixinhas para alocação a longo prazo.
- **`/vehicles`**: O Módulo Fleet Tracking/Frota (Gerenciador de Abastecimentos com cruzamento automatizado com Transações contábeis de Combustíveis).

## 🛠 Padrões de Código

Os pacotes base de `Class Validator` e `Class Transformer` atuam integrados nas camadas de entrada do HTTP. Usamos exaustivamente `DTO`s (Data Transfer Objects) tipados, exportando `PartialTypes` para atualizações flexíveis sob nossos controllers unificados.

Soft Deletions não excluem permanentemente informações - em vez disso, atualizam colunas `is_active` e `deleted_at` para presunção de histórico futuro e analítico.

## 🚀 Como Desenvolver

Como o pacote de API faz parte de um Workspace do NPM, normalmente você executará os comandos a partir da **raiz do monorepo**, ou na estrutura individual usando:

```bash
# instalar escopo local (Não costuma ser necessário no uso do root npm)
$ npm install

# Iniciar backend em watch mode (Ideal para desenvolvedores)
$ npm run start:dev

# Limpar TS, buildar main.js final de produção
$ npm run build
```

Para mais informações e comandos integrados, verifique o [`README.md`](../../README.md) principal da raiz do monorepo ou os detalhes de [Arquitetura](../../docs/designs/PROJECT_DESIGN.md).
