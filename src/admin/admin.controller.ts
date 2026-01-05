import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './guards/admin.guard';
import { LoginDto } from './dto/login.dto';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';
import { Chat } from '../entities/chat.entity';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return await this.adminService.login(loginDto.username, loginDto.password);
  }

  @Get('events')
  @UseGuards(AdminGuard)
  async getAllEvents(): Promise<Event[]> {
    return await this.adminService.getAllEvents();
  }

  @Delete('events/:id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteEvent(@Param('id') id: string): Promise<void> {
    await this.adminService.deleteEvent(id);
  }

  @Get('users')
  @UseGuards(AdminGuard)
  async getAllUsers(): Promise<User[]> {
    return await this.adminService.getAllUsers();
  }

  @Delete('users/:id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.adminService.deleteUser(id);
  }

  @Post('users/:id/toggle-premium')
  @UseGuards(AdminGuard)
  async togglePremium(@Param('id') id: string): Promise<User> {
    return await this.adminService.togglePremium(id);
  }

  @Get('chats')
  @UseGuards(AdminGuard)
  async getAllChats(): Promise<Chat[]> {
    return await this.adminService.getAllChats();
  }

  @Delete('chats/:id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteChat(@Param('id') id: string): Promise<void> {
    await this.adminService.deleteChat(id);
  }

  @Get('statistics')
  @UseGuards(AdminGuard)
  async getStatistics() {
    return await this.adminService.getStatistics();
  }
}

