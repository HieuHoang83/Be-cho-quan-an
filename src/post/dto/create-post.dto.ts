import { IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  name: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  ingredients: string;

  @IsString()
  @IsOptional()
  label: string;
}
