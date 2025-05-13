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
import { NotifyService } from 'src/notify/notify.service';
import { GetTotalPriceDto } from './dto/getTotalPrice.dto';
import { CartService } from 'src/cart/cart.service';
import { PaginateInfo } from 'src/interface/paginate.interface';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private voucherService: VoucherService,
    private notifyService: NotifyService,
    private dishService: DishService,
    private cartService: CartService,
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
        select: { id: true, priceNew: true },
      });

      const dishCostMap = new Map(dishes.map((d) => [d.id, d.priceNew]));

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
      if (!voucher) {
        throw new BadRequestException('Voucher không tồn tại');
      }

      const discountPercent = voucher.discount;
      const finalPayment = Math.floor((total * (100 - discountPercent)) / 100);

      const order = await this.prisma.order.create({
        data: {
          guestId: user.guestId,
          status: 'pending',
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
          nameUser: dto.nameUser,
          email: dto.email,
          note: dto.note,
        },
        include: { orderAndDish: true },
      });
      // Gửi thông báo cho người dùng
      const notify = await this.notifyService.create(
        user.id,
        `Đơn hàng của bạn đang chờ xử lý với mã đơn hàng: ${order.id}`,
      );

      await this.cartService.removeAllCartDishesByGuestId(user.guestId);
      return order;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async getTotalPrice(dto: GetTotalPriceDto) {
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
        select: { id: true, priceNew: true },
      });

      const dishCostMap = new Map(dishes.map((d) => [d.id, d.priceNew]));

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
      if (!voucher) {
        throw new BadRequestException('Voucher không tồn tại');
      }

      const discountPercent = voucher.discount;
      const finalPayment = Math.floor((total * (100 - discountPercent)) / 100);

      return finalPayment;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async updateStatus(orderId: string, status: string) {
    try {
      // Tìm đơn hàng hiện tại trong database
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });

      // Kiểm tra nếu không tìm thấy đơn hàng
      if (!order) {
        throw new BadRequestException('Không tìm thấy đơn hàng');
      }

      // Cập nhật trạng thái đơn hàng
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status, // Cập nhật trạng thái mới
        },
      });

      // Tạo thông báo tùy theo trạng thái đơn hàng
      let message = '';
      switch (status) {
        case 'pending':
          message = `Đơn hàng của bạn đang chờ xử lý với mã đơn hàng: ${order.id}`;
          break;
        case 'confirmed':
          message = `Đơn hàng của bạn đã được xác nhận với mã đơn hàng: ${order.id}`;
          break;
        case 'completed':
          message = `Đơn hàng của bạn đã hoàn thành với mã đơn hàng: ${order.id}`;
          break;
        case 'canceled':
          message = `Đơn hàng của bạn đã bị hủy với mã đơn hàng: ${order.id}`;
          break;
        default:
          message = `Trạng thái đơn hàng của bạn đã được cập nhật với mã đơn hàng: ${order.id}`;
          break;
      }

      // Gửi thông báo cho người dùng
      let guest = await this.prisma.guest.findUnique({
        where: { id: order.guestId },
      });
      await this.notifyService.create(
        guest.userId, // ID người dùng
        message, // Nội dung thông báo
      );

      return updatedOrder; // Trả về đơn hàng sau khi được cập nhật
    } catch (error) {
      // Nếu có lỗi, ném ra BadRequestException với thông điệp lỗi
      throw new BadRequestException(error.message);
    }
  }
  async findAll(paginateInfo: PaginateInfo) {
    try {
      const totalItems = await this.prisma.order.count();

      const totalPages = Math.ceil(totalItems / paginateInfo.limit);
      const orders = await this.prisma.order.findMany({
        include: {
          orderAndDish: {
            include: {
              dish: true,
            },
          },
        },
        skip: paginateInfo.offset,
        take: paginateInfo.limit,
        orderBy: { createdAt: 'desc' }, // sắp xếp theo thời gian mới nhất
      });

      // Xử lý lại để trả về định dạng yêu cầu
      const formattedOrders = orders.map((order) => ({
        id: order.id,
        createdAt: order.createdAt,
        phone: order.phone,
        address: order.address,
        nameUser: order.nameUser,
        email: order.email,
        note: order.note,
        payment: order.payment,
        status: order.status,
        type: order.type,
        description: order.description,
        listOrder: order.orderAndDish.map((item) => ({
          dishId: item.dishId,
          nameDish: item.dish.name,
          number: item.number,
          url: item.dish.url,
        })),
      }));

      return {
        orders: formattedOrders,
        totalItems,
        totalPages,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
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

  async remove(id: string) {
    return this.prisma.order.delete({ where: { id } });
  }

  async findByGuestId(guestId: string, paginateInfo: PaginateInfo) {
    try {
      const totalItems = await this.prisma.order.count({
        where: { guestId },
      });

      const totalPages = Math.ceil(totalItems / paginateInfo.limit);
      const orders = await this.prisma.order.findMany({
        where: { guestId },
        include: {
          orderAndDish: {
            include: {
              dish: true, // Lấy thông tin món ăn
            },
          },
        },
        skip: paginateInfo.offset,
        take: paginateInfo.limit,
        orderBy: { createdAt: 'desc' },
      });

      // Xử lý lại để trả về định dạng yêu cầu
      const formattedOrders = orders.map((order) => ({
        id: order.id,
        createdAt: order.createdAt,
        phone: order.phone,
        address: order.address,
        payment: order.payment,
        status: order.status,
        type: order.type,
        description: order.description,
        listOrder: order.orderAndDish.map((item) => ({
          dishId: item.dishId,
          nameDish: item.dish.name,
          number: item.number,
          url: item.dish.url,
        })),
      }));

      return {
        orders: formattedOrders,
        totalItems,
        totalPages,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async updateOrder(id: string, dto: UpdateOrderDto) {
    try {
      // Kiểm tra nếu đơn hàng tồn tại
      const order = await this.prisma.order.findUnique({
        where: { id },
      });

      if (!order) {
        throw new BadRequestException('Đơn hàng không tồn tại');
      }

      // Cập nhật các trường của đơn hàng
      const updatedOrder = await this.prisma.order.update({
        where: { id },
        data: {
          ...dto, // Dữ liệu cập nhật
        },
      });

      // Kiểm tra trạng thái để gửi thông báo
      let message = `Đơn hàng của bạn đã được cập nhật với mã đơn hàng: ${updatedOrder.id}`;

      // Tùy chỉnh thông báo theo loại trạng thái (ví dụ: "đang xử lý", "hoàn thành" v.v.)

      // Gửi thông báo cho người dùng
      await this.notifyService.create(
        order.guestId, // ID người dùng
        message, // Nội dung thông báo
      );
      // Trả về đơn hàng đã cập nhật
      return updatedOrder;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
