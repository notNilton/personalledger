import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Budget, Prisma } from '@project-budget/database';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private readonly db: DatabaseService) {}

  findAll(userId: string, year?: number, month?: number): Promise<Budget[]> {
    return this.db.budget.findMany({
      where: {
        userId,
        ...(year && { year }),
        ...(month && { month }),
      },
      include: { category: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
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
