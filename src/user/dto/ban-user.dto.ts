import { IsBoolean, IsString, IsUUID } from 'class-validator';

export class BanUserDto {
  @IsUUID(undefined, { message: 'User ID must be a valid UUID' })
  userId: string;

  @IsBoolean({ message: 'isBan must be a boolean value' })
  isBan: boolean;
}
