import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from '@project-budget/database';

export interface CreateTransactionDto {
  accountId: string;
  categoryId?: string;
  type: TransactionType;
  amount: number;
  date: Date;
  description: string;
  notes?: string;
  currencyCode?: string;
}

export interface ListTransactionsQuery {
  userId: string;
  accountId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}

@Injectable()
export class TransactionsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(query: ListTransactionsQuery): Promise<Transaction[]> {
    const {
      userId,
      accountId,
      type,
      status,
      from,
      to,
      page = 1,
      limit = 20,
    } = query;

    return this.db.transaction.findMany({
      where: {
        userId,
        isActive: true,
        ...(accountId && { accountId }),
        ...(type && { type }),
        ...(status && { status }),
        ...(from || to
          ? {
              date: {
                ...(from && { gte: from }),
                ...(to && { lte: to }),
              },
            }
          : {}),
      },
      include: { category: true, tags: true, account: true },
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.db.transaction.findFirst({
      where: { id, userId, isActive: true },
      include: { category: true, tags: true, account: true },
    });
    if (!transaction)
      throw new NotFoundException(`Transaction ${id} not found`);
    return transaction;
  }

  async create(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<Transaction> {
    return this.db.transaction.create({
      data: {
        userId,
        accountId: dto.accountId,
        categoryId: dto.categoryId,
        type: dto.type,
        amount: dto.amount as unknown as never,
        date: dto.date,
        description: dto.description,
        notes: dto.notes,
        currencyCode: dto.currencyCode ?? 'BRL',
      },
      include: { category: true, tags: true },
    });
  }

  async remove(id: string, userId: string): Promise<Transaction> {
    await this.findOne(id, userId);
    return this.db.transaction.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
  }
}
