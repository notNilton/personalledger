# Plataforma de Gerenciamento de Orçamento Pessoal

## Reorganização por Fases de Implementação

# 🗓️ Visão Geral das Fases

| Fase       | Período              | Foco Principal          | Entregáveis Chave                                                              |
| ---------- | -------------------- | ----------------------- | ------------------------------------------------------------------------------ |
| **Fase 0** | Pré-MVP (Semana 0-2) | Fundação Técnica        | Infraestrutura, CI/CD, Auth, Schema DB                                         |
| **Fase 1** | Mês 1-3              | MVP Essencial           | Core de transações, importação OFX/CSV, dashboards básicos                     |
| **Fase 2** | Mês 4-6              | Experiência Completa    | Offline-first, cartões inteligentes, orçamentos elásticos, família, webapp |
| **Fase 3** | Mês 7-12             | Inteligência & Predição | IA/LLMs, Open Finance Premium, forecast, detecção de anomalias                 |
| **Fase 4** | Ano 2 (Q1-Q2)        | Marketplace & Ativos    | Multimoedas, cripto, comparador de investimentos, monetização por lead         |
| **Fase 5** | Ano 2 (Q3-Q4)        | Ecossistema B2B2C       | White Label, Módulo Kids, educação financeira gamificada                       |

---

# 🏗️ FASE 0: Fundação e Infraestrutura (Pré-MVP)

_Setup técnico, arquitetura base e pipelines de entrega_

## 0.1. Stack Tecnológica Base

- **Backend:** Nest.js
- **Frontend Web:** Vite + React (dashboards ricos)
- **Mobile:** React Native (lançamentos rápidos + push notifications)
- **webapp:** Vite + React (painel administrativo isolado)
- **Banco de Dados:** Prisma ORM + PostgreSQL (tipagem robusta, queries escaláveis) PostgreSQL com arquitetura de **Partidas Dobradas (Double-Entry Bookkeeping)** desde o dia 1:
  - Todo débito possui crédito correspondente
  - Garantia de integridade: `Ativos = Passivos + Patrimônio`
  - Contas fantasmas para rastreio de despesas sem "vazamento" de saldo

## 0.2. Infraestrutura & Hospedagem

- **Frontend (Web & webapp):** Vercel (deploy automático, ecossistema React/Vite)
- **Backend (NestJS):** Render.com ou Railway (orquestração de containers Node.js + DB gerenciado com backup)
- **Banco de Dados:** PostgreSQL no Render/Railway ou Neon DB (Serverless Postgres)
- **Mensageria & Cache:** RabbitMQ ou Redis (para BullMQ) — essencial para filas de importação pesada e cálculos de dashboard (CQRS/Event Sourcing)

## 0.3. CI/CD & Qualidade de Código

- **GitHub Actions:**
  - Pipeline automatizado: Lint + Prettier + Testes em cada Pull Request
  - Merge na `main` → deploy automático no Render (Backend) e Vercel (Frontend)
- **Mobile Deploy:**
  - Integração com EAS (Expo Application Services) / Fastlane
  - Builds automáticos e deploy nas lojas (App Store / Google Play)

## 0.4. Autenticação & Segurança Base

- **WorkOS:** Login, Cadastro, Recuperação de Senha, Setup Inicial (criação da 1ª conta e saldo inicial)
- **Sessão Segura Web:** Encerramento automático após inatividade
- **Estrutura de Perfis:** Suporte a múltiplos usuários, preparação para contas compartilhadas futuras

## 0.5. Estrutura de Pastas & Monorepo (Opcional)

- Organização inicial dos projetos Web, Mobile, Backend e webapp
- Configuração de shared types entre frontend e backend via Prisma

---

# 🚀 FASE 1: MVP Essencial (Mês 1-3)

_Core funcional para validação de mercado: registro, importação e visualização básica_

## 1.1. Gestão Básica de Contas e Carteiras

- **Tipos de Carteiras Suportadas:**
  - Conta Corrente, Conta Salário, Poupança
  - Carteiras Digitais (Mercado Pago, PicPay)
  - Cofres Físicos (dinheiro em espécie)
