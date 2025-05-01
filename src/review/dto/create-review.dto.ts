import { IsNotEmpty, IsOptional, IsUUID, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  @IsNotEmpty()
  dishId: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsOptional()
  comment?: string;
}
