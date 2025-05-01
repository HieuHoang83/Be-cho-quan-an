import { IsInt, IsUUID, Min } from 'class-validator';

export class AddDishToCartDto {
  @IsUUID()
  dishId: string;
  @IsInt()
  @Min(1)
  number: number;
}
