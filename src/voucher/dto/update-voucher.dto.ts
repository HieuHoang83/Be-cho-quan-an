import { PartialType } from '@nestjs/swagger';
import { CreateVoucherDto } from './create-voucher.dto';
import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateVoucherDto {
  @IsOptional()
  @IsString()
  description: string;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateStart: Date;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateEnd: Date;
  @IsOptional()
  @IsInt()
  discount: number;
}
