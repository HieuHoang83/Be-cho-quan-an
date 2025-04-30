import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { ActionService } from 'src/action/action.service';

@Module({
  imports: [PrismaModule],
  controllers: [PostController],
  providers: [PostService, ActionService],
})
export class PostModule {}
