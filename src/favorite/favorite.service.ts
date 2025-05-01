import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IUser } from 'src/interface/users.interface';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class FavoriteService {
  constructor(private readonly prisma: PrismaService) {}
  async addFavorite(dishId: string, user: IUser) {
    try {
      const exists = await this.prisma.favorite.findUnique({
        where: {
          guestId_dishId: {
            guestId: user.guestId,
            dishId: dishId,
          },
        },
      });

      if (exists) {
        return;
      }

      return await this.prisma.favorite.create({
        data: {
          guestId: user.guestId,
          dishId: dishId,
        },
      });
    } catch (err) {
      throw new BadRequestException('Không thể thêm yêu thích: ' + err.message);
    }
  }

  async getFavorites(user: IUser) {
    return await this.prisma.favorite.findMany({
      where: { guestId: user.guestId },
      include: {
        dish: true,
      },
    });
  }

  async removeFavorite(user: IUser, dishId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        guestId_dishId: {
          guestId: user.guestId,
          dishId: dishId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Không tìm thấy mục yêu thích để xoá');
    }

    await this.prisma.favorite.delete({
      where: {
        guestId_dishId: {
          guestId: user.guestId,
          dishId: dishId,
        },
      },
    });

    return { message: 'Xoá thành công' };
  }
}
