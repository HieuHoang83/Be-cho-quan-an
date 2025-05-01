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
import { CartService } from './cart.service';
import { UpdateDishQuantityDto } from './dto/update-cart.dto';
import { AddDishToCartDto } from './dto/addDishToCart.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { ResponseMessage, User } from 'src/decorators/customize';
import { RolesGuard } from 'src/core/roles.guard';
import { IUser } from 'src/interface/users.interface';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add-dish')
  @Roles('Guest')
  @UseGuards(RolesGuard)
  @ResponseMessage('Add dish to cart')
  addDishToCart(@User() user: IUser, @Body() dto: AddDishToCartDto) {
    return this.cartService.addDishToCart(user, dto);
  }

  @Patch('update-dish/:cartDishId')
  @Roles('Guest')
  @UseGuards(RolesGuard)
  @ResponseMessage('Update dish quantity in cart')
  updateDishQuantity(
    @Param('cartDishId') cartDishId: string,
    @Body() dto: UpdateDishQuantityDto,
  ) {
    return this.cartService.updateDishQuantity(cartDishId, dto);
  }

  // Xoá món ăn khỏi giỏ
  @Delete('remove-dish/:cartDishId')
  @Roles('Guest')
  @UseGuards(RolesGuard)
  @ResponseMessage('Remove dish from cart')
  removeDishFromCart(@Param('cartDishId') cartDishId: string) {
    return this.cartService.removeDishFromCart(cartDishId);
  }
  @Get()
  @Roles('Guest')
  @UseGuards(RolesGuard)
  @ResponseMessage('Get all dishes in cart')
  findAll() {
    return this.cartService.findAll();
  }
}
