import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { IUser } from 'src/interface/users.interface';
import { AddDishToCartDto } from './dto/addDishToCart.dto';
import { UpdateDishQuantityDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  // Thêm món ăn vào giỏ
  async addDishToCart(user: IUser, dto: AddDishToCartDto) {
    // Tìm giỏ hàng của guest
    const cart = await this.prisma.cart.findUnique({
      where: {
        guestId: user.guestId,
      },
    });

    if (!cart) {
      throw new NotFoundException('Không tìm thấy giỏ hàng');
    }

    // Kiểm tra nếu món ăn đã có thì cập nhật số lượng
    const existing = await this.prisma.cartAndDish.findFirst({
      where: {
        cartId: cart.id,
        dishId: dto.dishId,
      },
    });

    if (existing) {
      return this.prisma.cartAndDish.update({
        where: { id: existing.id },
        data: {
          number: dto.number,
        },
      });
    }

    // Nếu chưa có thì tạo mới
    return this.prisma.cartAndDish.create({
      data: {
        cartId: cart.id,
        dishId: dto.dishId,
        number: dto.number,
      },
    });
  }

  // Cập nhật số lượng món ăn
  async updateDishQuantity(cartDishId: string, dto: UpdateDishQuantityDto) {
    let cartDish = await this.prisma.cartAndDish.findUnique({
      where: {
        id: cartDishId,
      },
    });
    if (!cartDish) {
      throw new NotFoundException('lỗi Id ');
    }
    return this.prisma.cartAndDish.update({
      where: {
        id: cartDishId,
      },
      data: {
        number: dto.number,
      },
    });
  }

  // Xoá món ăn khỏi giỏ
  async removeDishFromCart(cartDishId: string) {
    return this.prisma.cartAndDish.delete({
      where: {
        id: cartDishId,
      },
    });
  }

  // Lấy tất cả món trong giỏ
  async findByUser(user: IUser) {
    return this.prisma.cartAndDish.findMany({
      where: {
        cart: {
          guestId: user.guestId,
        },
      },
      include: {
        dish: true,
      },
    });
  }
}
