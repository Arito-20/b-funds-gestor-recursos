import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PurchaseOrderStatus } from '../../../domain/enums';

export class UpdatePurchaseOrderDto {
  @ApiPropertyOptional({ enum: PurchaseOrderStatus })
  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus;

  @ApiPropertyOptional({ example: 'OC-2026-001' })
  @IsOptional()
  @IsString()
  poNumber?: string;

  @ApiPropertyOptional({ example: 'Aprobada por Finance' })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional({ example: 8000 })
  @IsOptional()
  @IsNumber()
  amountOriginal?: number;
}