import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsNumber,
  MaxLength,
} from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  licensePlate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  brand?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  model?: string;

  @IsInt()
  @IsOptional()
  year?: number;

  @IsNumber()
  @IsOptional()
  tank?: number;
}
