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
import { ActionService } from './action.service';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { ResponseMessage } from 'src/decorators/customize';
import { RolesGuard } from 'src/core/roles.guard';

@Controller('action')
export class ActionController {
  constructor(private readonly actionService: ActionService) {}

  @Get('/:id')
  @Roles('Super Admin')
  @UseGuards(RolesGuard)
  @ResponseMessage('Find action of Assistant Admin')
  findActionByID(@Param('id') id: string) {
    return this.actionService.findActionByID(id);
  }
  @Get()
  @Roles('Super Admin')
  @UseGuards(RolesGuard)
  @ResponseMessage('Get all actions')
  getAllActions() {
    return this.actionService.getAllActions();
  }
  @Post()
  @Roles('Super Admin', 'Assistant Admin')
  @UseGuards(RolesGuard)
  @ResponseMessage('Action created successfully')
  create(@Body() createActionDto: CreateActionDto) {
    return this.actionService.createAction(createActionDto);
  }
}
