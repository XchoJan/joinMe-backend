import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { ChatsModule } from './chats/chats.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadModule } from './upload/upload.module';
import { AdminModule } from './admin/admin.module';
import { User } from './entities/user.entity';
import { Event } from './entities/event.entity';
import { EventRequest } from './entities/event-request.entity';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { BlockedUser } from './entities/blocked-user.entity';
import { AnalyticsEvent } from './entities/analytics-event.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME', 'joinme'),
      entities: [User, Event, EventRequest, Chat, Message, BlockedUser, AnalyticsEvent],
        synchronize: configService.get<string>('NODE_ENV') !== 'production', // false в production
        migrations: ['dist/migrations/*.js'],
        migrationsRun: true, // Автоматически запускает миграции при старте
        logging: configService.get<string>('NODE_ENV') === 'development',
        ssl: configService.get<string>('NODE_ENV') === 'production' ? {
          rejectUnauthorized: false, // Для managed БД (AWS RDS, DigitalOcean)
        } : false,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    EventsModule,
    ChatsModule,
    NotificationsModule,
    UploadModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
