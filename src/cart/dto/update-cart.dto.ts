import { PartialType } from '@nestjs/swagger';
import { AddDishToCartDto } from './addDishToCart.dto';
import { IsInt, IsUUID, Min } from 'class-validator';

export class UpdateDishQuantityDto {
  @IsInt()
  @Min(1)
  number: number;
}
