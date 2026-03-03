import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import {
  TransactionsService,
  CreateTransactionDto,
} from '@/transactions/transactions.service';
import { DatabaseService } from '@/database/database.service';
import { TransactionType, TransactionStatus } from '@project-budget/database';

const mockTransaction = {
  id: 'txn-1',
  userId: 'user-1',
  accountId: 'acc-1',
  categoryId: 'cat-1',
  type: TransactionType.EXPENSE,
  amount: 150.0 as unknown as never,
  date: new Date('2026-01-15'),
  description: 'Supermercado',
  notes: null,
  status: TransactionStatus.COMPLETED,
  attachmentUrl: null,
  currencyCode: 'BRL',
  statementId: null,
  goalId: null,
  installmentId: null,
  installmentNum: null,
  totalInstallments: null,
  isActive: true,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  category: { id: 'cat-1', name: 'Alimentação' },
  tags: [],
  account: { id: 'acc-1', name: 'Nubank' },
};

const mockDb = {
  transaction: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated transactions for a user', async () => {
      mockDb.transaction.findMany.mockResolvedValue([mockTransaction]);

      const result = await service.findAll({ userId: 'user-1' });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('txn-1');
      expect(mockDb.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-1', isActive: true }),
          orderBy: { date: 'desc' },
          skip: 0,
          take: 20,
        }),
      );
    });

    it('should apply filters when provided', async () => {
      mockDb.transaction.findMany.mockResolvedValue([]);

      await service.findAll({
        userId: 'user-1',
        type: TransactionType.INCOME,
        from: new Date('2026-01-01'),
        to: new Date('2026-01-31'),
        page: 2,
        limit: 10,
      });

      expect(mockDb.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: TransactionType.INCOME,
            date: { gte: new Date('2026-01-01'), lte: new Date('2026-01-31') },
          }),
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id for the correct user', async () => {
      mockDb.transaction.findFirst.mockResolvedValue(mockTransaction);

      const result = await service.findOne('txn-1', 'user-1');

      expect(result).toEqual(mockTransaction);
      expect(mockDb.transaction.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'txn-1', userId: 'user-1', isActive: true },
        }),
      );
    });

    it('should throw NotFoundException when transaction does not belong to user', async () => {
      mockDb.transaction.findFirst.mockResolvedValue(null);

      await expect(service.findOne('txn-1', 'other-user')).rejects.toThrow(
        new NotFoundException('Transaction txn-1 not found'),
      );
    });
  });

  describe('create', () => {
    it('should create a new expense transaction', async () => {
      mockDb.transaction.create.mockResolvedValue(mockTransaction);

      const dto: CreateTransactionDto = {
        accountId: 'acc-1',
        categoryId: 'cat-1',
        type: TransactionType.EXPENSE,
        amount: 150,
        date: new Date('2026-01-15'),
        description: 'Supermercado',
      };

      const result = await service.create('user-1', dto);

      expect(result).toEqual(mockTransaction);
      expect(mockDb.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            type: TransactionType.EXPENSE,
            currencyCode: 'BRL',
          }),
        }),
      );
    });

    it('should use provided currencyCode', async () => {
      mockDb.transaction.create.mockResolvedValue(mockTransaction);

      await service.create('user-1', {
        accountId: 'acc-1',
        type: TransactionType.INCOME,
        amount: 500,
        date: new Date(),
        description: 'Salário',
        currencyCode: 'USD',
      });

      expect(mockDb.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currencyCode: 'USD' }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('should soft-delete an existing transaction', async () => {
      const deletedTxn = {
        ...mockTransaction,
        isActive: false,
        deletedAt: expect.any(Date),
      };
      mockDb.transaction.findFirst.mockResolvedValue(mockTransaction);
      mockDb.transaction.update.mockResolvedValue(deletedTxn);

      const result = await service.remove('txn-1', 'user-1');

      expect(mockDb.transaction.update).toHaveBeenCalledWith({
        where: { id: 'txn-1' },
        data: { isActive: false, deletedAt: expect.any(Date) },
      });
      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException when transaction not found', async () => {
      mockDb.transaction.findFirst.mockResolvedValue(null);
      await expect(service.remove('txn-ghost', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
