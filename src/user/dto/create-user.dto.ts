import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsString({ message: 'Role must be a string' })
  @IsIn(['Guest', 'Assistant Admin'], {
    message: 'Role must be either "Guest" or "Assistant Admin"',
  })
  role: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  phone?: string;
}
