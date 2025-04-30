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
import { PaginateInfo } from 'src/interface/paginate.interface';
import { GetPaginateInfo } from 'src/core/query.guard';
import { UpdateGuestDto } from './dto/update-guest.dto';

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

  @Patch('/user')
  @ResponseMessage('Update user information')
  updateUser(@User() user: IUser, @Body() updateUserDto: UpdateUserDto) {
    // Lấy id từ đối tượng user đã được lấy từ decorator @User()
    return this.userService.updateUser(user.id, updateUserDto);
  }
  @Patch('/guest')
  @ResponseMessage('Update user information')
  updateGuest(@User() user: IUser, @Body() updateGuestDto: UpdateGuestDto) {
    // Lấy id từ đối tượng user đã được lấy từ decorator @User()
    return this.userService.updateGuest(user.id, updateGuestDto);
  }

  @Delete(':id')
  @Roles('Super Admin', 'Assistant Admin')
  @UseGuards(RolesGuard)
  @ResponseMessage('Delete user')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