- **Operações Básicas:** Criar, editar, arquivar contas; ajuste manual de saldo inicial

## 1.2. Motor de Lançamentos (Core)

- **Quick Add (Mobile):** Inserção de valor, conta e categoria com apenas 3 cliques — prioridade máxima para UX mobile
- **Categorização Automática Inicial:** Algoritmo baseado em regras (Regex/String Matching) para auto-categorizar nomes de estabelecimentos
- **Transações Manuais:** Registro completo de entradas/saídas com data, descrição, valor, conta, categoria
- **Filtros Básicos de Extrato:** Por data, conta, categoria

## 1.3. Importação de Dados (Prioridade 1)

- **Importação de OFX/CSV:**
  - Upload massivo de extratos bancários como motor automatizado principal do MVP
  - Evita custos operacionais altos com Open Finance no início
- **Arquitetura Assíncrona para Importação:**
  - Upload dispara evento para fila (RabbitMQ/BullMQ)
  - Workers processam categorização e conciliação em background
  - Notificação ao usuário via WebSockets/Server-Sent Events (SSE) ao concluir

## 1.4. Dashboards & Analytics Básicos

- **Dashboard Home:**
  - Resumo do mês, saldo atual vs faturas
  - Atalhos para transação rápida
  - Gráfico miniaturizado de despesas por categoria
- **Fluxo de Caixa Simples:** Visualização básica de entradas vs saídas no período
- **Reconciliação e Saldo Histórico:** Cálculo confiável de saldo ao longo do tempo (alta complexidade, mas essencial para MVP)

## 1.5. Orçamentos Básicos (Smart Budgeting Lite)

- **Limites por Categoria:** Definição de metas como "R$ 1.200 para Supermercado"
- **Termômetro Visual Simples:** Barra de progresso comparando % do mês transcorrido vs % do orçamento gasto

## 1.6. Segurança & Privacidade Básica

- **Modo Oculto (Privacy Mode):** Botão "olhinho" para borrar numerais de dinheiro na tela
- **Bloqueio Biométrico Mobile:** Exigir FaceID/TouchID para abrir o aplicativo
- **Criptografia de Dados Sensíveis:** Proteção de informações financeiras em repouso e trânsito

## 1.7. Telas Entregues (User Flow MVP)

### Usuário Final (Web & Mobile)

- **Onboarding & Auth:** Login, Cadastro, Recuperação de Senha (WorkOS), Setup Inicial
- **Dashboard (Home):** Resumo mensal, saldo, atalhos, gráfico mini
- **Transações (Extrato):** Lista com filtros básicos, botão flutuante "Nova Transação"
- **Contas & Carteiras:** Gerenciamento simples de carteiras e saldos
- **Orçamentos (Budget):** Definição de limites por categoria + barra de progresso
- **Configurações:** Edição de perfil, segurança (biometria, modo oculto), exportação básica

### webapp (Admin)

- **Dashboard Admin:** Métricas globais simples (novos usuários, active users)
- **Gestão de Usuários:** Listagem, status (ativo/inativo/banido), redefinição de senha

## 1.8. Funcionalidades Não Incluídas no MVP (Para Fases Seguintes)

> _Estes itens estão no escopo total, mas foram postergados intencionalmente para validação inicial:_

- Cartões de crédito inteligentes (cálculo de melhor data, previsão de faturas)
- Recorrência avançada e parcelamentos complexos
- Micro-classificação com tags e projetos cruzados
- Anexos em nuvem (fotos, PDFs)
- Orçamentos elásticos (rollover de saldo entre categorias)
- Dashboards avançados (Sankey, MoM, Net Worth histórico)
- Open Finance, IA, multimoedas, cripto, marketplace, B2B

---

# ✨ FASE 2: Experiência Completa & Colaboração (Mês 4-6)

_Refinamento da UX, recursos avançados de gestão e trabalho em equipe_

## 2.1. Mobile Offline-First (Crítico)

- **Banco de Dados Local:** SQLite ou WatermelonDB para cadastro sem internet
- **Fila de Sincronização:** Background sync automático ao reconectar
- **Resiliência:** Garantia de que nenhum lançamento seja perdido em áreas sem cobertura

