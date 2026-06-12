import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePurchaseOrderDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  resourceId: number;

  @ApiProperty({ example: '2026-06' })
  @IsString()
  periodMonth: string;

  @ApiProperty({ example: 8000 })
  @IsNumber()
  @Min(0)
  amountOriginal: number;

  @ApiProperty({ example: 'PEN' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 3.75 })
  @IsNumber()
  @Min(0.0001)
  exchangeRateToUsd: number;

  @ApiPropertyOptional({ example: 'OC-2026-001' })
  @IsOptional()
  @IsString()
  poNumber?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  providerId?: number;

  @ApiPropertyOptional({ example: 'Generada automáticamente' })
  @IsOptional()
  @IsString()
  comments?: string;
}