import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotifyDto } from './dto/create-notify.dto';
import { UpdateNotifyDto } from './dto/update-notify.dto';
import { PrismaService } from 'prisma/prisma.service';
import { IUser } from 'src/interface/users.interface';

@Injectable()
export class NotifyService {
  constructor(private prisma: PrismaService) {}
  async create(userId: string, dto: CreateNotifyDto) {
    return this.prisma.notify.create({
      data: {
        message: dto.message,
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

  async update(id: string, dto: UpdateNotifyDto) {
    // Kiểm tra xem Notify có tồn tại không
    const existing = await this.prisma.notify.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Notify with ID ${id} not found`);
    }

    return this.prisma.notify.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} notify`;
  }
}
