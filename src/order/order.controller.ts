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
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/core/roles.guard';
import { ResponseMessage, User } from 'src/decorators/customize';
import { IUser } from 'src/interface/users.interface';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ResponseMessage('Tạo đơn hàng')
  create(@User() user: IUser, @Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(user, dto);
  }

  @Get()
  @Roles('Super Admin', 'Assistant Admin')
  @UseGuards(RolesGuard)
  @ResponseMessage('Lấy tất cả đơn hàng')
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  @ResponseMessage('Lấy chi tiết đơn hàng')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật đơn hàng')
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.orderService.update(id, dto);
  }

  @Delete(':id')
  @ResponseMessage('Xoá đơn hàng')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }

  @Get('guest/:guestId')
  @ResponseMessage('Đơn hàng theo người dùng')
  findByGuest(@Param('guestId') guestId: string) {
    return this.orderService.findByGuestId(guestId);
  }
}
