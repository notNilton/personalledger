# Plataforma de Gerenciamento de Orçamento Pessoal

Este documento detalha as principais funcionalidades sugeridas para a plataforma de gerenciamento financeiro pessoal, dividida pelos escopos da arquitetura (Frontend Web, Mobile, Backend e Backoffice).

## 1. Funcionalidades Core Expandidas (Para o Usuário Final)

### 1.1. Gestão Omnichannel de Contas e Cartões

- **Múltiplos Tipos de Carteiras:** Conta Corrente, Conta Salário, Poupança, Carteiras Digitais (Mercado Pago, PicPay) e Cofres Físicos (dinheiro em espécie).
- **Cartões de Crédito Inteligentes:**
  - Gestão de múltiplos cartões (bandeiras, limites totais e disponíveis).
  - Cálculo automático da melhor data de compra (baseado no dia de fechamento vs vencimento).
  - Previsão de faturas futuras (projetando compras parceladas).
- **Visão Holding/Consolidada:** Balanço patrimonial automático subtraindo dívidas (faturas abertas) dos ativos (saldos nas contas).

### 1.2. Motor de Lançamentos e Transações

- **Registro de Fricção Zero (Quick Add):** Inserção de valor, conta e categoria com apenas 3 cliques, ideal para a versão mobile.
- **Categorização Inteligente com IA:** Sugestão automática do nome do estabelecimento e da categoria com base no texto digitado ou arquivos OFX importados.
- **Micro-classificação (Tags e Projetos):** Permite cruzar dados (ex: categoria "Transporte", mas com tag `#viagem_disney` para isolar gastos de um evento específico).
- **Recorrência Avançada e Parcelamentos:**
  - Assinaturas fixas (Netflix, Spotify) que se auto-lançam no dia correto.
  - Parcelamentos no cartão de crédito dividindo e alocando corretamente para os meses futuros da fatura correspondente.
- **Anexos em Nuvem:** Foto de cupom fiscal, comprovante de pix ou PDF de serviço prestado associado a cada transação financeira para fins de garantia ou IR.

### 1.3. Orçamentos Estratégicos (Smart Budgeting)

- **Limites Dinâmicos e Elásticos (Envelopamentos):** Sistema inspirado no "Envelope Budgeting" (Zero-based budget). Definição de metas como "R$ 1.200 para Supermercado". Se gastar menos no mês, o saldo pode rolar para o mês seguinte ou ser realocado para outra categoria estourada.
- **Termômetro de Gastos e Alertas (Webhooks/Push):** Barra de progresso visual em tempo real comparando o % do mês já transcorrido com o % do orçamento já gasto (ex: "Você gastou 80% do orçamento de Lazer, mas estamos apenas no dia 10").
- **Planejamento de Metas (Goals):** Criação de caixinhas para objetivos de curto/médio prazo (ex: "Trocar de Carro: R$ 50.000"). A cada depósito, o app atualiza o prazo estimado para conclusão.

### 1.4. Central de Dashboards e Analytics

- **Fluxo de Caixa Detalhado:** Gráfico em cascata (Waterfall) ou Sankey Diagam para mostrar exatamente o caminho que o dinheiro fez desde o recebimento (salário) até onde ele escoou (moradia, alimentação, impostos).
- **Análise Month-over-Month (MoM):** Comparativos visuais mostrando: "Neste mês você gastou 15% a mais em Delivery comparado ao mês anterior".
- **Evolução de Patrimônio Líquido (Net Worth):** Gráfico histórico da riqueza do usuário.

### 1.5. Ecossistema Integrado e Importações

- **Leitura de Código de Barras e Pix Copia e Cola:** No aplicativo Mobile, captura de dados direto da câmera ou clipboard para criar contas a pagar instantaneamente.
- **Importação Simplificada Massiva:** Upload via Web de arquivos OFX, CSV customizáveis e até PDFs de faturas de banco, com um motor de IA de conciliação bancária (matching).
- **Open Finance (Plano Futuro Premium):** Conexão _read-only_ constante com as APIs bancárias (via Belvo ou Pluggy) puxando todas as transações de forma 100% automatizada.

### 1.6. Calendário Financeiro e Centro de Controle

