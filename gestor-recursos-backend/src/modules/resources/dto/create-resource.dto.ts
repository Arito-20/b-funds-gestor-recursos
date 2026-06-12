import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResourceDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  consultantName: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  providerId: number;

  @ApiProperty({ example: 'ABAP' })
  @IsString()
  profile: string;

  @ApiProperty({ example: 'Peru' })
  @IsString()
  country: string;

  @ApiProperty({ example: 'PEN' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 8000 })
  @IsNumber()
  @Min(0.01)
  monthlyCostOriginal: number;

  @ApiProperty({ example: 3.75 })
  @IsNumber()
  @Min(0.0001)
  exchangeRateToUsd: number;

  @ApiProperty({ example: '2026-06-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-08-31' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 'Ana García' })
  @IsString()
  analystResponsible: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  managerId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  mainInitiativeId: number;

  @ApiPropertyOptional({ example: 'Stand by 1 mes' })
  @IsOptional()
  @IsString()
  observations?: string;
}