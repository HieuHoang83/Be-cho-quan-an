import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { IUser } from 'src/interface/users.interface';
import { PrismaService } from 'prisma/prisma.service';
import { VoucherService } from 'src/voucher/voucher.service';
import { DishService } from 'src/dish/dish.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private voucherService: VoucherService,
    private dishService: DishService,
  ) {}

  async createOrder(user: IUser, dto: CreateOrderDto) {
    try {
      let voucher = null;
      if (dto.voucherId) {
        voucher = await this.voucherService.findByID(dto.voucherId);
        const now = new Date();
        if (!voucher || voucher.dateStart > now || voucher.dateEnd < now) {
          throw new BadRequestException('Voucher không hợp lệ');
        }
      }

      // 👉 Tính tổng tiền trước khi áp dụng giảm giá
      const dishIds = dto.orderAndDish.map((item) => item.dishId);
      const dishes = await this.prisma.dish.findMany({
        where: { id: { in: dishIds } },
        select: { id: true, cost: true },
      });

      const dishCostMap = new Map(dishes.map((d) => [d.id, d.cost]));

      let total = 0;
      for (const item of dto.orderAndDish) {
        const cost = dishCostMap.get(item.dishId);
        if (cost === undefined) {
          throw new BadRequestException(
            `Không tìm thấy món ăn với id: ${item.dishId}`,
          );
        }
        total += cost * item.number;
      }

      // 👉 Áp dụng giảm giá
      const discountPercent = voucher?.discount || 0;
      const finalPayment = Math.floor((total * (100 - discountPercent)) / 100);

      const order = await this.prisma.order.create({
        data: {
          guestId: user.id,
          status: dto.status,
          phone: dto.phone,
          address: dto.address,
          description: dto.description,
          payment: finalPayment,
          type: dto.type,
          discount: discountPercent,
          voucherId: voucher?.id,
          orderAndDish: {
            create: dto.orderAndDish.map((item) => ({
              dishId: item.dishId,
              number: item.number,
            })),
          },
        },
        include: { orderAndDish: true },
      });

      return order;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        orderAndDish: {
          include: {
            dish: true, // Lấy thông tin món ăn
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderAndDish: {
          include: {
            dish: true, // Lấy thông tin món ăn
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  async update(id: string, dto: UpdateOrderDto) {
    try {
      let voucher = null;
      let orderOld = await this.prisma.order.findUnique({
        where: { id },
      });
      // Nếu có voucher, kiểm tra tính hợp lệ của voucher
      if (dto.voucherId) {
        voucher = await this.voucherService.findByID(dto.voucherId);
        const now = new Date();
        if (!voucher || voucher.dateStart > now || voucher.dateEnd < now) {
          throw new BadRequestException('Voucher không hợp lệ');
        }
      }

      // 👉 Tính tổng tiền trước khi áp dụng giảm giá
      const dishIds = dto.orderAndDish.map((item) => item.dishId);
      const dishes = await this.prisma.dish.findMany({
        where: { id: { in: dishIds } },
        select: { id: true, cost: true },
      });

      const dishCostMap = new Map(dishes.map((d) => [d.id, d.cost]));

      let total = 0;
      for (const item of dto.orderAndDish) {
        const cost = dishCostMap.get(item.dishId);
        if (cost === undefined) {
          throw new BadRequestException(
            `Không tìm thấy món ăn với id: ${item.dishId}`,
          );
        }
        total += cost * item.number;
      }

      // 👉 Áp dụng giảm giá (nếu có voucher)
      const discountPercent = voucher?.discount || orderOld.discount || 0;
      const finalPayment = Math.floor((total * (100 - discountPercent)) / 100);

      // Cập nhật đơn hàng với thông tin mới
      const order = await this.prisma.order.update({
        where: { id },
        data: {
          ...dto,
          payment: finalPayment, // Cập nhật lại số tiền thanh toán
          discount: discountPercent,
          voucherId: voucher?.id,
          orderAndDish: dto.orderAndDish
            ? {
                deleteMany: {}, // Xóa các món cũ
                create: dto.orderAndDish.map((item) => ({
                  dishId: item.dishId,
                  number: item.number,
                })),
              }
            : undefined,
        },
        include: { orderAndDish: true },
      });

      return order;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    return this.prisma.order.delete({ where: { id } });
  }

  async findByGuestId(guestId: string) {
    return this.prisma.order.findMany({
      where: { guestId },
      include: {
        orderAndDish: {
          include: {
            dish: true, // Lấy dữ liệu món ăn
          },
        },
      },
    });
  }
}
