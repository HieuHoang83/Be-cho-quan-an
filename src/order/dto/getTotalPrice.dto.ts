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

export class GetTotalPriceDto {
  @IsOptional()
  @IsString()
  voucherId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderDishDto)
  orderAndDish: OrderDishDto[];
}
