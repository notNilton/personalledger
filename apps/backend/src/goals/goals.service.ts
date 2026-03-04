import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Goal, Prisma } from '@project-budget/database';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalsService {
  constructor(private readonly db: DatabaseService) {}

  findAll(userId: string): Promise<Goal[]> {
    return this.db.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string): Promise<Goal> {
    const goal = await this.db.goal.findFirst({
      where: { id, userId },
      include: { transactions: { take: 10, orderBy: { date: 'desc' } } },
    });
    if (!goal) throw new NotFoundException(`Goal ${id} not found`);
    return goal;
  }

  create(userId: string, dto: CreateGoalDto): Promise<Goal> {
    return this.db.goal.create({
      data: {
        userId,
        name: dto.name,
        targetAmount: new Prisma.Decimal(dto.targetAmount),
        deadline: dto.deadline,
        color: dto.color,
        icon: dto.icon,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateGoalDto): Promise<Goal> {
    await this.findOne(id, userId);
    return this.db.goal.update({
      where: { id },
      data: {
        name: dto.name,
        targetAmount:
          dto.targetAmount !== undefined
            ? new Prisma.Decimal(dto.targetAmount)
            : undefined,
        currentAmount:
          dto.currentAmount !== undefined
            ? new Prisma.Decimal(dto.currentAmount)
            : undefined,
        deadline: dto.deadline,
        color: dto.color,
        icon: dto.icon,
      },
    });
  }

  async remove(id: string, userId: string): Promise<Goal> {
    await this.findOne(id, userId);
    return this.db.goal.delete({ where: { id } });
  }
}
