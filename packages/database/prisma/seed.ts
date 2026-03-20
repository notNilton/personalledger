import 'dotenv/config';
import {
  PrismaClient,
  TransactionType,
  FuelType,
  TransactionStatus,
  AccountType,
  AccountOwnership,
} from '@prisma/client';
import { fakerPT_BR as faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando o processo de seed...');

  console.log('🧹 Limpando dados antigos...');
  await prisma.transactionTag.deleteMany();
  await prisma.importFingerprint.deleteMany();
  await prisma.importFile.deleteMany();
  await prisma.vehicleMaintenance.deleteMany();
  await prisma.refuelingLog.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.installment.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.balanceHistory.deleteMany();
  await prisma.card.deleteMany();
  await prisma.accountAccess.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const niltonPasswordHash = await bcrypt.hash('@2Organela', 10);

  console.log('👤 Criando usuário Nilton...');
  const nilton = await prisma.user.create({
    data: {
      email: 'nilton.naab@gmail.com',
      passwordHash: niltonPasswordHash,
      name: 'Nilton Aguiar dos Santos',
      phone: '65992785635',
      avatarUrl: faker.image.avatar(),
      subscriptionTier: 'PREMIUM',
    },
  });

  console.log('💳 Criando contas bancárias...');

  // Conta 1: Banco do Brasil — Pessoal, CPF
  const bbAccount = await prisma.account.create({
    data: {
      userId: nilton.id,
      name: 'Banco do Brasil',
      type: AccountType.CHECKING,
      ownership: AccountOwnership.PERSONAL,
      bankName: 'Banco do Brasil',
      cpf: '06143981183',
      balance: faker.number.float({ min: 1000, max: 8000, fractionDigits: 2 }),
      color: '#F5A623',
      icon: 'Building',
    },
  });

  // Conta 2: Nubank — Pessoal, CPF
  const nubankPessoal = await prisma.account.create({
    data: {
      userId: nilton.id,
      name: 'Nubank',
      type: AccountType.CHECKING,
      ownership: AccountOwnership.PERSONAL,
      bankName: 'Nubank',
      cpf: '06143981183',
      balance: faker.number.float({ min: 500, max: 5000, fractionDigits: 2 }),
      color: '#8A05BE',
      icon: 'Wallet',
    },
  });

  // Conta 3: Mercado Pago — Pessoal, CPF
  await prisma.account.create({
    data: {
      userId: nilton.id,
      name: 'Mercado Pago',
      type: AccountType.WALLET,
      ownership: AccountOwnership.PERSONAL,
      bankName: 'Mercado Pago',
      cpf: '06143981183',
      balance: faker.number.float({ min: 0, max: 2000, fractionDigits: 2 }),
      color: '#00B1EA',
      icon: 'Wallet',
    },
  });

  // Conta 4: Nubank — Empresarial, CNPJ aleatório
  await prisma.account.create({
    data: {
      userId: nilton.id,
      name: 'Nubank PJ',
      type: AccountType.CHECKING,
      ownership: AccountOwnership.BUSINESS,
      bankName: 'Nubank',
      cnpj: faker.string.numeric(14),
      balance: faker.number.float({ min: 2000, max: 20000, fractionDigits: 2 }),
      color: '#8A05BE',
      icon: 'Building',
    },
  });

  console.log('📂 Criando categorias...');
  const categoryTemplates = [
    // RECEITAS
    {
      name: 'Ativa',
      description: 'Salários, pró-labore, freelas, vendas e serviços',
      color: '#22C55E',
      type: TransactionType.INCOME,
    },
    {
      name: 'Passiva',
      description: 'Rendimentos de investimentos, dividendos e aluguéis recebidos',
      color: '#6366F1',
      type: TransactionType.INCOME,
    },
    {
      name: 'Ajustes',
      description: 'Reembolsos, estornos e transferências entre contas (entrada)',
      color: '#F59E0B',
      type: TransactionType.INCOME,
    },
    {
      name: 'Outros',
      description: 'Presentes ganhos, prêmios ou entradas esporádicas',
      color: '#10B981',
      type: TransactionType.INCOME,
    },
    // DESPESAS
    {
      name: 'Habitação',
      description: 'Aluguel/financiamento, condomínio, luz, água, internet e manutenção da casa',
      color: '#3B82F6',
      type: TransactionType.EXPENSE,
    },
    {
      name: 'Essenciais',
      description: 'Supermercado, farmácia, higiene e feira',
      color: '#EF4444',
      type: TransactionType.EXPENSE,
    },
    {
      name: 'Alimentação',
      description: 'Restaurantes, delivery, bares e lanches rápidos',
      color: '#F97316',
      type: TransactionType.EXPENSE,
    },
    {
      name: 'Mobilidade',
      description: 'Combustível, Uber, transporte público, IPVA e manutenção de veículo',
      color: '#8B5CF6',
      type: TransactionType.EXPENSE,
    },
    {
      name: 'Saúde',
      description: 'Planos de saúde, exames, dentista e terapias',
      color: '#10B981',
      type: TransactionType.EXPENSE,
    },
    {
      name: 'Estilo de Vida',
      description: 'Lazer, assinaturas (Netflix, Spotify) e viagens',
      color: '#EC4899',
      type: TransactionType.EXPENSE,
    },
    {
      name: 'Compras',
      description: 'Roupas, eletrônicos, presentes e itens de uso pessoal (não recorrente)',
      color: '#0EA5E9',
      type: TransactionType.EXPENSE,
    },
    {
      name: 'Financeiro',
      description: 'Impostos, taxas bancárias, juros e seguros',
      color: '#64748B',
      type: TransactionType.EXPENSE,
    },
  ];

  const categories: Awaited<ReturnType<typeof prisma.category.create>>[] = [];
  for (const temp of categoryTemplates) {
    const cat = await prisma.category.create({ data: { userId: nilton.id, ...temp } });
    categories.push(cat);
  }

  console.log('🚗 Criando veículos...');
  const mobilidadeCategory = categories.find((c) => c.name === 'Mobilidade');

  for (let j = 0; j < 2; j++) {
    const vehicle = await prisma.vehicle.create({
      data: {
        userId: nilton.id,
        name: faker.vehicle.model(),
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.type(),
        year: faker.number.int({ min: 2015, max: 2024 }),
        licensePlate: `${faker.string.alpha(3).toUpperCase()}${faker.string.numeric(4)}`,
      },
    });

    for (let k = 0; k < 8; k++) {
      const liters = faker.number.float({ min: 20, max: 50, fractionDigits: 2 });
      const pricePerLiter = faker.number.float({ min: 5.2, max: 6.5, fractionDigits: 2 });
      const totalAmount = liters * pricePerLiter;

      const transaction = await prisma.transaction.create({
        data: {
          userId: nilton.id,
          accountId: bbAccount.id,
          categoryId: mobilidadeCategory?.id,
          type: TransactionType.EXPENSE,
          amount: totalAmount,
          date: faker.date.recent({ days: 120 }),
          description: `Abastecimento - ${vehicle.name}`,
          classification: 'FUEL',
          status: TransactionStatus.COMPLETED,
        },
      });

      await prisma.refuelingLog.create({
        data: {
          vehicleId: vehicle.id,
          transactionId: transaction.id,
          fuelType: faker.helpers.arrayElement([
            FuelType.GASOLINA_COMUM,
            FuelType.GASOLINA_ADITIVADA,
            FuelType.ETANOL,
            FuelType.DIESEL,
          ]),
          station: faker.company.name(),
          odometer: 10000 + k * 400,
          fuelLiters: liters,
          pricePerLiter: pricePerLiter,
          isFullTank: true,
        },
      });
    }
  }

  console.log('💸 Criando transações aleatórias...');
  const accounts = [bbAccount, nubankPessoal];

  for (let l = 0; l < 40; l++) {
    const cat = faker.helpers.arrayElement(categories);
    await prisma.transaction.create({
      data: {
        userId: nilton.id,
        accountId: faker.helpers.arrayElement(accounts).id,
        categoryId: cat.id,
        type: cat.type,
        amount: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
        date: faker.date.recent({ days: 90 }),
        description: faker.commerce.productName(),
        status: TransactionStatus.COMPLETED,
      },
    });
  }

  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
