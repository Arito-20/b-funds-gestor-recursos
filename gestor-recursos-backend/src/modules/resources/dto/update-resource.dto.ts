import { PartialType } from '@nestjs/swagger';
import { CreateResourceDto } from './create-resource.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ResourceStatus } from '../../../domain/enums';

export class UpdateResourceDto extends PartialType(CreateResourceDto) {
  @ApiPropertyOptional({ enum: ResourceStatus })
  @IsOptional()
  @IsEnum(ResourceStatus)
  status?: ResourceStatus;
}