## 2.2. Cartões de Crédito Inteligentes

- **Gestão de Múltiplos Cartões:** Bandeiras, limites totais e disponíveis por cartão
- **Cálculo da Melhor Data de Compra:** Algoritmo baseado em dia de fechamento vs vencimento
- **Previsão de Faturas Futuras:** Projeção automática de compras parceladas nos meses seguintes
- **Conciliação Automática de Faturas:** Pagamento de fatura atualiza saldo e histórico de forma integrada

## 2.3. Recorrência Avançada & Parcelamentos

- **Assinaturas Fixas:** Netflix, Spotify etc. que se auto-lançam no dia correto
- **Parcelamentos no Cartão:** Divisão automática do valor total e alocação correta nas faturas futuras
- **Edição em Lote:** Alterar recorrências ou parcelamentos existentes com propagação controlada

## 2.4. Orçamentos Estratégicos (Smart Budgeting Completo)

- **Limites Dinâmicos e Elásticos (Envelope Budgeting):**
  - Sistema Zero-based budget: "R$ 1.200 para Supermercado"
  - Rollover automático: saldo não gasto rola para o mês seguinte OU é realocado para categoria estourada
- **Termômetro de Gastos com Alertas:**
  - Barra de progresso em tempo real
  - Webhooks/Push notifications: "Você gastou 80% do orçamento de Lazer, mas estamos apenas no dia 10"
- **Planejamento de Metas (Goals):**
  - Caixinhas para objetivos (ex: "Trocar de Carro: R$ 50.000")
  - Cálculo automático de prazo estimado conforme depósitos são realizados

## 2.5. Central de Dashboards Avançada

- **Fluxo de Caixa Detalhado:**
  - Gráfico em cascata (Waterfall) ou Sankey Diagram
  - Mostra o caminho do dinheiro: salário → moradia, alimentação, impostos etc.
- **Análise Month-over-Month (MoM):**
  - Comparativos visuais: "Neste mês você gastou 15% a mais em Delivery comparado ao mês anterior"
- **Evolução de Patrimônio Líquido (Net Worth):**
  - Gráfico histórico da riqueza do usuário (ativos - passivos)

## 2.6. Calendário Financeiro & Centro de Controle

- **Visão de Calendário UI:**
  - Calendário real com marcações visuais de salários, boletos e faturas
  - Cores e ícones para diferentes tipos de transação
- **Notificações Pró-ativas:**
  - Push matinal: "Bom dia! Você tem 2 contas vencendo hoje no valor de R$ 150,00"
- **Insights de Dinheiro Livre (Safe-to-Spend):**
  - Cálculo: saldo atual - despesas fixas iminentes = quanto o usuário pode gastar hoje sem comprometer o mês

## 2.7. Colaboração Familiar

- **Contas Compartilhadas (Joint Accounts):**
  - Convite para cônjuge/familiar (outro usuário WorkOS) visualizar/editar transações de carteira específica
  - Permissões granulares (somente leitura vs edição)
- **Divisão de Despesas (Split):**
  - Lançar conta de R$ 100,00 e definir "50% meu / 50% fulano"
  - Controle de "quem deve a quem" com histórico de acertos

## 2.8. Gamificação & Saúde Financeira (Básica)

- **Score Financeiro (0-1000):**
  - Algoritmo baseado em: reserva de emergência, gastar menos do que ganha, sem faturas atrasadas
- **Conquistas (Badges):**
  - Medalhas virtuais: "3 Meses Guardando Dinheiro", "Orçamento de Lazer no Verde"
  - Incentivo a bons hábitos com feedback positivo

## 2.9. Gestão de Dívidas e Empréstimos

- **Módulo de Amortização e Juros:**
  - Registro de empréstimos/financiamentos (ex: Imobiliário, Veicular)
  - Cálculo mensal: quanto é juros vs quanto abate o principal
  - Projeção de quitação e economia com amortizações extras

## 2.10. Gestão de Veículos e Abastecimentos (Fleet Module)

- **Cadastro de Veículos:**
  - Frota pessoal com placa, modelo, ano e tipo de combustível
  - Atribuição de um veículo em cada novo `abastecimento` ou `manutenção`
