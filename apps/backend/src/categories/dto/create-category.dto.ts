import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { TransactionType } from '@project-budget/database';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  @MaxLength(7)
  color?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;
}