- **Visão de Calendário UI:** Um calendário real mostrando os dias do mês com marcações visuais de quando salários caem e quando cada boleto/fatura vence.
- **Notificações Pró-ativas:** Push notification com o aviso matinal: "Bom dia! Você tem 2 contas vencendo hoje no valor de R$ 150,00".
- **Insights de Dinheiro Livre (Safe-to-Spend):** Um cálculo que subtrai as despesas fixas iminentes do saldo atual da conta e diz ao usuário quanto ele _realmente_ tem livre para gastar hoje sem comprometer os pagamentos daquele mês.

---

## 2. Visão do Backoffice (Para os Administradores)

- **Gestão de Usuários:** Listagem de usuários cadastrados, status da conta (ativo, inativo, banido), e redefinição de senhas.
- **Gestão de Planos e Assinaturas:** Caso o app tenha uma versão Premium (ex: mais de 2 contas, open finance liberado), o backoffice gerencia os planos.
- **Análise de Dados Gerais:** Métricas de uso (DAU/MAU), taxa de conversão para premium e engajamento das funcionalidades.
- **Suporte:** Histórico de tickets ou contatos do usuário com o suporte da plataforma.

---

## 3. Divisão de Frontend Web vs. Mobile App

- **Frontend Web (React):** Focado em análises mais profundas, visualização rica em gráficos, configurações detalhadas e importação de arquivos pesados (CSV/OFX).
- **Mobile (React Native):** Focado no registro rápido e _on-the-go_ de despesas (na fila do mercado, no caixa do restaurante), leitura de código de barras para boletos e recebimento de notificações push.

---

## 4. Tecnologias Mapeadas

- **Backend:** Nest.js + Prisma ORM + PostgreSQL (para garantir tipagem robusta e queries escaláveis de relatórios).
- **Frontend App:** Vite + React (dashboards ricos para o usuário final).
- **Mobile:** React Native (lançamentos rápidos e push notifications).
- **Backoffice:** Vite + React (Painel administrativo interno isolado por segurança).

---

## 5. Mapeamento de Telas (User Flow)

### 5.1. Telas do Frontend Web e Mobile (Usuário Final)

- **Onboarding & Auth:** Login, Cadastro, Recuperação de Senha (via WorkOS) e Setup Inicial (criação da 1ª conta e saldo inicial).
- **Dashboard (Home):** Resumo do mês, saldo atual vs faturas, atalhos de transação rápida e gráfico miniaturizado de despesas.
- **Transações (Extrato):** Lista completa de entradas e saídas com filtros por data, conta, categoria e tags. Botão flutuante para "Nova Transação".
- **Contas & Cartões:** Gerenciamento das carteiras, ajuste de limites de cartão, fechamento e pagamento de fatura.
- **Orçamentos (Budget):** Definição de limites por categoria e visualização das barras de progresso (Termômetro de Gastos).
- **Metas:** acompanhamento visual de caixinhas para objetivos (ex: Reserva de Emergência).
- **Relatórios (Analytics):** Fluxo de caixa detalhado, gráficos de evolução de patrimônio e Month-over-Month.
- **Configurações:** Edição de perfil, gestão de assinatura (Premium), conexão com Open Finance, categorias customizadas e exportação de dados.

### 5.2. Telas do Backoffice (Admin)

- **Dashboard Admin:** Métricas globais (Novos usuários, Active Users, Receita de assinaturas).
- **Gestão de Usuários:** Tabela de usuários, visualização de perfil detalhado (sem expor dados financeiros sensíveis), bloqueio de conta.
- **Auditoria & Logs:** Histórico de ações críticas dentro da plataforma.

---

## 6. Infraestrutura e CI/CD

- **Hospedagem Frontend (Web & Backoffice):** Vercel (ideal para ecossistema React/Next/Vite, com deploy automático rápido).
- **Hospedagem Backend (NestJS):** render.com ou Railway (fácil orquestração de containers Node.js e banco de dados gerenciado com backups automáticos).
- **Banco de Dados:** PostgreSQL hospedado no Render, Railway ou managed service (ex: Neon DB para Serverless Postgres).
- **CI/CD pipeline:**
  - **GitHub Actions:** Pipeline automatizado rodando Lint, Prettier e Testes em cada Pull Request para blindar a `main`.
  - **Deploy Contínuo:** Merge na branch `main` dispara o deploy no Render (Backend) e Vercel (Frontend).
  - **Deploy Mobile:** Integração com EAS (Expo Application Services) / Fastlane para builds automáticos e deploy nas lojas (App Store / Google Play).
