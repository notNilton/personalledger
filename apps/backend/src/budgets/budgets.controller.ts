import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Budget } from '@project-budget/database';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  findAll(
    @Query('userId') userId: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ): Promise<Budget[]> {
    return this.budgetsService.findAll(
      userId,
      year ? parseInt(year) : undefined,
      month ? parseInt(month) : undefined,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<Budget> {
    return this.budgetsService.findOne(id, userId);
  }

  @Post()
  create(
    @Query('userId') userId: string,
    @Body() dto: CreateBudgetDto,
  ): Promise<Budget> {
    return this.budgetsService.create(userId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() dto: UpdateBudgetDto,
  ): Promise<Budget> {
    return this.budgetsService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<Budget> {
    return this.budgetsService.remove(id, userId);
  }
}
