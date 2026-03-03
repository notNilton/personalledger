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

### 1.7. Segurança e Privacidade

- **Modo Oculto (Privacy Mode):** Botões rápidos (um "olhinho") para borrar/ocultar todos os numerais de dinheiro na tela quando o usuário estiver em público.
- **Bloqueio Biométrico:** No Mobile, exigir FaceID/TouchID para abrir o aplicativo.
- **Sessão Segura:** Encerramento automático de sessão após tempo de inatividade no Web.

### 1.8. Colaboração Familiar

- **Contas Compartilhadas (Joint Accounts):** Capacidade de convidar um cônjuge ou familiar (outro usuário WorkOS) para visualizar e editar as mesmas transações de uma carteira específica.
- **Divisão de Despesas (Split):** Lançar uma conta de R$ 100,00 e dizer que "50% é meu e 50% do fulano", gerando um controle de quem deve quem.

### 1.9. Gamificação e Saúde Financeira

- **Score Financeiro:** Um algoritmo interno que avalia de 0 a 1000 a saúde financeira do usuário (baseado em: ter reserva de emergência, gastar menos do que ganha e não ter faturas atrasadas).
- **Conquistas (Badges):** Medalhas virtuais por "3 Meses Guardando Dinheiro" ou "Orçamento de Lazer no Verde", para incentivar bons hábitos.

### 1.10. Gestão de Dívidas e Empréstimos

- **Amortização e Juros:** Um módulo especial para registrar um empréstimo ou financiamento (ex: Financiamento Imobiliário), calculando o quanto do pagamento mensal é juros e o quanto abate o montante principal.

### 1.11. Multimoedas e Investimentos (Avançado)

- **Suporte a Moedas Estrangeiras:** Lançamento de carteiras em USD ou EUR para usuários que viajam ou trabalham para fora, com conversão de câmbio estimativo.
- **Tracking de Ativos Variáveis:** Além de saldo em dinheiro, permitir cadastrar criptomoedas (Bitcoin) que buscam cotação base e mudam o patrimônio automaticamente.

### 1.12. Exportação e Contabilidade

- **Relatório para Imposto de Renda:** Exportação detalhada dos totais de saldo do ano fiscal para a declaração de IR.
- **Exportação Otimizada em PDF:** Extratos limpos e com marcação de comprovantes em formato amigável.

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
- **Metas e Dívidas:** Acompanhamento visual de caixinhas para objetivos (ex: Reserva de Emergência) e painel para controle de quitação de empréstimos/financiamentos.
- **Relatórios (Analytics) & Saúde Financeira:** Fluxo de caixa detalhado, Score Financeiro, gráficos de evolução de patrimônio e Month-over-Month.
- **Grupo Familiar:** Tela para gerenciar parceiros de conta conectada, visualizar extratos conjuntos e o rateio do "quem deve a quem".
- **Configurações:** Edição de perfil, gestão de assinatura (Premium), segurança (Biometria, Modo Oculto), conexão com Open Finance e exportação de dados para Imposto de Renda.

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
