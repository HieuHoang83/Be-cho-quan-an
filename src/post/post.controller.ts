import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/core/roles.guard';
import { Public, User } from 'src/decorators/customize';
import { IUser } from 'src/interface/users.interface';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @Roles('Super Admin', 'Assistant Admin')
  @UseGuards(RolesGuard)
  create(@User() user: IUser, @Body() dto: CreatePostDto) {
    return this.postService.createPost(user, dto);
  }

  @Public()
  @Get()
  findAll() {
    return this.postService.getAllPosts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.getPost(id);
  }

  @Patch(':id')
  @Roles('Super Admin', 'Assistant Admin')
  @UseGuards(RolesGuard)
  update(
    @User() user: IUser,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postService.updatePost(user, id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.postService.deletePost(id, user);
  }
}
