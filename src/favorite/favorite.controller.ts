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
import { FavoriteService } from './favorite.service';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/core/roles.guard';
import { ResponseMessage, User } from 'src/decorators/customize';
import { IUser } from 'src/interface/users.interface';

@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  @Roles('Guest/:dishId')
  @UseGuards(RolesGuard)
  @ResponseMessage('Đã thêm vào danh sách yêu thích')
  addFavorite(@Param('dishId') dishId: string, @User() user: IUser) {
    return this.favoriteService.addFavorite(dishId, user);
  }

  // Lấy danh sách món ăn yêu thích của người dùng
  @Get()
  @Roles('Guest')
  @UseGuards(RolesGuard)
  @ResponseMessage('Lấy danh sách yêu thích thành công')
  getFavorites(@User() user: IUser) {
    return this.favoriteService.getFavorites(user);
  }

  // Xoá món ăn khỏi danh sách yêu thích
  @Delete(':dishId')
  @Roles('Guest')
  @UseGuards(RolesGuard)
  @ResponseMessage('Đã xoá khỏi danh sách yêu thích')
  removeFavorite(@User() user: IUser, @Param('dishId') dishId: string) {
    return this.favoriteService.removeFavorite(user, dishId);
  }
}
