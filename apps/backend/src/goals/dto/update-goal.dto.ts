import { PartialType } from '@nestjs/mapped-types';
import { CreateGoalDto } from './create-goal.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateGoalDto extends PartialType(CreateGoalDto) {
  @IsNumber()
  @IsOptional()
  currentAmount?: number;
}
