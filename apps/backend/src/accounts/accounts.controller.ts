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
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from '@project-budget/database';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  findAll(@Query('userId') userId: string): Promise<Account[]> {
    return this.accountsService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<Account> {
    return this.accountsService.findOne(id, userId);
  }

  @Post()
  create(
    @Query('userId') userId: string,
    @Body() dto: CreateAccountDto,
  ): Promise<Account> {
    return this.accountsService.create(userId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() dto: UpdateAccountDto,
  ): Promise<Account> {
    return this.accountsService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<Account> {
    return this.accountsService.remove(id, userId);
  }
}
