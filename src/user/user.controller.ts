import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { IUser } from 'src/interface/users.interface';
import { BanUserDto } from './dto/ban-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/core/roles.guard';

@ApiTags('users')
@Controller({ path: 'users', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post()
  @ResponseMessage('create new User')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles('Assistant Admin', 'Assistant Admin')
  @UseGuards(RolesGuard)
  @ResponseMessage('Find many users')
  findAll(@User() user: IUser) {
    return this.userService.findAll();
  }
  @Patch()
  @ResponseMessage('Update user information')
  update(@User() user: IUser, @Body() updateUserDto: UpdateUserDto) {
    // Lấy id từ đối tượng user đã được lấy từ decorator @User()
    return this.userService.update(user.id, updateUserDto);
  }

  @Delete(':id')
  @Roles('Assistant Admin', 'Assistant Admin')
  @UseGuards(RolesGuard)
  @ResponseMessage('Delete user')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
