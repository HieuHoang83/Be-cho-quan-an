import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { PrismaService } from 'prisma/prisma.service';
import { IUser } from 'src/interface/users.interface';
import { PaginateInfo } from 'src/interface/paginate.interface';

@Injectable()
export class DishService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: IUser, createDishDto: CreateDishDto) {
    const admin = await this.prisma.admin.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!admin) {
      throw new BadRequestException('Người dùng không phải là Admin');
    }

    try {
      return await this.prisma.dish.create({
        data: {
          ...createDishDto,
          admin: {
            connect: {
              id: admin.id,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('Không thể tạo món ăn: ' + error.message);
    }
  }

  async findAll(paginateInfo: PaginateInfo) {
    return this.prisma.dish.findMany({
      orderBy: { createdAt: 'desc' },
      skip: paginateInfo.offset, // Bỏ qua các bản ghi trước offset
      take: paginateInfo.limit,
    });
  }

  async findOne(id: string) {
    const dish = await this.prisma.dish.findUnique({ where: { id } });
    if (!dish) {
      throw new NotFoundException('Không tìm thấy món ăn');
    }
    return dish;
  }

  async update(user: IUser, id: string, updateDishDto: UpdateDishDto) {
    // Tìm admin tương ứng với user hiện tại
    const admin = await this.prisma.admin.findUnique({
      where: { userId: user.id },
    });

    if (!admin) {
      throw new BadRequestException('Người dùng không phải là Admin');
    }

    try {
      return await this.prisma.dish.update({
        where: { id },
        data: {
          ...updateDishDto,
          updateBy: admin.id, // Ghi nhận admin nào đã update
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'Không thể cập nhật món ăn: ' + error.message,
      );
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.dish.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException('Không thể xóa món ăn: ' + error.message);
    }
  }
}
