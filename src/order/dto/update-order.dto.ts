import {
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  Min,
  IsIn,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOrderDto {
  @IsOptional()
  @IsIn(['cash', 'transfer'], {
    message: 'type must be either "cash" or "transfer"',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  voucherId?: string;
}
