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
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { Goal } from '@project-budget/database';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  findAll(@Query('userId') userId: string): Promise<Goal[]> {
    return this.goalsService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<Goal> {
    return this.goalsService.findOne(id, userId);
  }

  @Post()
  create(
    @Query('userId') userId: string,
    @Body() dto: CreateGoalDto,
  ): Promise<Goal> {
    return this.goalsService.create(userId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() dto: UpdateGoalDto,
  ): Promise<Goal> {
    return this.goalsService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<Goal> {
    return this.goalsService.remove(id, userId);
  }
}
