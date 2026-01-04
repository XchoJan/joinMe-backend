import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event } from '../entities/event.entity';
import { EventRequest } from '../entities/event-request.entity';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, EventRequest, Chat, Message, User]),
    NotificationsModule,
    UsersModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}

