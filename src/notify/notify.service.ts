import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotifyDto } from './dto/create-notify.dto';
import { UpdateNotifyDto } from './dto/update-notify.dto';
import { PrismaService } from 'prisma/prisma.service';
import { IUser } from 'src/interface/users.interface';

@Injectable()
export class NotifyService {
  constructor(private prisma: PrismaService) {}
  async create(userId: string, message: string) {
    return this.prisma.notify.create({
      data: {
        message: message,
        userId: userId,
        read: false, // Không cần, đã default trong schema
      },
    });
  }
  findAll() {
    return `This action returns all notify`;
  }

  async findOne(userId: string) {
    return this.prisma.notify.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }, // Lấy thông báo mới nhất nếu cần
    });
  }

  async update(user: IUser, dto: UpdateNotifyDto) {
    {
      const result = await this.prisma.notify.updateMany({
        where: {
          userId: user.id,
          read: false, // chỉ cập nhật những cái chưa đọc
        },
        data: {
          read: true,
        },
      });

      return {
        updatedCount: result.count,
        message: `${result.count} notifications marked as read.`,
      };
    }
  }

  remove(id: number) {
    return `This action removes a #${id} notify`;
  }
}
