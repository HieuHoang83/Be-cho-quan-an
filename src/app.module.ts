import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/user.module';
import { NotifyModule } from './notify/notify.module';
import { SeederModule } from './Seeder/seeder.module';
import { ActionModule } from './action/action.module';
import { PostModule } from './post/post.module';
import { DishModule } from './dish/dish.module';
import { CartModule } from './cart/cart.module';
import { ReviewModule } from './review/review.module';
import { FavoriteModule } from './favorite/favorite.module';
import { VoucherModule } from './voucher/voucher.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    //gioi han luot goi api/ 1 may sd
    ThrottlerModule.forRoot([
      {
        ttl: 60000, //mili giay
        limit: 10, //gioi han trong n giay do
      },
    ]),
    UsersModule,
    AuthModule,
    NotifyModule,
    SeederModule,
    ActionModule,
    PostModule,
    DishModule,
    CartModule,
    ReviewModule,
    FavoriteModule,
    VoucherModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
