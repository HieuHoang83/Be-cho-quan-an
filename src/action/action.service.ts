import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ActionService {
  constructor(private prisma: PrismaService) {}
  async findActionByID(adminId: string) {
    try {
      const actions = await this.prisma.action.findMany({
        where: { adminId },
        orderBy: { createdAt: 'desc' }, // Sắp xếp mới nhất trước
      });

      return actions;
    } catch (error) {
      throw new BadRequestException('Lỗi khi lấy hành động: ' + error.message);
    }
  }
  async getAllActions() {
    try {
      const actions = await this.prisma.action.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          admin: {
            include: {
              user: true,
            },
          },
        },
      });

      // Chỉ trả về các trường cần thiết
      return actions.map((action) => ({
        id: action.id,
        action: action.action,
        createdAt: action.createdAt,
        adminId: action.adminId,
        nameAdmin: action.admin?.user?.name || null,
      }));
    } catch (error) {
      throw new BadRequestException(
        'Không thể lấy danh sách hành động: ' + error.message,
      );
    }
  }
  async createAction(createActionDto: CreateActionDto) {
    try {
      return this.prisma.action.create({
        data: {
          action: createActionDto.action,
          admin: {
            connect: {
              id: createActionDto.adminId,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('Không thể tạo action: ' + error.message);
    }
  }
}
