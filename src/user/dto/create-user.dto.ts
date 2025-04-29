import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  // Kiểm tra email hợp lệ
  @IsEmail()
  email: string;

  // Kiểm tra mật khẩu: phải có ít nhất 6 ký tự
  @IsString()
  password: string;

  // Kiểm tra tên là chuỗi
  @IsString()
  name: string;

  // Kiểm tra tên là chuỗi
  @IsString()
  phone: string;
}
