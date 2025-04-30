import { IsString } from 'class-validator';

export class CreateActionDto {
  @IsString()
  action: string;

  @IsString()
  adminId: string; // ID của admin thực hiện action
}
