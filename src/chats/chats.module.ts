import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { ChatsGateway } from './chats.gateway';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { Event } from '../entities/event.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, Message, User, Event]),
    NotificationsModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsService, ChatsGateway],
  exports: [ChatsService, ChatsGateway],
})
export class ChatsModule {}

