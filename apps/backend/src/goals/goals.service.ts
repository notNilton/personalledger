import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Goal } from '@project-budget/database';

export interface CreateGoalDto {
  name: string;
  targetAmount: number;
  deadline?: Date;
  color?: string;
  icon?: string;
}

export interface UpdateGoalDto {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: Date;
  color?: string;
  icon?: string;
}

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
        targetAmount: dto.targetAmount as unknown as never,
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
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.targetAmount !== undefined && {
          targetAmount: dto.targetAmount as unknown as never,
        }),
        ...(dto.currentAmount !== undefined && {
          currentAmount: dto.currentAmount as unknown as never,
        }),
        ...(dto.deadline !== undefined && { deadline: dto.deadline }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
      },
    });
  }

  async remove(id: string, userId: string): Promise<Goal> {
    await this.findOne(id, userId);
    return this.db.goal.delete({ where: { id } });
  }
}
