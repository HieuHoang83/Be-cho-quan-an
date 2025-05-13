import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { ResponseMessage, User } from 'src/decorators/customize';
import { RolesGuard } from 'src/core/roles.guard';
import { IUser } from 'src/interface/users.interface';
import { GetPaginateInfo } from 'src/core/query.guard';
import { PaginateInfo } from 'src/interface/paginate.interface';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('add')
  @Roles('Guest')
  @UseGuards(RolesGuard)
  @ResponseMessage('Add review to dish')
  addReview(@User() user: IUser, @Body() dto: CreateReviewDto) {
    return this.reviewService.addReview(user, dto);
  }

  @Patch(':id')
  @Roles('Guest')
  @UseGuards(RolesGuard)
  @ResponseMessage('Update review')
  updateReview(
    @User() user: IUser,
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewService.updateReview(user, id, dto);
  }

  @Delete(':id')
  @Roles('Guest')
  @UseGuards(RolesGuard)
  @ResponseMessage('Delete review')
  deleteReview(@User() user: IUser, @Param('id') id: string) {
    return this.reviewService.deleteReview(user, id);
  }

  @Get('by-dish/:dishId')
  @ResponseMessage('Get reviews by dish')
  getReviewsByDish(
    @GetPaginateInfo() paginateInfo: PaginateInfo,
    @Param('dishId') dishId: string,
    @User() user: IUser,
  ) {
    return this.reviewService.getReviewsByDish(dishId, user, paginateInfo);
  }
  @Get('reviews')
  @ResponseMessage('Get all reviews')
  findAllReviews(@GetPaginateInfo() paginateInfo: PaginateInfo) {
    return this.reviewService.findAllReviews(paginateInfo);
  }
}
