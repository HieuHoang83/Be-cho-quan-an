import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  Query,
} from '@nestjs/common';
import { DishService } from './dish.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { IUser } from 'src/interface/users.interface';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/core/roles.guard';
import { use } from 'passport';
import { GetPaginateInfo } from 'src/core/query.guard';
import { PaginateInfo } from 'src/interface/paginate.interface';

@Controller('dish')
export class DishController {
  constructor(private readonly dishService: DishService) {}

  @Roles('Super Admin', 'Assistant Admin')
  @UseGuards(RolesGuard)
  @ResponseMessage('Create dish')
  @Post()
  create(@User() user: IUser, @Body() createDishDto: CreateDishDto) {
    return this.dishService.create(user, createDishDto);
  }
  @Get('search')
  async searchDishes(
    @Query('brand') brand?: string,
    @Query('type') type?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.dishService.findDishes({
      brand,
      type,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  }
  @Public()
  @ResponseMessage('Get all dishes no favorite')
  @Get('')
  findAll(@GetPaginateInfo() paginateInfo: PaginateInfo) {
    return this.dishService.findAll(paginateInfo);
  }
  @Roles('Guest')
  @UseGuards(RolesGuard)
  @ResponseMessage('Get all dishes with favorite flag')
  @Get('guest')
  findAllGuest(
    @GetPaginateInfo() paginateInfo: PaginateInfo,
    @User() user: IUser,
  ) {
    return this.dishService.findAllWithFavoriteFlag(paginateInfo, user);
  }
  @Public()
  @ResponseMessage('Get dish by ID')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dishService.findOne(id);
  }

  @Roles('Super Admin', 'Assistant Admin')
  @UseGuards(RolesGuard)
  @ResponseMessage('Update dish')
  @Patch(':id')
  update(
    @User() user: IUser,
    @Param('id') id: string,
    @Body() updateDishDto: UpdateDishDto,
  ) {
    return this.dishService.update(user, id, updateDishDto);
  }

  @Roles('Super Admin', 'Assistant Admin')
  @UseGuards(RolesGuard)
  @ResponseMessage('Delete dish')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dishService.remove(id);
  }
}
