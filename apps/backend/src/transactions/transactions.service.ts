import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Transaction, Prisma } from '@project-budget/database';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { ListTransactionsQuery } from './dto/list-transactions.query';

@Injectable()
export class TransactionsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(
    userId: string,
    query: ListTransactionsQuery,
  ): Promise<Transaction[]> {
    const {
      accountId,
      categoryId,
      search,
      type,
      classification,
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
        ...(categoryId && { categoryId }),
        ...(classification && { classification }),
        ...(type && { type }),
        ...(status && { status }),
        ...(search && {
          description: { contains: search, mode: 'insensitive' },
        }),
        ...(from || to
          ? {
              date: {
                ...(from && { gte: from }),
                ...(to && { lte: to }),
              },
            }
          : {}),
      },
      include: {
        category: true,
        tags: true,
        account: true,
        refuelingLog: true,
      },
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.db.transaction.findFirst({
      where: { id, userId, isActive: true },
      include: {
        category: true,
        tags: true,
        account: true,
        refuelingLog: true,
      },
    });
    if (!transaction)
      throw new NotFoundException(`Transaction ${id} not found`);
    return transaction;
  }

  async create(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<Transaction> {
    const {
      accountId,
      categoryId,
      type,
      classification,
      paymentMethod,
      isRecurring,
      amount,
      date,
      description,
      notes,
      currencyCode,
      vehicleId,
      station,
      fuelType,
      currentKm,
      liters,
      pricePerLiter,
    } = dto;

    return this.db.transaction.create({
      data: {
        userId,
        accountId,
        categoryId,
        type,
        classification: classification ?? 'COMMON',
        paymentMethod: paymentMethod ?? 'DEBIT',
        isRecurring: isRecurring ?? false,
        amount: new Prisma.Decimal(amount),
        date: new Date(date),
        description,
        notes,
        currencyCode: currencyCode ?? 'BRL',
        ...(classification === 'FUEL' &&
          vehicleId && {
            refuelingLog: {
              create: {
                vehicleId,
                station,
                fuelType,
                odometer: new Prisma.Decimal(currentKm ?? 0),
                fuelLiters: new Prisma.Decimal(liters ?? 0),
                pricePerLiter: new Prisma.Decimal(pricePerLiter ?? 0),
              },
            },
          }),
      },
      include: { category: true, tags: true, refuelingLog: true },
    });
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const {
      accountId,
      categoryId,
      vehicleId,
      fuelType,
      currentKm,
      liters,
      pricePerLiter,
      station,
      classification,
      paymentMethod,
      amount,
      date,
      ...rest
    } = dto;

    await this.findOne(id, userId);

    return this.db.transaction.update({
      where: { id },
      data: {
        ...rest,
        classification,
        paymentMethod,
        amount: amount ? new Prisma.Decimal(amount) : undefined,
        date: date ? new Date(date) : undefined,
        account: accountId ? { connect: { id: accountId } } : undefined,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        ...(classification === 'FUEL' &&
          vehicleId && {
            refuelingLog: {
              upsert: {
                create: {
                  vehicleId,
                  station,
                  fuelType,
                  odometer: new Prisma.Decimal(currentKm ?? 0),
                  fuelLiters: new Prisma.Decimal(liters ?? 0),
                  pricePerLiter: new Prisma.Decimal(pricePerLiter ?? 0),
                },
                update: {
                  vehicleId,
                  station,
                  fuelType,
                  odometer: new Prisma.Decimal(currentKm ?? 0),
                  fuelLiters: new Prisma.Decimal(liters ?? 0),
                  pricePerLiter: new Prisma.Decimal(pricePerLiter ?? 0),
                },
              },
            },
          }),
      },
      include: { category: true, tags: true, refuelingLog: true },
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
