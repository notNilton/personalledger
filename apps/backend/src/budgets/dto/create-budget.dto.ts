import { IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CreateBudgetDto {
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsNumber()
  amountLimit: number;

  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsNumber()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsNumber()
  @IsOptional()
  rolloverAmount?: number;
}
