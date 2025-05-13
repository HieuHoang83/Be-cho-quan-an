import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { PrismaService } from 'prisma/prisma.service';
import { IUser } from 'src/interface/users.interface';
import { PaginateInfo } from 'src/interface/paginate.interface';

@Injectable()
export class VoucherService {
  constructor(private prisma: PrismaService) {}

  // Thêm voucher
  async createVoucher(user: IUser, dto: CreateVoucherDto) {
    try {
      const newVoucher = await this.prisma.voucher.create({
        data: {
          description: dto.description,
          dateStart: dto.dateStart,
          dateEnd: dto.dateEnd,
          discount: dto.discount,
          admin: {
            connect: { id: user.adminId }, // Liên kết voucher với admin
          },

          code: dto.code,
          title: dto.title,
        },
      });
      return newVoucher;
    } catch (error) {
      throw new BadRequestException('Không thể tạo voucher: ' + error.message);
    }
  }

  // Cập nhật voucher
  async updateVoucher(id: string, dto: UpdateVoucherDto) {
    const existingVoucher = await this.prisma.voucher.findUnique({
      where: { id },
    });

    if (!existingVoucher) {
      throw new NotFoundException('Voucher không tồn tại');
    }

    try {
      const updatedVoucher = await this.prisma.voucher.update({
        where: { id },
        data: {
          description: dto.description,
          dateStart: dto.dateStart,
          dateEnd: dto.dateEnd,
          discount: dto.discount,
        },
      });
      return updatedVoucher;
    } catch (error) {
      throw new BadRequestException(
        'Không thể cập nhật voucher: ' + error.message,
      );
    }
  }

  // Lấy tất cả voucher
  async findAll(paginateInfo: PaginateInfo) {
    try {
      const totalItems = await this.prisma.voucher.count();
      const totalPages = Math.ceil(totalItems / paginateInfo.limit);

      const vouchers = await this.prisma.voucher.findMany({
        skip: paginateInfo.offset,
        take: paginateInfo.limit,
      });

      return {
        vouchers,
        totalItems,
        totalPages,
      };
    } catch (error) {
      throw new BadRequestException(
        'Không thể lấy danh sách voucher: ' + error.message,
      );
    }
  }
  async findByID(id: string) {
    const vouchers = await this.prisma.voucher.findFirst({ where: { id: id } });
    if (!vouchers) {
      throw new NotFoundException('Không tìm thấy voucher');
    }
    return vouchers;
  }
  async findVoucherByCode(code: string) {
    return this.prisma.voucher.findFirst({
      where: {
        code: {
          equals: code,
        },
      },
    });
  }
  async getValidVouchers(paginateInfo: PaginateInfo) {
    try {
      const currentDate = new Date();

      const totalItems = await this.prisma.voucher.count({
        where: {
          dateStart: { lte: currentDate },
          dateEnd: { gte: currentDate },
        },
      });

      const totalPages = Math.ceil(totalItems / paginateInfo.limit);

      const vouchers = await this.prisma.voucher.findMany({
        where: {
          dateStart: { lte: currentDate },
          dateEnd: { gte: currentDate },
        },
        skip: paginateInfo.offset,
        take: paginateInfo.limit,
      });

      return {
        vouchers,
        totalItems,
        totalPages,
      };
    } catch (error) {
      throw new BadRequestException(
        'Không thể lấy voucher còn hạn: ' + error.message,
      );
    }
  }
  // Xoá voucher
  async deleteVoucher(id: string): Promise<void> {
    const existingVoucher = await this.prisma.voucher.findUnique({
      where: { id },
    });

    if (!existingVoucher) {
      throw new NotFoundException('Voucher không tồn tại');
    }

    try {
      await this.prisma.voucher.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Không thể xoá voucher: ' + error.message);
    }
  }
}
