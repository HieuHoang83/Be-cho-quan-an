// src/seeder/seeder.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    // 1. Tạo mật khẩu hash dùng chung
    const userCount = await this.prisma.user.count();
    if (userCount > 0) {
      return;
    }
    const password = await bcrypt.hash('123456', 10);

    // 2. User kiểu Guest
    const guestUser = await this.prisma.user.upsert({
      where: { email: 'guest@example.com' },
      update: {},
      create: {
        name: 'Guest User',
        email: 'guest@example.com',
        password,
        role: 'Guest',

        guest: {
          create: {
            gender: 'Male',
            points: 10,
            role: 'Normal',
          },
        },
      },
      include: {
        guest: true, // Bao gồm thông tin guest khi trả về
      },
    });

    // Tạo Cart cho Guest
    await this.prisma.cart.create({
      data: {
        guest: {
          connect: { id: guestUser.guest.id }, // Sử dụng connect để liên kết với Guest
        },
      },
    });

    // 3. User kiểu Assistant Admin
    const assistantAdmin = await this.prisma.user.upsert({
      where: { email: 'assistantAdmin@example.com' },
      update: {},
      create: {
        name: 'Assistant Admin',
        email: 'assistantAdmin@example.com',
        password,
        role: 'Assistant Admin',
        isBan: false,
        admin: {
          create: {},
        },
      },
    });
    //Super Admin
    const adminUser = await this.prisma.user.upsert({
      where: { email: 'superAdmin@example.com' },
      update: {},
      create: {
        name: 'Super Admin',
        email: 'superAdmin@example.com',
        password,
        role: 'Super Admin',
        isBan: false,
        admin: {
          create: {},
        },
      },
    });
    console.log('create Init data in database');
  }
}
