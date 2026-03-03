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
  accounts        Account[]
  categories      Category[]
  transactions    Transaction[]
  budgets         Budget[]
  goals           Goal[]
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
  
  // Para contas normais
  balance         Decimal     @default(0.00) @db.Decimal(12, 2)
  
  // Para contas tipo CREDIT_CARD
  creditLimit     Decimal?    @db.Decimal(12, 2)
  closingDay      Int?        // Dia que a fatura fecha (1-31)
  dueDay          Int?        // Dia do vencimento (1-31)

  includeInTotal  Boolean     @default(true) // Se 'false', não entra no Net Worth

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  transactions    Transaction[]
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
  
  // Para parcelamentos e recorrências
  installmentId   String?           // Agrupa transações que são parcelas de uma mesma compra (1/12, 2/12)
  installmentNum  Int?
  totalInstallments Int?
  
  // Para Transferências
  transferId      String?           // Vincula as 2 pontas (saída de uma conta, entrada em outra)

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@index([date])
  @@index([userId, date])
}
```

---

## 5. Orçamentos (Smart Budgeting)

O envelompamento por categoria.

```prisma
model Budget {
  id              String     @id @default(uuid())
  userId          String
  user            User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  categoryId      String?    // Se null, é o orçamento total do mês
  category        Category?  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  amountLimit     Decimal    @db.Decimal(12, 2) // Quanto planeja gastar
  month           Int        // 1-12
  year            Int        // 2024, 2025
  
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

  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
}
```

---

## Considerações sobre as Queries

1. O Prisma usará bastante o `groupBy` e `sum` na tabela `Transaction` para desenhar os fluxos de caixa em tempo real.
2. Como temos um `@@index([userId, date])` na transação, filtrar o saldo do mês de Janeiro/2026 será ultra rápido.
3. Não há amarração pesada de Autenticação na DB justamente porque o `workosId` no modelo `User` resolverá toda essa ponte via webhooks. Quando o WorkOS cria o User, o sistema escuta o Webhook deles e insere nosso registro do `User`.