- **Controle de Abastecimento (Fuel Tracking):**
  - Entrada de dados: Quilometragem atual (Odômetro), Litros abastecidos, Preço por Litro, Posto de Gasolina
  - Transação Financeira: O Gasto reflete automaticamente no Extrato/Budget de "Transporte/Combustível"
- **Analytics de Frota:**
  - Cálculo automático de Autonomia (km/L ou km/kWh)
  - Custo real por Quilômetro Rodado (R$/km)
  - Histórico de variação do Preço do Combustível ao longo do tempo

## 2.10. Exportação & Contabilidade

- **Relatório para Imposto de Renda:**
  - Exportação detalhada dos totais de saldo do ano fiscal para declaração de IR
- **Exportação Otimizada em PDF:**
  - Extratos limpos, com marcação de comprovantes, formato amigável para impressão/compartilhamento

## 2.11. webapp Completo

- **Gestão de Usuários Avançada:**
  - Listagem com filtros, visualização de perfil detalhado (sem expor dados financeiros sensíveis), bloqueio de conta
- **Gestão de Planos e Assinaturas:**
  - Controle de planos Premium (ex: +2 contas, Open Finance liberado)
  - Integração com **Stripe (Web)** e **RevenueCat (Mobile)** para faturamento unificado App Store/Google Play
- **Análise de Dados Gerais:**
  - Métricas de uso: DAU/MAU, taxa de conversão para premium, engajamento por funcionalidade
- **Suporte Integrado:**
  - Histórico de tickets/contatos do usuário com o suporte da plataforma

## 2.12. Telas Adicionais Entregues

### Usuário Final

- **Metas e Dívidas:** Acompanhamento visual de caixinhas + painel de quitação de empréstimos
- **Relatórios (Analytics) & Saúde Financeira:** Fluxo de caixa detalhado, Score, gráficos MoM e Net Worth
- **Grupo Familiar:** Gerenciar parceiros, extratos conjuntos, rateio "quem deve a quem"
- **Configurações Avançadas:** Gestão de assinatura Premium, conexão futura com Open Finance, exportação IR

### webapp

- **Auditoria & Logs:** Histórico de ações críticas dentro da plataforma para compliance e debugging

---

# 🧠 FASE 3: Inteligência Artificial e Predição (Mês 7-12)

_O app deixa de ser reativo e passa a ser preditivo e consultivo_

## 3.1. IA de Categorização Semântica

- **LLMs para Descrição de Extratos:**
  - Uso de GPT-4o, Gemini ou modelos open-source fine-tuned
  - Exemplo: "EST-9922-SÃO-PAULO" → identificado como "Posto de Gasolina - Combustível"
- **Aprendizado Contínuo:**
  - Correções do usuário alimentam o modelo para melhorar precisão ao longo do tempo
- **Fallback para Regras:**
  - Se a IA não confiar na predição, recai para o sistema de regras da Fase 1

## 3.2. Previsão de Saldo (Cashflow Forecasting)

- **Algoritmo Preditivo:**
  - Analisa histórico de receitas/despesas recorrentes e sazonais
  - Projeta saldo para os próximos 30, 60 e 90 dias
- **Alertas de Furo de Caixa:**
  - Notificação proativa: "Atenção: baseado nos seus padrões, seu saldo pode ficar negativo em 12 dias"
- **Simulador de Cenários:**
  - "E se eu gastar R$ 200 a mais em Lazer este mês?" → impacto projetado no forecast

## 3.3. Detecção de Anomalias

- **Monitoramento Contextual:**
  - "Detectamos que sua conta de luz veio 40% acima da média dos últimos 3 meses"
  - "Transação de R$ 500 em estabelecimento nunca antes visitado — foi você?"
- **Aprendizado de Padrões Pessoais:**
  - O sistema entende o perfil de gastos do usuário e sinaliza desvios significativos

## 3.4. Chatbot Consultivo (Financial Coach)

- **Interface de Chat Natural:**
  - Perguntas como: "Quanto gastei com iFood nos últimos 3 meses?", "Posso comprar um celular de R$ 3.000 sem comprometer minhas metas?"
