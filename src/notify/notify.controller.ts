import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NotifyService } from './notify.service';
import { CreateNotifyDto } from './dto/create-notify.dto';
import { UpdateNotifyDto } from './dto/update-notify.dto';
import { User } from 'src/decorators/customize';
import { IUser } from 'src/interface/users.interface';

@Controller('notify')
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}

  @Post()
  create(@User() user: IUser, @Body() createNotifyDto: CreateNotifyDto) {
    console.log(createNotifyDto.message);
    return this.notifyService.create(user.id, createNotifyDto);
  }

  @Get()
  findOne(@User() user: IUser) {
    return this.notifyService.findOne(user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotifyDto: UpdateNotifyDto) {
    return this.notifyService.update(id, updateNotifyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notifyService.remove(+id);
  }
}
