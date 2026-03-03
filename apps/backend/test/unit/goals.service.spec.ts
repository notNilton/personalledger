import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import {
  GoalsService,
  CreateGoalDto,
  UpdateGoalDto,
} from '@/goals/goals.service';
import { DatabaseService } from '@/database/database.service';

const AMOUNT_15K = 15000.0 as unknown as never;
const AMOUNT_3_5K = 3500.0 as unknown as never;
const AMOUNT_5K = 5000.0 as unknown as never;

const mockGoal = {
  id: 'goal-1',
  userId: 'user-1',
  name: 'Viagem para Europa',
  targetAmount: AMOUNT_15K,
  currentAmount: AMOUNT_3_5K,
  deadline: new Date('2027-06-01'),
  color: '#6C63FF',
  icon: '✈️',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockDb = {
  goal: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('GoalsService', () => {
  let service: GoalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoalsService, { provide: DatabaseService, useValue: mockDb }],
    }).compile();

    service = module.get<GoalsService>(GoalsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all goals for a user ordered by most recent', async () => {
      mockDb.goal.findMany.mockResolvedValue([mockGoal]);

      const result = await service.findAll('user-1');

      expect(result).toEqual([mockGoal]);
      expect(mockDb.goal.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when user has no goals', async () => {
      mockDb.goal.findMany.mockResolvedValue([]);
      const result = await service.findAll('user-2');
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a goal with recent transactions', async () => {
      const goalWithTxns = { ...mockGoal, transactions: [] };
      mockDb.goal.findFirst.mockResolvedValue(goalWithTxns);

      const result = await service.findOne('goal-1', 'user-1');

      expect(result).toEqual(goalWithTxns);
      expect(mockDb.goal.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'goal-1', userId: 'user-1' },
          include: expect.objectContaining({ transactions: expect.anything() }),
        }),
      );
    });

    it('should throw NotFoundException when goal belongs to different user', async () => {
      mockDb.goal.findFirst.mockResolvedValue(null);

      await expect(service.findOne('goal-1', 'other-user')).rejects.toThrow(
        new NotFoundException('Goal goal-1 not found'),
      );
    });
  });

  describe('create', () => {
    it('should create a goal with all fields', async () => {
      mockDb.goal.create.mockResolvedValue(mockGoal);

      const dto: CreateGoalDto = {
        name: 'Viagem para Europa',
        targetAmount: 15000,
        deadline: new Date('2027-06-01'),
        color: '#6C63FF',
        icon: '✈️',
      };

      const result = await service.create('user-1', dto);

      expect(result).toEqual(mockGoal);
      expect(mockDb.goal.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          name: 'Viagem para Europa',
          targetAmount: AMOUNT_15K,
          deadline: dto.deadline,
          color: '#6C63FF',
          icon: '✈️',
        },
      });
    });

    it('should create a goal with only required fields', async () => {
      mockDb.goal.create.mockResolvedValue({
        ...mockGoal,
        deadline: undefined,
        color: undefined,
        icon: undefined,
      });

      await service.create('user-1', {
        name: 'Reserva de emergência',
        targetAmount: 10000,
      });

      expect(mockDb.goal.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Reserva de emergência',
          deadline: undefined,
          color: undefined,
          icon: undefined,
        }),
      });
    });
  });

  describe('update', () => {
    it('should update goal fields partially', async () => {
      const updated = {
        ...mockGoal,
        name: 'Viagem para Japão',
        currentAmount: AMOUNT_5K,
      };
      mockDb.goal.findFirst.mockResolvedValue(mockGoal);
      mockDb.goal.update.mockResolvedValue(updated);

      const dto: UpdateGoalDto = {
        name: 'Viagem para Japão',
        currentAmount: 5000,
      };
      const result = await service.update('goal-1', 'user-1', dto);

      expect(result.name).toBe('Viagem para Japão');
      expect(mockDb.goal.update).toHaveBeenCalledWith({
        where: { id: 'goal-1' },
        data: {
          name: 'Viagem para Japão',
          currentAmount: AMOUNT_5K,
        },
      });
    });

    it('should throw NotFoundException when updating a non-existent goal', async () => {
      mockDb.goal.findFirst.mockResolvedValue(null);
      await expect(
        service.update('ghost', 'user-1', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should hard-delete a goal', async () => {
      mockDb.goal.findFirst.mockResolvedValue(mockGoal);
      mockDb.goal.delete.mockResolvedValue(mockGoal);

      const result = await service.remove('goal-1', 'user-1');

      expect(result).toEqual(mockGoal);
      expect(mockDb.goal.delete).toHaveBeenCalledWith({
        where: { id: 'goal-1' },
      });
    });

    it('should throw NotFoundException when goal does not exist', async () => {
      mockDb.goal.findFirst.mockResolvedValue(null);
      await expect(service.remove('ghost', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
