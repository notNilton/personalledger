# Arquitetura de Banco de Dados (Prisma + PostgreSQL + WorkOS)

A arquitetura do banco foi desenhada para suportar alto volume de transações por usuário, mantendo a performance das queries analíticas (dashboards). Sendo integrada ao **WorkOS**, não armazenamos senhas ou dados complexos de autenticação, apenas delegamos o ID externo.

---

## 1. Gestão de Usuários (Integração WorkOS)

O WorkOS cuidará do Auth (SSO, Magic Link, MFA). O nosso banco de dados apenas espelha o perfil essencial para vincular as transações.

```prisma
model User {
  id              String   @id @default(uuid())
  workosId        String   @unique // ID retornado pelo WorkOS
  email           String   @unique
  name            String?
  avatarUrl       String?

  // Controle de Plano (Premium vs Grátis)
  subscriptionTier String  @default("FREE")

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relacionamentos
  accounts        Account[]        @relation("AccountOwner")
  sharedAccounts  AccountAccess[]  // Contas onde o usuário é convidado
  categories      Category[]
  transactions    Transaction[]
  budgets         Budget[]
  goals           Goal[]
  vehicles        Vehicle[]
}
```

---

## 2. Carteiras, Contas e Cartões

Diferencia as contas correntes (que possuem saldo em dinheiro) dos cartões de crédito (que possuem limite e data de vencimento).

```prisma
enum AccountType {
  CHECKING       // Conta Corrente
  SAVINGS        // Poupança
  CREDIT_CARD    // Cartão de Crédito
  CASH           // Dinheiro Físico
  WALLET         // Mercado Pago, PicPay
  INVESTMENT     // Investimentos
}

model Account {
  id              String      @id @default(uuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  name            String      @db.VarChar(100) // ex: "Nubank", "Itaú"
  type            AccountType
  color           String?     @db.VarChar(7)   // Cor customizável no app HEX
  icon            String?     // Ícone selecionado
  currencyCode    String      @default("BRL") @db.VarChar(3) // Ex: BRL, USD, EUR

  // Suporte a Contas Conjuntas (Grupo Familiar)
  isShared        Boolean     @default(false)
  sharedWith      AccountAccess[]

  // Para contas normais
  balance         Decimal     @default(0.00) @db.Decimal(12, 2)

  // Para contas tipo CREDIT_CARD
  creditLimit     Decimal?    @db.Decimal(12, 2)
  closingDay      Int?        // Dia que a fatura fecha (1-31)
  dueDay          Int?        // Dia do vencimento (1-31)

  includeInTotal  Boolean     @default(true) // Se 'false', não entra no Net Worth

  // Controle de Soft Delete
  isActive        Boolean     @default(true)
  deletedAt       DateTime?

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  transactions    Transaction[]
  balanceHistory  BalanceHistory[]
  statements      CreditCardStatement[]
}

// Tabela Pivo para Grupo Familiar / Contas Conjuntas
model AccountAccess {
  id              String      @id @default(uuid())
  accountId       String
  account         Account     @relation(fields: [accountId], references: [id], onDelete: Cascade)

  userId          String
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  role            AccessRole  @default(VIEWER) // EDITOR ou VIEWER

  createdAt       DateTime    @default(now())

  @@unique([accountId, userId])
}

enum AccessRole {
  EDITOR
  VIEWER
}

model CreditCardStatement {
  id              String      @id @default(uuid())
  accountId       String
  account         Account     @relation(fields: [accountId], references: [id], onDelete: Cascade)

  month           Int         // 1-12
  year            Int         // 2024

  status          StatementStatus @default(OPEN)
  totalAmount     Decimal     @default(0.00) @db.Decimal(12, 2)
  paidAmount      Decimal     @default(0.00) @db.Decimal(12, 2)

  dueDate         DateTime    @db.Date
  closingDate     DateTime    @db.Date

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  transactions    Transaction[]

  @@unique([accountId, month, year])
}

enum CardType {
  CREDIT
  DEBIT
}

model Card {
  id              String      @id @default(uuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  accountId       String
  account         Account     @relation(fields: [accountId], references: [id], onDelete: Cascade)

  name            String      @db.VarChar(100)
  brand           String?
  last4           String?

  type            CardType
  creditLimit     Decimal?    @db.Decimal(12, 2)

  // Opcional: permite que cada cartão tenha seu próprio fechamento/vencimento.
  // Útil quando múltiplos cartões compartilham a mesma conta.
  closingDay      Int?
  dueDay          Int?

  isActive        Boolean     @default(true)
  deletedAt       DateTime?

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  transactions    Transaction[]
}

enum StatementStatus {
  OPEN
  CLOSED
  PAID
}

model BalanceHistory {
  id              String      @id @default(uuid())
  accountId       String
  account         Account     @relation(fields: [accountId], references: [id], onDelete: Cascade)

  date            DateTime    @db.Date // Snapshot de fim de dia (ex: 2026-03-02)
  balance         Decimal     @db.Decimal(12, 2)

  createdAt       DateTime    @default(now())

  // Garante que só há um snapshot de saldo por dia por conta
  @@unique([accountId, date])
}
```

