import {
  Post,
  UseGuards,
  Controller,
  Get,
  Body,
  Res,
  Req,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { IUser } from 'src/interface/users.interface';
import { Request, Response } from 'express';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { RegisterDto } from './dto/register-user.dto';
import { UserLoginDto } from './dto/login-user.dto';
import { UpdatePasswordDto } from 'src/user/dto/update-password.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { BanUserDto } from 'src/user/dto/ban-user.dto';
import { RolesGuard } from 'src/core/roles.guard';
import { GetPaginateInfo } from 'src/core/query.guard';
import { PaginateInfo } from 'src/interface/paginate.interface';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ResponseMessage('Login success')
  @Post('login')
  handleLogin(
    @Body() userLoginDto: UserLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(userLoginDto, response);
  }
  @Patch('password')
  @ResponseMessage('Update password')
  updatePassword(
    @User() user: IUser,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.authService.updatePassword(user.id, updatePasswordDto);
  }
  @Patch('statusUser')
  @Roles('Super Admin', 'Assistant Admin')
  @UseGuards(RolesGuard)
  @ResponseMessage('Ban or unban user')
  updateAdmin(@Body() banUserDto: BanUserDto) {
    return this.authService.updateStatusUser(banUserDto);
  }
  @Patch('statusAdmin')
  @Roles('Super Admin')
  @UseGuards(RolesGuard)
  @ResponseMessage('Ban or unban Assistant Admin')
  updateStatusUser(@Body() banUserDto: BanUserDto) {
    return this.authService.updateAdmin(banUserDto);
  }
  @Public()
  @Get('refresh')
  @ResponseMessage('Get profile by refresh token')
  hanldeRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.processNewToken(request, response);
  }

  @Get('logout')
  @ResponseMessage('Log out success')
  handleLogout(
    @User() user: IUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.logout(user, response);
  }
  @Get('/guest')
  @Roles('Super Admin', 'Assistant Admin')
  @UseGuards(RolesGuard)
  @ResponseMessage('Find many users')
  findGuests(@GetPaginateInfo() paginateInfo: PaginateInfo) {
    return this.authService.findGuests(paginateInfo);
  }
  @Get('/admin')
  @Roles('Super Admin')
  @UseGuards(RolesGuard)
  @ResponseMessage('Find many users')
  findAssistantAdmins(@GetPaginateInfo() paginateInfo: PaginateInfo) {
    return this.authService.findAssistantAdmins(paginateInfo);
  }
}
