import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/interface/users.interface';
import { RegisterDto } from './dto/register-user.dto';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import ms from 'ms';
import { genSaltSync, hashSync } from 'bcryptjs';
import { UserLoginDto } from './dto/login-user.dto';
import { UserService } from 'src/user/user.service';
import { UpdatePasswordDto } from 'src/user/dto/update-password.dto';
import { BanUserDto } from 'src/user/dto/ban-user.dto';
import { PaginateInfo } from 'src/interface/paginate.interface';
import { NotifyService } from 'src/notify/notify.service';
import { ActionService } from 'src/action/action.service';

// import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    // private roleService: RolesService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
    private notifyService: NotifyService,
    private actionService: ActionService,
  ) {}

  hashpassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  CheckUserpassword(password: string, hash: string) {
    return this.hashpassword(password) === hash;
  }

  createRefreshToken(payload: any) {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRE'),
    });
    return refreshToken;
  }
  createAccessToken(payload: any) {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRE'),
    });
    return refreshToken;
  }
  async login(userLoginDto: UserLoginDto, response: Response) {
    const { email, password } = userLoginDto;
    password;
    let user: any;
    user = await this.userService.login(email, password);
    const admin = await this.userService.findAdminByUserId(user.id);
    const guest = await this.userService.findGuestByUserId(user.id);

    // Tạo payload cho token
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isBan: user.isBan,
      adminId: admin?.id ?? null,
      guestId: guest?.id ?? null,
    };

    // Tạo tokens
    const refresh_token = this.createRefreshToken(payload);
    const access_token = this.createAccessToken(payload);
    return {
      user: {
        email: user?.email,
        name: user?.name,
        password: user?.password,
        isBan: user?.isBan,
        role: user?.role,
        avatar: user?.avatar,
        phone: user?.phone,
        // Nếu muốn lấy luôn quan hệ
        notifications: user?.notifications,
      },
      token: {
        refresh_token: refresh_token,
        access_token: access_token,
      },
    };
  }
  async validateUser(username: string, password: string) {
    return await this.userService.login(username, password);
  }

  async processNewToken(request: Request, response: Response) {
    const refreshTokenFromCookie = request.cookies['refresh_token'];

    if (!refreshTokenFromCookie) {
      throw new BadRequestException('Refresh token is missing');
    }

    try {
      // Xác minh refresh token
      this.jwtService.verify(refreshTokenFromCookie, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      });

      // Tìm user từ refresh token
      const user = await this.userService.findOneByRefreshToken(
        refreshTokenFromCookie,
      );
      if (!user) {
        throw new BadRequestException(
          'Refresh token not associated with any user',
        );
      }

      const { id, email, name, role, isBan } = user;
      const payload = {
        sub: 'token login',
        iss: 'from server',
        id,
        email,
        name,
        role,
        isBan,
      };

      // Tạo token mới
      const newRefreshToken = this.createRefreshToken(payload);

      // Lưu refresh token mới vào DB
      await this.userService.updateUserToken(user.id, newRefreshToken);

      // Gửi lại cookie
      response.clearCookie('refresh_token');
      response.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
      });

      return {
        access_token: this.jwtService.sign(payload),
        user: { id, email, name, role, isBan },
      };
    } catch (error) {
      throw new BadRequestException('Invalid or expired refresh token');
    }
  }

  async logout(user: IUser, response: Response) {
    await this.userService.updateRefreshToken(user.id, '');
    response.clearCookie('refresh_token');
    return true;
  }
  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    await this.userService.updatePassword(userId, updatePasswordDto);
    return true;
  }
  async updateStatusUser(user: IUser, banUserDto: BanUserDto) {
    const admin = await this.userService.findAdminByUserId(user.id);
    if (user.role == 'Guest') this.userService.updateStatusUser(banUserDto);
    if (user.isBan === false && banUserDto.isBan === true) {
      await this.actionService.createAction({
        adminId: admin.id, // lấy từ token hoặc request nếu có
        action: `${user.email} đã mở Ban cho nameUser: ${user.name} với emailUser: ${user.email}`, // hoặc ID, tuỳ theo cách bạn muốn log
      });
    } else if (user.isBan === false && banUserDto.isBan === true) {
      await this.actionService.createAction({
        adminId: admin.id, // lấy từ token hoặc request nếu có
        action: `${user.email} đã Ban  nameUser: ${user.name} với emailUser: ${user.email}`, // hoặc ID, tuỳ theo cách bạn muốn log
      });
    } else {
      throw new ForbiddenException('You do not have permission');
    }
  }
  async updateAdmin(user: IUser, banUserDto: BanUserDto) {
    const admin = await this.userService.findAdminByUserId(user.id);

    await this.userService.updateStatusUser(banUserDto);
    if (user.isBan === false && banUserDto.isBan === true) {
      await this.actionService.createAction({
        adminId: admin.id, // lấy từ token hoặc request nếu có
        action: `Bạn đã mở Ban cho nameUser: ${user.name} với emailUser: ${user.email}`, // hoặc ID, tuỳ theo cách bạn muốn log
      });
    } else if (user.isBan === false && banUserDto.isBan === true) {
      await this.actionService.createAction({
        adminId: admin.id, // lấy từ token hoặc request nếu có
        action: `Bạn đã Ban nameUser: ${user.name} với emailUser: ${user.email}`, // hoặc ID, tuỳ theo cách bạn muốn log
      });
    }
  }
  async findGuests(paginateInfo: PaginateInfo) {
    return this.userService.findGuests(paginateInfo);
  }
  async findAssistantAdmins(paginateInfo: PaginateInfo) {
    return this.userService.findAssistantAdmins(paginateInfo);
  }
}
