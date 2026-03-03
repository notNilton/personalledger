import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { DatabaseService } from '@/database/database.service';

const mockUser = {
  id: 'user-1',
  workosId: 'wos-123',
  email: 'john@example.com',
  name: 'John Doe',
  avatarUrl: null,
  subscriptionTier: 'FREE',
  stripeCustomerId: null,
  revenueCatId: null,
  subscriptionExpires: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockDb = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: DatabaseService, useValue: mockDb }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of active users', async () => {
      mockDb.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result).toEqual([mockUser]);
      expect(mockDb.user.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });

    it('should return empty array when no users exist', async () => {
      mockDb.user.findMany.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockDb.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('user-1');

      expect(result).toEqual(mockUser);
      expect(mockDb.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockDb.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        new NotFoundException('User nonexistent not found'),
      );
    });
  });

  describe('findByWorkosId', () => {
    it('should return user by workos id', async () => {
      mockDb.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByWorkosId('wos-123');

      expect(result).toEqual(mockUser);
      expect(mockDb.user.findUnique).toHaveBeenCalledWith({
        where: { workosId: 'wos-123' },
      });
    });

    it('should return null when user not found', async () => {
      mockDb.user.findUnique.mockResolvedValue(null);
      const result = await service.findByWorkosId('wos-999');
      expect(result).toBeNull();
    });
  });

  describe('upsertFromWorkos', () => {
    it('should create or update user from WorkOS data', async () => {
      mockDb.user.upsert.mockResolvedValue(mockUser);

      const result = await service.upsertFromWorkos({
        workosId: 'wos-123',
        email: 'john@example.com',
        name: 'John Doe',
      });

      expect(result).toEqual(mockUser);
      expect(mockDb.user.upsert).toHaveBeenCalledWith({
        where: { workosId: 'wos-123' },
        create: {
          workosId: 'wos-123',
          email: 'john@example.com',
          name: 'John Doe',
          avatarUrl: undefined,
        },
        update: {
          email: 'john@example.com',
          name: 'John Doe',
          avatarUrl: undefined,
        },
      });
    });
  });

  describe('remove', () => {
    it('should delete an existing user', async () => {
      mockDb.user.findUnique.mockResolvedValue(mockUser);
      mockDb.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove('user-1');

      expect(result).toEqual(mockUser);
      expect(mockDb.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockDb.user.findUnique.mockResolvedValue(null);
      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