- **Respostas Baseadas no Próprio Orçamento:**
  - O chatbot acessa os dados do usuário (com permissão) para dar conselhos personalizados
- **Sugestões Proativas:**
  - "Você tem R$ 800 sobrando no orçamento de Lazer — que tal alocar para sua meta de Viagem?"

## 3.5. Open Finance (Premium)

- **Conexão Read-Only Constante:**
  - Integração com APIs bancárias via Belvo ou Pluggy
  - Sincronização automática de transações sem necessidade de upload manual
- **Modelo de Monetização:**
  - Devido ao custo por usuário ativo, feature atrelada estritamente ao plano Premium
  - Toggle nas configurações para ativar/desativar por instituição financeira
- **Conciliação Automática Aprimorada:**
  - Transações importadas via Open Finance são automaticamente conciliadas com lançamentos manuais ou importados

## 3.6. Micro-classificação Avançada (Tags & Projetos)

- **Cruzamento de Dados Inteligente:**
  - Categoria "Transporte" + tag `#viagem_disney` = isolar gastos de evento específico
  - Relatórios filtráveis por múltiplas dimensões: categoria + tag + projeto + período
- **Autotagging com IA:**
  - Sugestão automática de tags baseada em descrição, local, valor e histórico

## 3.7. Anexos em Nuvem com OCR Básico

- **Upload de Comprovantes:**
  - Foto de cupom fiscal, comprovante de Pix ou PDF de serviço associado à transação
- **OCR para Extração de Dados:**
  - Leitura automática de valor, data e estabelecimento a partir da imagem (reduz digitação manual)
- **Armazenamento Seguro:**
  - Arquivos criptografados, com acesso restrito ao proprietário e colaboradores autorizados

## 3.8. Infraestrutura de IA & Escala

| Tecnologia                                       | Finalidade                                                                                |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| **Vector Database (Pinecone/Weaviate/pgvector)** | Armazenar embeddings de transações para busca semântica livre e cruzamentos de IA rápidos |
| **Cache de Modelos (Redis)**                     | Reduzir latência em inferências frequentes de categorização e forecast                    |
| **Filas de Inferência (RabbitMQ)**               | Processamento assíncrono de requisições a LLMs para não bloquear a UX                     |

---

# 💰 FASE 4: Marketplace e Open Finance Ativo (Ano 2, Q1-Q2)

_Transformação em hub de serviços financeiros com monetização por lead qualificado_

## 4.1. Comparador de Investimentos

- **Sugestão Inteligente de Aplicações:**
  - Se o usuário tem dinheiro parado na conta, o app sugere CDBs, LCIs, LCAs com melhor rendimento líquido
- **Perfil de Investidor:**
  - Questionário inicial para entender tolerância a risco e objetivos
- **Integração com Corretoras (Parcerias):**
  - Redirecionamento seguro para abertura de conta ou aplicação direta (receita por lead/conversão)

## 4.2. Otimização de Crédito

- **Análise de Taxas de Juros Atuais:**
  - Comparativo dos empréstimos ativos do usuário com ofertas de mercado
- **Sugestão de Portabilidade:**
  - "Você pode economizar R$ 1.200/ano trocando seu empréstimo pessoal do Banco X pelo Banco Y"
- **Simulador de Renegociação:**
  - Impacto de alongar prazo, reduzir parcela ou amortizar principal

## 4.3. Recuperação de Cashback & Taxas

- **Integração com APIs de Programas de Fidelidade:**
  - Detecta compras elegíveis em parceiros e notifica o usuário para resgatar cashback
- **Alertas de Taxas Evitáveis:**
  - "Você pagou taxa de saque no Banco X — use a conta Y para isenção"
- **Histórico de Economia Gerada:**
  - Dashboard mostrando quanto o usuário economizou usando as sugestões do app

## 4.4. Multimoedas & Conversão Estimativa

- **Suporte a Carteiras em USD, EUR, etc.:**
  - Lançamento de transações em moeda estrangeira para usuários que viajam ou trabalham para fora
- **Conversão de Câmbio Estimativa:**
  - Usa cotação do dia ou média mensal para converter e consolidar no patrimônio em BRL
- **Proteção Cambial (Futuro):**
  - Alertas de variação cambial impactando patrimônio (base para features de hedge)

