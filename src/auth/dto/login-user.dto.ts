import { ApiProperty } from '@nestjs/swagger';
import { isNotEmpty, IsNotEmpty, isString, IsString } from 'class-validator';

export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
