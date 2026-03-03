import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '@project-budget/database';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Query('userId') userId: string): Promise<Category[]> {
    return this.categoriesService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<Category> {
    return this.categoriesService.findOne(id, userId);
  }

  @Post()
  create(
    @Query('userId') userId: string,
    @Body() dto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.create(userId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<Category> {
    return this.categoriesService.remove(id, userId);
  }
}