## 4.5. Tracking de Ativos Variáveis

- **Criptomoedas:**
  - Cadastro de Bitcoin, Ethereum etc. com busca automática de cotação em tempo real
  - Atualização automática do patrimônio conforme o mercado se move
- **Ações e Fundos (Futuro):**
  - Integração com APIs de corretoras para importar posições de investimentos variáveis
- **Consolidação de Patrimônio Total:**
  - Visão unificada: dinheiro em conta + investimentos + cripto + bens físicos (opcional)

## 4.6. Monetização Avançada

- **Receita por Lead Qualificado:**
  - Cada sugestão de investimento, portabilidade ou cashback gera potencial receita via parceria
- **Planos Tiered Premium:**
  - Basic (gratuito), Plus (Open Finance + IA básica), Pro (marketplace + consultoria avançada)
- **Analytics de Conversão no webapp:**
  - Métricas de clique, conversão e receita por feature de marketplace

---

# 🌐 FASE 5: B2B2C e Educação (Ano 2, Q3-Q4)

_Expansão do modelo de negócio para além do usuário final direto_

## 5.1. White Label para Empresas (Benefício Corporativo)

- **Versão do App para RHs:**
  - Saúde financeira como benefício corporativo, com branding da empresa contratante
- **Dashboards Anonimizados para Gestores:**
  - Métricas agregadas de saúde financeira dos colaboradores (sem expor dados individuais)
- **Programas de Incentivo:**
  - Empresas podem criar metas coletivas (ex: "Time que mais economizar ganha um dia off")

## 5.2. Módulo Kids/Teen (Educação Financeira Familiar)

- **Contas Dependentes:**
  - Pais criam sub-contas para filhos com limites e permissões configuráveis
- **Mesada Educativa:**
  - Programação de repasses automáticos com tarefas associadas (ex: "Complete 3 atividades para liberar mesada")
- **Aprovação de Gastos em Tempo Real:**
  - Notificação para pais quando filho tenta gastar acima do combinado — aprovação/recusa via app
- **Interface Gamificada para Teens:**
  - Design adaptado, linguagem acessível, conquistas por economia e planejamento

## 5.3. Trilhas de Aprendizado Gamificadas

- **Micro-cursos Contextuais:**
  - Conteúdo liberado conforme comportamento: "Viemos notar que você gastou muito com delivery — que tal uma dica de meal prep?"
- **Badges de Conhecimento:**
  - Medalhas por completar módulos: "Mestre do Orçamento", "Investidor Iniciante"
- **Progressão com Recompensas:**
  - Concluir trilhas pode desbloquear features Premium por tempo limitado ou descontos em parceiros

## 5.4. Expansão de Verticais B2B2C

- **Parcerias com Fintechs e Bancos:**
  - Oferecer o motor de orçamento como módulo embutido em outros apps financeiros
- **APIs Públicas (Futuro):**
  - Desenvolvedores terceiros podem construir integrações sobre a plataforma (com controle de acesso e monetização)
- **Ecossistema de Add-ons:**
  - Plugins para nichos: freelancers, MEIs, aposentados, estudantes — cada um com regras e dashboards específicos

---

# 🔄 Mapeamento Cruzado: Funcionalidades por Fase (Resumo)

