import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { ChatsModule } from './chats/chats.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadModule } from './upload/upload.module';
import { User } from './entities/user.entity';
import { Event } from './entities/event.entity';
import { EventRequest } from './entities/event-request.entity';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { BlockedUser } from './entities/blocked-user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'joinme.db',
      entities: [User, Event, EventRequest, Chat, Message, BlockedUser],
      synchronize: true, // Only for development
    }),
    UsersModule,
    EventsModule,
    ChatsModule,
    NotificationsModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
