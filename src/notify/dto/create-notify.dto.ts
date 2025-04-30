import { IsString } from 'class-validator';

export class CreateNotifyDto {
  @IsString()
  userId: string;
  @IsString()
  message: string;
}
