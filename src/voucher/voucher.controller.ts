import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { ResponseMessage, User } from 'src/decorators/customize';
import { RolesGuard } from 'src/core/roles.guard';
import { IUser } from 'src/interface/users.interface';
import { GetPaginateInfo } from 'src/core/query.guard';
import { PaginateInfo } from 'src/interface/paginate.interface';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post('add')
  @Roles('Super Admin', 'Assistant Admin')
  @UseGuards(RolesGuard)
  @ResponseMessage('Thêm voucher')
  addVoucher(@User() user: IUser, @Body() dto: CreateVoucherDto) {
    return this.voucherService.createVoucher(user, dto);
  }
  @Get('search-by-code')
  async searchVoucherByCode(@Query('code') code: string) {
    return this.voucherService.findVoucherByCode(code);
  }
  @Patch(':id')
  @Roles('Super Admin', 'Assistant Admin')
  @UseGuards(RolesGuard)
  @ResponseMessage('Update voucher details')
  updateVoucher(
    @Param('id') id: string,
    @Body() updateVoucherDto: UpdateVoucherDto,
  ) {
    return this.voucherService.updateVoucher(id, updateVoucherDto);
  }
  @Get()
  @Roles('Super Admin', 'Assistant Admin')
  @UseGuards(RolesGuard)
  @ResponseMessage('Lấy tất cả voucher')
  getAll(@GetPaginateInfo() paginateInfo: PaginateInfo) {
    return this.voucherService.findAll(paginateInfo);
  }

  @Get('valid')
  @ResponseMessage('Lấy tất cả voucher còn hiệu lực')
  getValidVouchers(@GetPaginateInfo() paginateInfo: PaginateInfo) {
    return this.voucherService.getValidVouchers(paginateInfo);
  }

  @Delete(':id')
  @Roles('Super Admin', 'Assistant Admin')
  @UseGuards(RolesGuard)
  @ResponseMessage('Xoá voucher')
  deleteVoucher(@Param('id') id: string) {
    return this.voucherService.deleteVoucher(id);
  }
}
