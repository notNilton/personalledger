import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { User } from '@project-budget/database';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  findAll(): Promise<User[]> {
    return this.db.user.findMany({ where: { isActive: true } as never });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.db.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByWorkosId(workosId: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { workosId } });
  }

  async upsertFromWorkos(data: {
    workosId: string;
    email: string;
    name?: string;
    avatarUrl?: string;
  }): Promise<User> {
    return this.db.user.upsert({
      where: { workosId: data.workosId },
      create: data,
      update: {
        email: data.email,
        name: data.name,
        avatarUrl: data.avatarUrl,
      },
    });
  }

  async remove(id: string): Promise<User> {
    await this.findOne(id);
    return this.db.user.delete({ where: { id } });
  }
}
