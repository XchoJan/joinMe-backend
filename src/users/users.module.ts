import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { BlockedUser } from '../entities/blocked-user.entity';
import { Event } from '../entities/event.entity';
import { Chat } from '../entities/chat.entity';
import { EventRequest } from '../entities/event-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, BlockedUser, Event, Chat, EventRequest])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

