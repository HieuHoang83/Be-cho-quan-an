import { IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  name: string;

  @IsString()
  title: string;

  @IsString()
  description: string;
}
