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
import { PaginateInfo } from 'src/interface/paginate.interface';
import { UpdateGuestDto } from './dto/update-guest.dto';

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
  async findAdminByUserId(userId: string) {
    const admin = await this.prismaService.admin.findUnique({
      where: { userId: userId },
    });

    return admin;
  }
  async findGuestByUserId(userId: string) {
    const guest = await this.prismaService.guest.findUnique({
      where: { userId: userId },
    });

    return guest;
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
        // B1: Tạo User
        let user = await this.prismaService.user.create({
          data: createUserDto,
        });

        // B2: Tạo Guest và gắn với userId
        let guest = await this.prismaService.guest.create({
          data: {
            userId: user.id, // GẮN trực tiếp userId
            gender: null,
            points: null,
            birthYear: null,
            role: 'Normal',
          },
        });

        // B3: Tạo Cart và gắn với Guest
        await this.prismaService.cart.create({
          data: {
            guest: {
              connect: { id: guest.id },
            },
          },
        });

        return user;
      }

      // Nếu là Assistant Admin
      if (createUserDto.role === 'Assistant Admin') {
        let user = await this.prismaService.user.create({
          data: {
            ...createUserDto, // Dữ liệu từ CreateUserDto
            isBan: true, // Gán giá trị isBan là true khi tạo tài khoản
          },
        });

        // Tạo Admin và liên kết với User
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
  async findGuests(paginateInfo: {
    page: number;
    limit: number;
    offset: number;
  }) {
    try {
      return await this.prismaService.user.findMany({
        where: { role: 'Guest' }, // Điều kiện lấy người dùng có role là 'Guest'
        skip: paginateInfo.offset, // Bỏ qua các bản ghi trước offset
        take: paginateInfo.limit, // Lấy số bản ghi theo limit
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async findAssistantAdmins(paginateInfo: {
    page: number;
    limit: number;
    offset: number;
  }) {
    try {
      return await this.prismaService.user.findMany({
        where: { role: 'Assistant Admin' }, // Điều kiện lấy người dùng có role là 'Assistant Admin'
        skip: paginateInfo.offset, // Bỏ qua các bản ghi trước offset
        take: paginateInfo.limit, // Lấy số bản ghi theo limit
      });
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
        throw new BadRequestException('username or password is incorrect');
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
  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
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
  async updateGuest(userId: string, updateGuestDto: UpdateGuestDto) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: { guest: true },
      });

      if (!user) {
        throw new NotFoundException({ message: 'User not found' });
      }

      if (!user.guest) {
        throw new NotFoundException({ message: 'Guest profile not found' });
      }

      // Cập nhật bảng Guest thông qua guestId
      return await this.prismaService.guest.update({
        where: { id: user.guest.id },
        data: updateGuestDto,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async getInfoByToken(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        // Chọn chỉ các trường cần thiết

        name: true,
        email: true,
        isBan: true,
        avatar: true,
        role: true,
        guest: {
          // Lấy thông tin từ bảng guest
          select: {
            gender: true,
            birthYear: true,
            address: true,
            phone: true,
            favoritefood: true,
            points: true,
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
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

      if (!this.checkPassword(updatePasswordDto.oldPassword, user.password)) {
        throw new BadRequestException('Old password is incorrect');
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
