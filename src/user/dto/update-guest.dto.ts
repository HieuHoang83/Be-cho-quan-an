import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class UpdateGuestDto {
  @IsOptional()
  @IsString({ message: 'Gender must be a string' })
  gender?: string;

  @IsOptional()
  @IsInt({ message: 'Birth year must be a number' })
  @Min(1900, { message: 'Birth year must be after 1900' })
  @Max(new Date().getFullYear(), {
    message: 'Birth year must not be in the future',
  })
  birthYear?: number;

  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'phone must be a string' })
  phone?: string;
}
