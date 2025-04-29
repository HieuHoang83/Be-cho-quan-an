import { PartialType } from '@nestjs/swagger';
import { CreateNotifyDto } from './create-notify.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotifyDto {
  @IsOptional()
  @IsBoolean()
  read?: boolean;
}
