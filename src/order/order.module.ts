import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { PrismaService } from 'prisma/prisma.service';
import { DishService } from 'src/dish/dish.service';
import { VoucherModule } from 'src/voucher/voucher.module';
import { VoucherService } from 'src/voucher/voucher.service';
import { NotifyService } from 'src/notify/notify.service';
import { CartService } from 'src/cart/cart.service';

@Module({
  controllers: [OrderController],
  providers: [
    OrderService,
    PrismaService,
    DishService,
    VoucherService,
    NotifyService,
    CartService,
  ],
})
export class OrderModule {}
