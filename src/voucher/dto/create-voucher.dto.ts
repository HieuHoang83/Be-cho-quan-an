import { IsString, IsInt, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVoucherDto {
  @IsString()
  code: string;
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDate()
  @Type(() => Date)
  dateStart: Date;

  @IsDate()
  @Type(() => Date)
  dateEnd: Date;

  @IsInt()
  discount: number;
}
