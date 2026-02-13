"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const users_module_1 = require("./users/users.module");
const events_module_1 = require("./events/events.module");
const chats_module_1 = require("./chats/chats.module");
const notifications_module_1 = require("./notifications/notifications.module");
const upload_module_1 = require("./upload/upload.module");
const admin_module_1 = require("./admin/admin.module");
const twogis_module_1 = require("./twogis/twogis.module");
const user_entity_1 = require("./entities/user.entity");
const event_entity_1 = require("./entities/event.entity");
const event_request_entity_1 = require("./entities/event-request.entity");
const chat_entity_1 = require("./entities/chat.entity");
const message_entity_1 = require("./entities/message.entity");
const blocked_user_entity_1 = require("./entities/blocked-user.entity");
const analytics_event_entity_1 = require("./entities/analytics-event.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 5432),
                    username: configService.get('DB_USERNAME', 'postgres'),
                    password: configService.get('DB_PASSWORD'),
                    database: configService.get('DB_NAME', 'joinme'),
                    entities: [user_entity_1.User, event_entity_1.Event, event_request_entity_1.EventRequest, chat_entity_1.Chat, message_entity_1.Message, blocked_user_entity_1.BlockedUser, analytics_event_entity_1.AnalyticsEvent],
                    synchronize: configService.get('NODE_ENV') !== 'production',
                    migrations: ['dist/migrations/*.js'],
                    migrationsRun: true,
                    logging: configService.get('NODE_ENV') === 'development',
                    ssl: configService.get('NODE_ENV') === 'production' ? {
                        rejectUnauthorized: false,
                    } : false,
                }),
                inject: [config_1.ConfigService],
            }),
            users_module_1.UsersModule,
            events_module_1.EventsModule,
            chats_module_1.ChatsModule,
            notifications_module_1.NotificationsModule,
            upload_module_1.UploadModule,
            admin_module_1.AdminModule,
            twogis_module_1.TwogisModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map