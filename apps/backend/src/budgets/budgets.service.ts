import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Budget, Prisma } from '@project-budget/database';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(
    userId: string,
    year?: number,
    month?: number,
  ): Promise<Budget[]> {
    const budgets = await this.db.budget.findMany({
      where: {
        userId,
        ...(year && { year }),
        ...(month && { month }),
      },
      include: { category: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    // Enrich each budget with the real spent amount from transactions
    const now = new Date();
    const targetYear = year ?? now.getFullYear();
    const targetMonth = month ?? now.getMonth() + 1;

    const from = new Date(targetYear, targetMonth - 1, 1);
    const to = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    return Promise.all(
      budgets.map(async (budget) => {
        const aggregate = await this.db.transaction.aggregate({
          where: {
            userId,
            type: 'EXPENSE',
            isActive: true,
            categoryId: budget.categoryId ?? undefined,
            date: { gte: from, lte: to },
          },
          _sum: { amount: true },
        });

        return {
          ...budget,
          spent: Number(aggregate._sum.amount ?? 0),
        } as Budget & { spent: number };
      }),
    );
  }

  async findOne(id: string, userId: string): Promise<Budget> {
    const budget = await this.db.budget.findFirst({
      where: { id, userId },
      include: { category: true },
    });
    if (!budget) throw new NotFoundException(`Budget ${id} not found`);
    return budget;
  }

  create(userId: string, dto: CreateBudgetDto): Promise<Budget> {
    return this.db.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId,
          categoryId: dto.categoryId || null,
          month: dto.month,
          year: dto.year,
        },
      },
      create: {
        userId,
        categoryId: dto.categoryId,
        amountLimit: new Prisma.Decimal(dto.amountLimit),
        month: dto.month,
        year: dto.year,
        rolloverAmount: new Prisma.Decimal(dto.rolloverAmount ?? 0),
      },
      update: {
        amountLimit: new Prisma.Decimal(dto.amountLimit),
        rolloverAmount: new Prisma.Decimal(dto.rolloverAmount ?? 0),
      },
    });
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateBudgetDto,
  ): Promise<Budget> {
    await this.findOne(id, userId);
    return this.db.budget.update({
      where: { id },
      data: {
        amountLimit:
          dto.amountLimit !== undefined
            ? new Prisma.Decimal(dto.amountLimit)
            : undefined,
        rolloverAmount:
          dto.rolloverAmount !== undefined
            ? new Prisma.Decimal(dto.rolloverAmount)
            : undefined,
      },
    });
  }

  async remove(id: string, userId: string): Promise<Budget> {
    await this.findOne(id, userId);
    return this.db.budget.delete({ where: { id } });
  }
}
