import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { BanUserDto } from './dto/ban-user.dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  private hashPassword(password: string): string {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }

  private checkPassword(password: string, hash: string): boolean {
    return compareSync(password, hash);
  }

  // ✅ Thêm user mới vào database
  async create(createUserDto: CreateUserDto) {
    const exists = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (exists)
      throw new BadRequestException({ message: 'Email already exists' });

    createUserDto.password = this.hashPassword(createUserDto.password);
    try {
      // Nếu là Guest
      if (createUserDto.role === 'Guest') {
        let user = await this.prismaService.user.create({
          data: createUserDto,
        });
        await this.prismaService.guest.create({
          data: {
            userId: user.id,
            gender: null,
            address: null,
            points: null,
            role: 'Normal',
          },
        });
        return user;
      }
      if (createUserDto.role === 'Assistant Admin') {
        let user = await this.prismaService.user.create({
          data: {
            ...createUserDto, // Dữ liệu từ CreateUserDto
            isBan: true, // Gán giá trị isBan là true khi tạo tài khoản
          },
        });
        await this.prismaService.admin.create({
          data: {
            userId: user.id,
          },
        });
        return user;
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ✅ Lấy danh sách tất cả users
  async findAll() {
    try {
      return await this.prismaService.user.findMany();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOneById(id: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOneByEmail(email: string) {
    try {
      return await this.prismaService.user.findUnique({
        where: { email },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await this.findOneByEmail(email);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (!this.checkPassword(password, user.password)) {
        throw new BadRequestException('Wrong password');
      }

      return user; // Trả về user (hoặc tạo JWT tại đây)
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // ✅ Cập nhật thông tin user

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    try {
      return await this.prismaService.user.update({
        where: { id: userId },
        data: { refreshToken },
      });
    } catch (error) {
      throw new BadRequestException('Cập nhật refresh token thất bại');
    }
  }
  // ✅ Xóa user theo ID
  async update(userId: string, updateUserDto: UpdateUserDto) {
    try {
      // Kiểm tra nếu có người dùng với ID này
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException({ message: 'User not found' });
      }

      // Cập nhật thông tin người dùng
      return await this.prismaService.user.update({
        where: { id: userId },
        data: updateUserDto,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    try {
      // Kiểm tra nếu có người dùng với ID này
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException({ message: 'User not found' });
      }

      // Kiểm tra mật khẩu cũ
      if (user.password !== this.hashPassword(updatePasswordDto.oldPassword)) {
        throw new BadRequestException({ message: 'Old password is incorrect' });
      }

      // Cập nhật mật khẩu mới
      const hashedPassword = this.hashPassword(updatePasswordDto.newPassword);
      return await this.prismaService.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async updateStatusUser(banUserDto: BanUserDto) {
    try {
      // Kiểm tra nếu có người dùng với ID này
      const user = await this.prismaService.user.findUnique({
        where: { id: banUserDto.userId },
      });

      if (!user) {
        throw new NotFoundException({ message: 'User not found' });
      }

      // Cập nhật trạng thái cấm/mở khóa người dùng
      return await this.prismaService.user.update({
        where: { id: banUserDto.userId },
        data: { isBan: banUserDto.isBan },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async remove(userId: string) {
    try {
      // Kiểm tra nếu có người dùng với ID này
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException({ message: 'User not found' });
      }

      // Xóa người dùng
      return await this.prismaService.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async findOneByRefreshToken(token: string) {
    return this.prismaService.user.findFirst({
      where: {
        refreshToken: token,
      },
    });
  }
  async updateUserToken(userId: string, refreshToken: string) {
    return this.prismaService.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }
}