| Funcionalidade Original         | Fase   | Justificativa                                                    |
| ------------------------------- | ------ | ---------------------------------------------------------------- |
| Quick Add (Mobile)              | Fase 1 | Core de UX mobile, alto impacto, baixa complexidade              |
| Importação OFX/CSV              | Fase 1 | Automatização essencial sem custo de Open Finance                |
| Safe-to-Spend                   | Fase 1 | Diferencial de mercado com cálculo simples                       |
| Reconciliação e Saldo Histórico | Fase 1 | Base contábil confiável (double-entry)                           |
| Categorização por Regras        | Fase 1 | Suficiente para MVP, evolui para IA depois                       |
| Dashboards Básicos              | Fase 1 | Visualização mínima para tomada de decisão                       |
| Mobile Offline-First            | Fase 2 | Melhora significativa de UX, depende de estrutura de sync        |
| Cartões Inteligentes            | Fase 2 | Requer histórico e lógica de fatura madura                       |
| Orçamentos Elásticos            | Fase 2 | Complexidade de negócio, requer base de lançamentos estável      |
| Colaboração Familiar            | Fase 2 | Feature social que depende de perfis e permissões consolidados   |
| Gamificação Básica              | Fase 2 | Engajamento após usuário já estar ativo e registrando dados      |
| Gestão de Dívidas               | Fase 2 | Módulo especializado que requer estrutura de amortização         |
| Open Finance                    | Fase 3 | Custo alto, justificado apenas com base de usuários Premium      |
| IA de Categorização             | Fase 3 | Requer volume de dados e infraestrutura de ML vetorial           |
| Forecast & Anomalias            | Fase 3 | Preditivo só faz sentido com histórico consistente               |
| Chatbot Consultivo              | Fase 3 | IA generativa requer contexto rico e controle de alucinação      |
| Multimoedas & Cripto            | Fase 4 | Nicho avançado, depende de consolidação de patrimônio madura     |
| Marketplace de Investimentos    | Fase 4 | Monetização por lead exige base de usuários engajada e confiável |
| White Label B2B                 | Fase 5 | Expansão de modelo de negócio após validação B2C                 |
| Módulo Kids/Teen                | Fase 5 | Requer controle parental robusto e compliance com LGPD infantil  |

---

# 📋 Tabela de Priorização Reafirmada (MVP = Fase 1)

| Funcionalidade                      | Impacto | Complexidade | Fase   | Status                          |
| ----------------------------------- | ------- | ------------ | ------ | ------------------------------- |
| **Quick Add (Mobile)**              | Alto    | Baixa        | Fase 1 | ✅ Prioridade 1                 |
| **Importação de OFX/CSV**           | Alto    | Média        | Fase 1 | ✅ Prioridade 1                 |
| **Safe-to-Spend**                   | Alto    | Baixa        | Fase 1 | ✅ Diferencial de Mercado       |
| **Reconciliação e Saldo Histórico** | Alto    | Alta         | Fase 1 | ✅ Prioridade 1 (core contábil) |
| **Categorização por Regras**        | Médio   | Baixa        | Fase 1 | ✅ Base para IA futura          |
| **Gamificação/Badges**              | Baixo   | Média        | Fase 2 | ⏭️ Postergável                  |
| **Open Finance API**                | Médio   | Alta         | Fase 3 | ⏭️ Postergável (Custo)          |
| **IA Preditiva (LLMs)**             | Alto    | Alta         | Fase 3 | ⏭️ Requer escala e dados        |
| **Marketplace de Crédito**          | Alto    | Alta         | Fase 4 | ⏭️ Monetização avançada         |
| **White Label B2B**                 | Alto    | Muito Alta   | Fase 5 | ⏭️ Expansão estratégica         |

---

# 🧭 Roadmap Macro Consolidado

1. **Fase 0 (Pré-MVP | Semanas 0-2)**  
   → Infraestrutura, CI/CD, Auth, Schema DB Double-Entry

2. **Fase 1 (MVP | Meses 1-3)**  
   → Core: Quick Add, Importação OFX/CSV, Lançamentos manuais, Dashboards básicos, Safe-to-Spend, Reconciliação, Segurança básica

3. **Fase 2 (Experiência Completa | Meses 4-6)**  
   → Offline-first, Cartões inteligentes, Orçamentos elásticos, Família, webapp completo, Gamificação básica, Gestão de dívidas, Exportação IR

4. **Fase 3 (Inteligência | Meses 7-12)**  
   → IA de categorização, Forecast de saldo, Detecção de anomalias, Chatbot consultivo, Open Finance Premium, Vector DB, Micro-tags avançadas

5. **Fase 4 (Marketplace | Ano 2 Q1-Q2)**  
   → Comparador de investimentos, Otimização de crédito, Cashback, Multimoedas, Cripto, Monetização por lead

6. **Fase 5 (Ecossistema | Ano 2 Q3-Q4)**  
   → White Label corporativo, Módulo Kids/Teen, Trilhas educacionais gamificadas, Expansão B2B2C
