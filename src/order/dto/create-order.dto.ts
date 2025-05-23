import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsIn,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderDishDto {
  @IsUUID()
  dishId: string;

  @IsInt()
  @Min(1)
  number: number;
}

export class CreateOrderDto {
  @IsIn(['cash', 'atm', 'momo'], {
    message: 'type must be either "cash" or "transfer"',
  })
  @IsString()
  type: string;
  @IsString()
  nameUser: string;
  @IsString()
  email: string;
  @IsString()
  note: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  voucherId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderDishDto)
  orderAndDish: OrderDishDto[];
}
