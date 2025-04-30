import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { UsersModule } from 'src/user/user.module';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule, UsersModule], // <-- THÊM IMPORT NÀY
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
