import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'prisma/prisma.service';
import { IUser } from 'src/interface/users.interface';
import { ReviewDto } from './dto/ReviewDto';
import { PaginateInfo } from 'src/interface/paginate.interface';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  // Thêm đánh giá
  async addReview(user: IUser, dto: CreateReviewDto) {
    try {
      const review = await this.prisma.review.create({
        data: {
          value: dto.value,
          comment: dto.comment,
          dish: {
            connect: { id: dto.dishId },
          },
          guest: {
            connect: { id: user.guestId },
          },
        },
        include: {
          dish: false,
        },
      });

      return {
        id: review.id,
        comment: review.comment,
        value: review.value,
        createdAt: review.createdAt,
        guestname: user.name,
      };
    } catch (error) {
      throw new BadRequestException(
        'Không thể thêm đánh giá: ' + error.message,
      );
    }
  }

  // Cập nhật đánh giá
  async updateReview(user: IUser, id: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review || review.guestId !== user.guestId) {
      throw new NotFoundException(
        'Đánh giá không tồn tại hoặc bạn không có quyền',
      );
    }

    const updatedReview = await this.prisma.review.update({
      where: { id },
      data: {
        value: dto.value,
        comment: dto.comment,
      },
      include: {
        dish: false,
      },
    });

    return {
      id: updatedReview.id,
      comment: updatedReview.comment,
      value: updatedReview.value,
      createdAt: updatedReview.createdAt,
      guestname: user.name,
    };
  }

  // Xóa đánh giá
  async deleteReview(user: IUser, id: string): Promise<void> {
    const review = await this.prisma.review.findUnique({ where: { id } });

    if (!review || review.guestId !== user.guestId) {
      throw new NotFoundException(
        'Đánh giá không tồn tại hoặc bạn không có quyền',
      );
    }

    await this.prisma.review.delete({ where: { id } });
  }

  // Lấy tất cả đánh giá của một món ăn
  async getReviewsByDish(
    dishId: string,
    user: IUser,
    paginateInfo: PaginateInfo,
  ) {
    try {
      const totalItems = await this.prisma.review.count({
        where: { dishId },
      });

      const totalPages = Math.ceil(totalItems / paginateInfo.limit);

      const reviews = await this.prisma.review.findMany({
        where: { dishId },
        skip: paginateInfo.offset,
        take: paginateInfo.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          guest: {
            select: {
              user: {
                select: { name: true, id: true },
              },
            },
          },
          dish: true,
        },
      });

      const formattedReviews = reviews.map((review) => ({
        id: review.id,
        comment: review.comment,
        value: review.value,
        createdAt: review.createdAt,
        guestname: review.guest?.user.name,
        isMyEvalte: review.guest?.user.id === user.id,
      }));

      return {
        reviews: formattedReviews,
        totalItems,
        totalPages,
      };
    } catch (error) {
      throw new BadRequestException(
        'Không thể lấy các đánh giá của món ăn: ' + error.message,
      );
    }
  }

  // Lấy tất cả đánh giá của người dùng
  async getReviewsByUser(user: IUser) {
    try {
      const reviews = await this.prisma.review.findMany({
        where: { guestId: user.guestId },
        include: {
          guest: {
            // Truy vấn guest và user liên kết với guest
            select: {
              user: {
                select: { name: true }, // Lấy tên của người dùng liên kết với guest
              },
            },
          },
          dish: true,
        },
      });

      return reviews.map((review) => {
        return {
          id: review.id,
          comment: review.comment,
          value: review.value,
          createdAt: review.createdAt,
          guestname: review.guest?.user.name, // Lấy tên từ user liên kết với guest
          dishId: review.dishId,
          dish: review.dish,
        };
      });
    } catch (error) {
      throw new BadRequestException(
        'Không thể lấy các đánh giá của người dùng: ' + error.message,
      );
    }
  }

  async findAllReviews(paginateInfo: PaginateInfo) {
    try {
      const totalItems = await this.prisma.review.count();

      const totalPages = Math.ceil(totalItems / paginateInfo.limit);

      const reviews = await this.prisma.review.findMany({
        skip: paginateInfo.offset,
        take: paginateInfo.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          guest: { select: { user: { select: { name: true } } } },
          dish: true,
        },
      });

      const formattedReviews = reviews.map((review) => ({
        id: review.id,
        comment: review.comment,
        value: review.value,
        createdAt: review.createdAt,
        guestname: review.guest?.user.name,
        dishId: review.dishId,
        dish: review.dish,
      }));

      return {
        reviews: formattedReviews,
        totalItems,
        totalPages,
      };
    } catch (error) {
      throw new BadRequestException(
        'Không thể lấy tất cả các đánh giá: ' + error.message,
      );
    }
  }
}
