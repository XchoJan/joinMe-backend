import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() userData: CreateUserDto): Promise<User> {
    return await this.usersService.create(userData);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | null> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() userData: Partial<User>,
  ): Promise<User | null> {
    const user = await this.usersService.update(id, userData);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @Put(':id/fcm-token')
  @HttpCode(HttpStatus.OK)
  async updateFcmToken(
    @Param('id') id: string,
    @Body() body: { fcmToken: string },
  ): Promise<User | null> {
    const user = await this.usersService.update(id, { fcmToken: body.fcmToken });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Post(':id/block')
  @HttpCode(HttpStatus.CREATED)
  async blockUser(
    @Param('id') blockerId: string,
    @Body() body: { blockedUserId: string },
  ) {
    if (!body?.blockedUserId) {
      throw new Error('blockedUserId is required');
    }
    return await this.usersService.blockUser(blockerId, body.blockedUserId);
  }

  @Post(':id/unblock')
  @HttpCode(HttpStatus.OK)
  async unblockUser(
    @Param('id') blockerId: string,
    @Body() body: { blockedUserId: string },
  ) {
    if (!body?.blockedUserId) {
      throw new Error('blockedUserId is required');
    }
    await this.usersService.unblockUser(blockerId, body.blockedUserId);
    return { success: true };
  }

  @Get(':id/blocked')
  async getBlockedUsers(@Param('id') blockerId: string): Promise<User[]> {
    return await this.usersService.getBlockedUsers(blockerId);
  }

  @Get(':blockerId/is-blocked/:blockedUserId')
  async isBlocked(
    @Param('blockerId') blockerId: string,
    @Param('blockedUserId') blockedUserId: string,
  ): Promise<{ blocked: boolean }> {
    const blocked = await this.usersService.isBlocked(blockerId, blockedUserId);
    return { blocked };
  }
}

