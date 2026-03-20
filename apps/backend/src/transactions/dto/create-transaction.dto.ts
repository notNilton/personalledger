import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import {
  TransactionType,
  TransactionClassification,
  PaymentMethod,
  FuelType,
} from '@project-budget/database';

export class CreateTransactionDto {
  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @IsEnum(TransactionClassification)
  @IsOptional()
  classification?: TransactionClassification;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsNumber()
  amount: number;

  @IsDateString()
  date: Date;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  @MaxLength(3)
  currencyCode?: string;

  // Fuel specific fields
  @IsUUID()
  @IsOptional()
  vehicleId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  station?: string;

  @IsEnum(FuelType)
  @IsOptional()
  fuelType?: FuelType;

  @IsNumber()
  @IsOptional()
  currentKm?: number;

  @IsNumber()
  @IsOptional()
  liters?: number;

  @IsNumber()
  @IsOptional()
  pricePerLiter?: number;
}