---

## 3. Categorização e Tags

Categorias com suporte a hierarquia (Subcategorias) e ícones personalizados para dashboards bonitos.

```prisma
model Category {
  id              String     @id @default(uuid())
  userId          String     // Se for null, é uma categoria padrão do sistema
  user            User?      @relation(fields: [userId], references: [id], onDelete: Cascade)

  name            String     @db.VarChar(50)
  icon            String?
  color           String?    @db.VarChar(7)
  type            TransactionType // RECEITA ou DESPESA

  // Sistema de hierarquia (Subcategoria)
  parentId        String?
  parent          Category?  @relation("SubCategories", fields: [parentId], references: [id], onDelete: SetNull)
  children        Category[] @relation("SubCategories")

  transactions    Transaction[]
  budgets         Budget[]

  @@unique([userId, name, type]) // Não deixa duplicar o mesmo nome na mesma conta/tipo
}

model Tag {
  id              String        @id @default(uuid())
  name            String        // ex: "#viagem", "#carro_novo"

  transactions    Transaction[]
}
```

---

## 4. O Motor Financeiro: Transações

A tabela central. Precisa ser rica para suportar faturas de cartão e recorrências.

```prisma
enum TransactionType {
  INCOME       // Receita
  EXPENSE      // Despesa
  TRANSFER     // Transferência entre contas
  ADJUSTMENT   // Ajustes/estornos que não devem afetar relatórios como receita/despesa
}

enum TransactionStatus {
  PENDING      // Não pago / Fatura aberta
  COMPLETED    // Efetuado / Pago
  CANCELED     // Cancelado
}

model Transaction {
  id              String            @id @default(uuid())
  userId          String
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  accountId       String
  account         Account           @relation(fields: [accountId], references: [id], onDelete: Cascade)

  categoryId      String?
  category        Category?         @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  // Tags associadas (Many-to-Many)
  tags            Tag[]

  type            TransactionType
  amount          Decimal           @db.Decimal(12, 2) // SEMPRE positivo. O tipo diz se é entrada ou saída.
  date            DateTime          // Data em que ocorreu de fato
  description     String            @db.VarChar(255)
  notes           String?           @db.Text

  status          TransactionStatus @default(COMPLETED)

  // Para anexos (S3 ou similar)
  attachmentUrl   String?
  currencyCode    String            @default("BRL") @db.VarChar(3)

  // Vinculação com Fatura de Cartão
  statementId     String?
  statement       CreditCardStatement? @relation(fields: [statementId], references: [id], onDelete: SetNull)

  // Vinculação com Metas/Goals
  goalId          String?
  goal            Goal?             @relation(fields: [goalId], references: [id], onDelete: SetNull)

  // Para parcelamentos e recorrências (Ligação Forte)
  installmentId   String?
  installment     Installment?      @relation(fields: [installmentId], references: [id], onDelete: Cascade)
  installmentNum  Int?              // Ex: Parcela 1
  totalInstallments Int?            // Ex: de 12

  // Para Transferências (Ponte com a tabela Transfer)
  transferOut       Transfer?         @relation("TransferSource")
  transferIn        Transfer?         @relation("TransferDestination")

  // Opcional: guarda o id da transação original (ex.: estorno/ajuste).
  originalTransactionId String?

  // Controle de Soft Delete
  isActive        Boolean           @default(true)
  deletedAt       DateTime?

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  // Abastecimento
  refuelingLog    RefuelingLog?

  @@index([date])
  @@index([userId, date])
}

model Transfer {
  id                      String      @id @default(uuid())

  // Transação de Saída (Origem)
  sourceTransactionId     String      @unique
  sourceTransaction       Transaction @relation("TransferSource", fields: [sourceTransactionId], references: [id], onDelete: Cascade)

  // Transação de Entrada (Destino)
  destinationTransactionId String     @unique
  destinationTransaction  Transaction @relation("TransferDestination", fields: [destinationTransactionId], references: [id], onDelete: Cascade)

  createdAt               DateTime    @default(now())
}

// Entidade "Pai" para agrupar as compras parceladas no cartão de crédito
model Installment {
  id              String         @id @default(uuid())
  userId          String

  totalAmount     Decimal        @db.Decimal(12, 2)
  totalParts      Int            // Quantas vezes foi dividido

  description     String         @db.VarChar(255)
  date            DateTime       // Data original da compra

  transactions    Transaction[]  // As N transações geradas para os próximos meses

  createdAt       DateTime       @default(now())
}
```

---

## 5. Orçamentos (Smart Budgeting)

O envelompamento por categoria.

```prisma
enum BudgetPeriod {
  MONTHLY
  WEEKLY
  YEARLY
}

model Budget {
  id              String     @id @default(uuid())
  userId          String
  user            User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  categoryId      String?    // Se null, é o orçamento total do mês
  category        Category?  @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  amountLimit     Decimal    @db.Decimal(12, 2) // Quanto planeja gastar
  month           Int        // 1-12
  year            Int        // 2024, 2025

  // Mantém compatibilidade com o modelo atual (month/year),
  // mas permite expandir o domínio para outros períodos.
  period          BudgetPeriod @default(MONTHLY)

  // Rolagem de limite (Zero-based budgeting)
  rolloverAmount  Decimal    @default(0.00) @db.Decimal(12, 2)

  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  @@unique([userId, categoryId, month, year])
}
```

