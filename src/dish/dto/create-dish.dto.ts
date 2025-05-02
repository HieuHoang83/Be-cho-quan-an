import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateDishDto {
  @IsString()
  name: string;
  @IsString()
  url: string;
  @IsString()
  type: string;
  @IsInt()
  priceOld: number;
  @IsOptional()
  @IsInt()
  priceNew: number;
  @IsOptional()
  @IsString()
  FoodChart: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @IsOptional()
  ration: number;

  @IsInt()
  @IsOptional()
  calo: number;

  @IsOptional()
  @IsString()
  ingredients?: string;
}
