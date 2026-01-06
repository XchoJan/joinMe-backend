import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventsScheduler } from './events.scheduler';
import { Event } from '../entities/event.entity';
import { EventRequest } from '../entities/event-request.entity';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, EventRequest, Chat, Message, User]),
    NotificationsModule,
    UsersModule,
    AnalyticsModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, EventsScheduler],
  exports: [EventsService],
})
export class EventsModule {}

