import 'dotenv/config';
import {
  PrismaClient,
  TransactionType,
  FuelType,
  TransactionStatus,
  AccountType,
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

  // Limpar dados existentes
  console.log('🧹 Limpando dados antigos...');
  await prisma.transactionTag.deleteMany();
  await prisma.refuelingLog.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.balanceHistory.deleteMany();
  await prisma.creditCardStatement.deleteMany();
  await prisma.accountAccess.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Criar Usuários (7 usuários)
  console.log('👤 Criando usuários...');
  const users = [];
  for (let i = 0; i < 7; i++) {
    const isCompany = i > 4; // 2 empresas, 5 pessoas físicas
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        passwordHash,
        name: faker.person.fullName(),
        phone: faker.phone.number(),
        avatarUrl: faker.image.avatar(),
        cpf: isCompany ? null : faker.string.numeric(11),
        cnpj: isCompany ? faker.string.numeric(14) : null,
        subscriptionTier: i === 0 ? 'PREMIUM' : 'FREE',
      },
    });
    users.push(user);
  }

  // 2. Criar Categorias Globais e de Usuário
  console.log('📂 Criando categorias...');
  const categoryTemplates = [
    { name: 'Alimentação', icon: 'Utensils', color: '#EF4444', type: TransactionType.EXPENSE },
    { name: 'Transporte', icon: 'Car', color: '#3B82F6', type: TransactionType.EXPENSE },
    { name: 'Saúde', icon: 'Heart', color: '#10B981', type: TransactionType.EXPENSE },
    { name: 'Lazer', icon: 'Gamepad', color: '#F59E0B', type: TransactionType.EXPENSE },
    { name: 'Salário', icon: 'Banknote', color: '#22C55E', type: TransactionType.INCOME },
    { name: 'Investimentos', icon: 'TrendingUp', color: '#6366F1', type: TransactionType.INCOME },
    { name: 'Educação', icon: 'GraduationCap', color: '#8B5CF6', type: TransactionType.EXPENSE },
    { name: 'Combustível', icon: 'Fuel', color: '#F97316', type: TransactionType.EXPENSE },
    { name: 'Assinaturas', icon: 'Play', color: '#EC4899', type: TransactionType.EXPENSE },
  ];

  for (const user of users) {
    for (const temp of categoryTemplates) {
      await prisma.category.create({
        data: {
          userId: user.id,
          ...temp,
        },
      });
    }
  }

  // 3. Criar Contas para cada Usuário
  console.log('💳 Criando contas bancárias...');
  for (const user of users) {
    // Conta Corrente
    const checking = await prisma.account.create({
      data: {
        userId: user.id,
        name: 'Nubank Principal',
        type: AccountType.CHECKING,
        balance: faker.number.float({ min: 1000, max: 10000, fractionDigits: 2 }),
        color: '#8A05BE',
        icon: 'CreditCard',
      },
    });

    // Cartão de Crédito
    await prisma.account.create({
      data: {
        userId: user.id,
        name: 'Visa Infinite',
        type: AccountType.CREDIT_CARD,
        balance: 0,
        creditLimit: 5000,
        closingDay: 5,
        dueDay: 12,
        color: '#000000',
        icon: 'Wallet',
      },
    });

    // 4. Criar Veículos (4 para cada usuário)
    console.log(`🚗 Criando veículos para ${user.name}...`);
    for (let j = 0; j < 4; j++) {
      const vehicle = await prisma.vehicle.create({
        data: {
          userId: user.id,
          name: faker.vehicle.model(),
          make: faker.vehicle.manufacturer(),
          model: faker.vehicle.type(),
          year: faker.number.int({ min: 2010, max: 2024 }),
          licensePlate: `${faker.string.alpha(3).toUpperCase()}${faker.string.numeric(4)}`,
        },
      });

      // 5. Histórico de Abastecimento (10 por veículo)
      const fuelCategory = await prisma.category.findFirst({
        where: { userId: user.id, name: 'Combustível' },
      });

      for (let k = 0; k < 10; k++) {
        const liters = faker.number.float({ min: 20, max: 50, fractionDigits: 2 });
        const pricePerLiter = faker.number.float({ min: 5.2, max: 6.5, fractionDigits: 2 });
        const totalAmount = liters * pricePerLiter;

        const transaction = await prisma.transaction.create({
          data: {
            userId: user.id,
            accountId: checking.id,
            categoryId: fuelCategory?.id,
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

    // 6. Transações Aleatórias (30 por usuário)
    console.log(`💸 Criando transações extras para ${user.name}...`);
    const allCategories = await prisma.category.findMany({ where: { userId: user.id } });

    for (let l = 0; l < 30; l++) {
      const cat = faker.helpers.arrayElement(allCategories);
      await prisma.transaction.create({
        data: {
          userId: user.id,
          accountId: checking.id,
          categoryId: cat.id,
          type: cat.type,
          amount: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
          date: faker.date.recent({ days: 90 }),
          description: faker.commerce.productName(),
          status: TransactionStatus.COMPLETED,
        },
      });
    }

    // 7. Metas (Goals)
    await prisma.goal.create({
      data: {
        userId: user.id,
        name: 'Reserva de Emergência',
        targetAmount: 10000,
        currentAmount: 2500,
        color: '#10B981',
      },
    });

    await prisma.goal.create({
      data: {
        userId: user.id,
        name: 'Viagem Japão',
        targetAmount: 25000,
        currentAmount: 1200,
        color: '#EF4444',
        deadline: faker.date.future(),
      },
    });

    // 8. Orçamentos (Budgets)
    const foodCat = allCategories.find((c) => c.name === 'Alimentação');
    if (foodCat) {
      await prisma.budget.create({
        data: {
          userId: user.id,
          categoryId: foodCat.id,
          amountLimit: 1200,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
      });
    }
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
