import { IsEmail, IsOptional } from 'class-validator';

export class TestEmailDto {
  @IsOptional()
  @IsEmail()
  to?: string;
}
