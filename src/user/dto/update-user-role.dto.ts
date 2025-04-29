import { IsString, IsUUID } from 'class-validator';

export class UpdateUserRoleDto {
  @IsUUID(undefined, { message: 'User ID must be a valid UUID' })
  userId: string;

  @IsString({ message: 'Role must be a string' })
  role: string;
}
