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
    try {
      let post = await this.prisma.post.create({
        data: {
          name: dto.name,
          title: dto.title,
          description: dto.description,
          adminId: user.id,
          createdBy: user.email,
        },
      });
      await this.actionService.createAction({
        adminId: user.id, // lấy từ token hoặc request nếu có
        action: `${user.email} đã tạo bài viết có tiêu đề ${dto.title}`, // hoặc ID, tuỳ theo cách bạn muốn log
      });
      return post;
    } catch (err) {
      throw new BadRequestException('Không thể tạo bài viết: ' + err.message);
    }
  }

  async updatePost(user: IUser, postId: string, dto: UpdatePostDto) {
    try {
      let post = await this.prisma.post.update({
        where: { id: postId },
        data: {
          ...dto,
          updateAt: new Date(),
          updateBy: user.email,
        },
      });
      await this.actionService.createAction({
        adminId: user.id, // lấy từ token hoặc request nếu có
        action: `${user.email} đã cập nhật lại bài viết có tiêu đề ${dto.title}`, // hoặc ID, tuỳ theo cách bạn muốn log
      });
      return post;
    } catch (err) {
      throw new BadRequestException(
        'Không thể cập nhật bài viết: ' + err.message,
      );
    }
  }

  async getPost(id: string) {
    return await this.prisma.post.findUnique({
      where: { id },
      include: { admin: true },
    });
  }

  async getAllPosts() {
    return await this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: { admin: true },
    });
  }

  async deletePost(id: string, user: IUser) {
    let post = await this.getPost(id);
    await this.prisma.post.delete({
      where: { id },
    });
    await this.actionService.createAction({
      adminId: user.id, // lấy từ token hoặc request nếu có
      action: `${user.email} đã cập nhật lại bài viết có tiêu đề ${post.title}`, // hoặc ID, tuỳ theo cách bạn muốn log
    });
  }
}
