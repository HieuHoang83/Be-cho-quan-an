import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
    const user = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (user)
      throw new BadRequestException({ message: 'Email already exists' });

    createUserDto.password = this.hashPassword(createUserDto.password);
    try {
      return await this.prismaService.user.create({
        data: createUserDto,
      });
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
  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      return await this.prismaService.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
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
  async remove(id: string) {
    try {
      return await this.prismaService.user.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('User not found or already deleted');
    }
  }
}
