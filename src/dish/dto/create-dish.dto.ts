import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateDishDto {
  @IsString()
  name: string;

  @IsInt()
  cost: number;

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