---

## 6. Metas e Caixinhas

A economia de curto/médio prazo.

```prisma
model Goal {
  id              String     @id @default(uuid())
  userId          String
  user            User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  name            String     @db.VarChar(100) // ex: "Viagem Europa"
  targetAmount    Decimal    @db.Decimal(12, 2) // Quanto quer juntar
  currentAmount   Decimal    @default(0.00) @db.Decimal(12, 2) // Quanto já juntou

  deadline        DateTime?  // Prazo (ex: dez/2026)
  color           String?    @db.VarChar(7)
  icon            String?

  transactions    Transaction[] // Transações que alimentaram ou sacaram a meta

  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
}

```

---

## 6.5. Veículos e Abastecimento (Fleet & Fuel Tracking)

Módulo dedicado para vincular gastos automotivos (combustível, manutenção) ao cálculo de autonomia, hodômetro e custo por km.

```prisma
model Vehicle {
  id              String         @id @default(uuid())
  userId          String
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  name            String         @db.VarChar(100) // ex: "Honda Civic 2021"
  licensePlate    String?        @db.VarChar(10)
  make            String?        @db.VarChar(50)  // Marca
  model           String?        @db.VarChar(50)  // Modelo
  year            Int?

  // Controle de Soft Delete
  isActive        Boolean        @default(true)
  deletedAt       DateTime?

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  refuelings      RefuelingLog[]
}

model RefuelingLog {
  id              String      @id @default(uuid())
  vehicleId       String
  vehicle         Vehicle     @relation(fields: [vehicleId], references: [id], onDelete: Cascade)

  // O abstrato da despesa vira uma Transaction comum. Isso acopla todo o custo do posto na DB
  transactionId   String      @unique
  transaction     Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)

  odometer        Decimal     @db.Decimal(10, 2) // Hodômetro atual no painel (km)
  fuelLiters      Decimal     @db.Decimal(8, 3)  // Quantidade de Litros/M³ abastecidos
  pricePerLiter   Decimal     @db.Decimal(8, 3)  // Custo unitário do volume pago
  isFullTank      Boolean     @default(true)     // Encheu o tanque? (Necessário para cálculo exato de km/l)

  createdAt       DateTime    @default(now())
}
```

---

## 7. Trilhas de Auditoria (Audit Log)

Essencial para conformidade e rastreabilidade de ações críticas (como mudar limite do cartão, trocar plano, deletar conta).

```prisma
model AuditLog {
  id              String   @id @default(uuid())
  userId          String?  // Quem fez a ação (pode ser null se for o sistema via rotina)

  action          String   @db.VarChar(100) // Ex: "UPDATE_CREDIT_LIMIT", "DELETE_ACCOUNT"
  entity          String   @db.VarChar(50)  // Ex: "Account", "User"
  entityId        String   // ID do registro afetado

  // O que mudou?
  oldValues       Json?    // Estado anterior
  newValues       Json?    // Estado novo

  ipAddress       String?  @db.VarChar(45)
  userAgent       String?  @db.Text

  createdAt       DateTime @default(now())

  @@index([entity, entityId])
  @@index([userId])
}
```

---

## 8. Considerações sobre as Queries

1. O Prisma usará bastante o `groupBy` e `sum` na tabela `Transaction` para desenhar os fluxos de caixa em tempo real.
2. Como temos um `@@index([userId, date])` na transação, filtrar o saldo do mês de Janeiro/2026 será ultra rápido.
3. Não há amarração pesada de Autenticação na DB justamente porque o `workosId` no modelo `User` resolverá toda essa ponte via webhooks. Quando o WorkOS cria o User, o sistema escuta o Webhook deles e insere nosso registro do `User`.
4. **Soft Deletes Automáticos:** Como há o uso extensivo de `isActive` vs `deletedAt`, a arquitetura da Backend exigirá a injeção um [Prisma Middleware (ou Extension)](https://www.prisma.io/docs/concepts/components/prisma-client/middleware) global para forçar a query `where: { isActive: true }`, evitando erros humanos que retornem transações "excluídas".
5. **Soft Delete vs Índices Únicos:** O Prisma não lida nativamente com soft deletes em constraints `@@unique` (ex: a categoria única). Precisaremos criar um **Partial Index** direto no PostgreSQL (`CREATE UNIQUE INDEX... WHERE "isActive" = true`) por meio de uma _migration raw_, para permitir recriar categorias deletadas sem estourar o banco.
6. **Lógica de Saldo:** A tabela `BalanceHistory` garante os _snapshots_ para o frontend não engasgar. Porém, a tabela `Account.balance` deve ser tratada como um _cache_ atualizado rigorosamente via _Backend Services_ ou Database Triggers sempre que uma transação no passado for criada/editada/deletada para manter a consistência real.
