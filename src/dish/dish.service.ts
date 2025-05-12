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
    createDishDto.priceNew = createDishDto.priceNew ?? createDishDto.priceOld;
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
  async findDishesByName(name: string) {
    return this.prisma.dish.findMany({
      where: {
        name: {
          contains: name,
        },
      },
    });
  }
  async findAll(paginateInfo: PaginateInfo) {
    return this.prisma.dish.findMany({
      orderBy: { createdAt: 'desc' },
      skip: paginateInfo.offset, // Bỏ qua các bản ghi trước offset
      take: paginateInfo.limit,
    });
  }
  async findAllWithFavoriteFlag(paginateInfo: PaginateInfo, user: IUser) {
    const [dishes, favorites] = await Promise.all([
      this.prisma.dish.findMany({
        skip: paginateInfo.offset,
        take: paginateInfo.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.favorite.findMany({
        select: { dishId: true },
      }),
    ]);

    const favoriteIds = new Set(favorites.map((f) => f.dishId));

    return dishes.map((dish) => ({
      ...dish,
      isFavorite: favoriteIds.has(dish.id),
    }));
  }
  async findOne(id: string) {
    const dish = await this.prisma.dish.findUnique({
      where: { id },
      include: {
        reviews: true,
      },
    });

    if (!dish) {
      throw new NotFoundException('Không tìm thấy món ăn');
    }

    const totalReviews = dish.reviews.length;

    // Giả sử value là số dạng chuỗi, cần convert
    const avgRating =
      totalReviews > 0
        ? dish.reviews.reduce((sum, review) => sum + Number(review.value), 0) /
          totalReviews
        : 0;

    return {
      ...dish,
      totalReviews,
      avgRating: Number(avgRating.toFixed(1)),
    };
  }
  async findDishes(filter: {
    brand?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const { brand, type, minPrice, maxPrice } = filter;

    return this.prisma.dish.findMany({
      where: {
        ...(brand && { brand }),
        ...(type && { type }),
        OR: [
          {
            priceNew: {
              gte: minPrice ?? undefined,
              lte: maxPrice ?? undefined,
            },
          },
          {
            priceNew: null,
            priceOld: {
              gte: minPrice ?? undefined,
              lte: maxPrice ?? undefined,
            },
          },
        ],
      },
    });
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
      await this.prisma.dish.delete({
        where: { id },
      });
      return { message: 'Xóa món ăn thành công' };
    } catch (error) {
      throw new NotFoundException('Không thể xóa món ăn: ' + error.message);
    }
  }
}
