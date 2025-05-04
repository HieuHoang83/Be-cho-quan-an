import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { PrismaService } from 'prisma/prisma.service';
import { IUser } from 'src/interface/users.interface';

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
  async findAll() {
    try {
      const vouchers = await this.prisma.voucher.findMany();
      return vouchers;
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
  async getValidVouchers() {
    try {
      const currentDate = new Date(); // Lấy ngày hiện tại
      const validVouchers = await this.prisma.voucher.findMany({
        where: {
          dateStart: {
            lte: currentDate, // Lọc các voucher có ngày bắt đầu <= ngày hiện tại
          },
          dateEnd: {
            gte: currentDate, // Lọc các voucher có ngày kết thúc >= ngày hiện tại
          },
        },
      });

      return validVouchers;
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
