import { BadRequestException, Injectable } from '@nestjs/common';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'prisma/prisma.service';
import { IUser } from 'src/interface/users.interface';
import { ActionService } from 'src/action/action.service';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private actionService: ActionService,
  ) {}

  async createPost(user: IUser, dto: CreatePostDto) {
    // Kiểm tra xem người dùng có phải là Admin không
    const admin = await this.prisma.admin.findUnique({
      where: { userId: user.id },
    });

    if (!admin) {
      throw new BadRequestException('Người dùng không phải là Admin');
    }

    try {
      // Tạo bài viết mới
      const post = await this.prisma.post.create({
        data: {
          name: dto.name,
          title: dto.title,
          description: dto.description,
          adminId: admin.id, // sử dụng admin.id, không phải user.id
          createdBy: user.email, // email của user tạo bài viết
        },
      });

      // Gọi service tạo hành động (action) khi bài viết được tạo
      await this.actionService.createAction({
        adminId: admin.id, // adminId được lấy từ Admin record
        action: `${user.email} đã tạo bài viết có tiêu đề: ${dto.title}`,
      });

      // Trả về bài viết đã được tạo nhưng không có adminId
      return {
        id: post.id,
        name: post.name,
        title: post.title,
        createdAt: post.createdAt,
        createdBy: post.createdBy,
        description: post.description,
        updateAt: post.updateAt, // Nếu cần thêm updateAt
        updateBy: post.updateBy, // Nếu cần thêm updateBy
      };
    } catch (err) {
      throw new BadRequestException('Không thể tạo bài viết: ' + err.message);
    }
  }

  async updatePost(user: IUser, postId: string, dto: UpdatePostDto) {
    // Tìm admin dựa trên user
    const admin = await this.prisma.admin.findUnique({
      where: { userId: user.id },
    });

    if (!admin) {
      throw new BadRequestException('Người dùng không phải là Admin');
    }

    try {
      // Cập nhật bài viết và không bao gồm adminId trong kết quả trả về
      const post = await this.prisma.post.update({
        where: { id: postId },
        data: {
          ...dto, // Sử dụng các trường từ dto để cập nhật bài viết
          updateAt: new Date(),
          updateBy: user.email,
        },
      });

      // Log hành động của admin
      await this.actionService.createAction({
        adminId: admin.id,
        action: `${user.email} đã cập nhật bài viết có tiêu đề: ${
          dto.title || 'Không có tiêu đề'
        }`,
      });

      // Trả về bài viết đã được cập nhật nhưng không có adminId
      return {
        id: post.id,
        name: post.name,
        title: post.title,
        createdAt: post.createdAt,
        createdBy: post.createdBy,
        updateAt: post.updateAt,
        updateBy: post.updateBy,
        description: post.description,
      };
    } catch (err) {
      throw new BadRequestException(
        'Không thể cập nhật bài viết: ' + err.message,
      );
    }
  }

  async getPost(id: string) {
    return await this.prisma.post.findUnique({
      where: { id },
      select: {
        // Sử dụng select để chỉ định các trường cụ thể trả về
        id: true,
        name: true,
        title: true,
        createdAt: true,
        createdBy: true,
        updateAt: true,
        updateBy: true,
        description: true,
      },
    });
  }

  async getAllPosts() {
    return await this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        // Sử dụng select để chỉ định các trường cụ thể trả về
        id: true,
        name: true,
        title: true,
        createdAt: true,
        createdBy: true,
        updateAt: true,
        updateBy: true,
        description: true,
      },
    });
  }

  async deletePost(id: string, user: IUser) {
    const admin = await this.prisma.admin.findUnique({
      where: { userId: user.id },
    });

    if (!admin) {
      throw new BadRequestException('Người dùng không phải là Admin');
    }
    let post = await this.getPost(id);
    await this.prisma.post.delete({
      where: { id },
    });
    this.actionService.createAction({
      adminId: admin.id, // lấy từ token hoặc request nếu có
      action: `${user.email} đã cập nhật lại bài viết có tiêu đề ${post.title}`, // hoặc ID, tuỳ theo cách bạn muốn log
    });
    return {
      message: 'Xóa bài viết thành công',
      post,
    };
  }
}
