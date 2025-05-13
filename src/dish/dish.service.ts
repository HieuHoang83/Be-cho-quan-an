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
  async findDishesByName(name: string, paginateInfo: PaginateInfo) {
    // Đếm tổng số món ăn khớp tên
    const totalItems = await this.prisma.dish.count({
      where: {
        name: {
          contains: name,
          mode: 'insensitive', // không phân biệt hoa thường
        },
      },
    });

    const totalPages = Math.ceil(totalItems / paginateInfo.limit);

    // Lấy dữ liệu theo trang
    const dishes = await this.prisma.dish.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: paginateInfo.offset,
      take: paginateInfo.limit,
    });

    return {
      dishes,
      totalItems,
      totalPages,
    };
  }
  async findAll(paginateInfo: PaginateInfo) {
    const totalItems = await this.prisma.dish.count(); // Đếm tổng số bản ghi
    const totalPages = Math.ceil(totalItems / paginateInfo.limit); // Tính tổng số trang

    // Lấy dữ liệu theo phân trang
    const dishes = await this.prisma.dish.findMany({
      orderBy: { createdAt: 'desc' },
      skip: paginateInfo.offset, // Bỏ qua các bản ghi trước offset
      take: paginateInfo.limit, // Lấy số bản ghi giới hạn theo limit
    });

    return {
      dishes, // Dữ liệu món ăn
      totalItems, // Tổng số bản ghi
      totalPages, // Tổng số trang
    };
  }
  async findAllWithFavoriteFlag(paginateInfo: PaginateInfo, user: IUser) {
    const totalItems = await this.prisma.dish.count(); // Đếm tổng số món ăn
    const totalPages = Math.ceil(totalItems / paginateInfo.limit); // Tính tổng số trang
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

    return {
      dishes: dishes.map((dish) => ({
        ...dish,
        isFavorite: favoriteIds.has(dish.id), // Kiểm tra món ăn có được yêu thích không
      })),
      totalItems, // Tổng số món ăn trong cơ sở dữ liệu
      totalPages, // Tổng số trang
    };
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
  async findDishes(
    filter: {
      brand?: string;
      type?: string;
      minPrice?: number;
      maxPrice?: number;
    },
    paginateInfo: PaginateInfo,
  ) {
    const { brand, type, minPrice, maxPrice } = filter;

    // Điều kiện lọc
    const whereCondition = {
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
    };

    // Tổng số món ăn sau khi lọc
    const totalItems = await this.prisma.dish.count({
      where: whereCondition,
    });

    const totalPages = Math.ceil(totalItems / paginateInfo.limit);

    // Lấy dữ liệu theo trang
    const dishes = await this.prisma.dish.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      skip: paginateInfo.offset,
      take: paginateInfo.limit,
    });

    return {
      dishes,
      totalItems,
      totalPages,
    };
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
