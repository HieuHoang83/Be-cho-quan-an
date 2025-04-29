import { BadRequestException, Injectable } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/interface/users.interface';
import { RegisterDto } from './dto/register-user.dto';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import ms from 'ms';
import { genSaltSync, hashSync } from 'bcryptjs';
import { UserLoginDto } from './dto/login-user.dto';
import { UserService } from 'src/user/user.service';

// import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    // private roleService: RolesService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
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
    const { username, password } = userLoginDto;
    password;
    let user: any;
    user = await this.userService.login(username, password);
    let refresh_token = this.createRefreshToken({
      id: user?.id,
      email: user?.email,
      name: user?.name,
    });
    let access_token = this.createAccessToken({
      id: user?.id,
      email: user?.email,
      name: user?.name,
    });
    return {
      user: {
        email: user?.email,
        name: user?.name,
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
  // async register(regiterDto: RegisterDto) {
  //   const newUser = await this.adminsService.register(regiterDto);
  //   return {
  //     id: newUser?.id,
  //     email: newUser?.email,
  //     name: newUser?.name,
  //   };
  // }

  // async processNewToken(request: Request, response: Response) {
  //   try {
  //     const refreshToken = request.cookies['refresh_token'];
  //     this.jwtService.verify(refreshToken, {
  //       secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
  //     });
  //     const user = await this.adminsService.findOneByRefreshToken(refreshToken);
  //     if (user) {
  //       const { id, email, name, role } = user;
  //       const payload = {
  //         sub: 'token login',
  //         iss: 'from server',
  //         id,
  //         email,
  //         name,
  //         role,
  //       };

  //       const refreshToken = this.createRefreshToken(payload);

  //       // update user with refresh token
  //       await this.adminsService.updateUserToken(user.id, refreshToken);

  //       // set refresh token as cookie
  //       response.clearCookie('refresh_token');
  //       response.cookie('refresh_token', refreshToken, {
  //         httpOnly: true,
  //         secure: true,
  //         sameSite: 'none',
  //         maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
  //       });
  //       return {
  //         access_token: this.jwtService.sign(payload),
  //         user: {
  //           id,
  //           email,
  //           name,
  //           role,
  //         },
  //       };
  //     } else {
  //       throw new BadRequestException('Invalid refresh token');
  //     }
  //   } catch (error) {
  //     throw new BadRequestException('Invalid refresh token');
  //   }
  // }

  async logout(user: IUser, response: Response) {
    await this.userService.updateRefreshToken(user.id, '');
    response.clearCookie('refresh_token');
    return null;
  }
}
