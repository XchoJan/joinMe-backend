"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const events_controller_1 = require("./events.controller");
const events_service_1 = require("./events.service");
const events_scheduler_1 = require("./events.scheduler");
const event_entity_1 = require("../entities/event.entity");
const event_request_entity_1 = require("../entities/event-request.entity");
const chat_entity_1 = require("../entities/chat.entity");
const message_entity_1 = require("../entities/message.entity");
const user_entity_1 = require("../entities/user.entity");
const notifications_module_1 = require("../notifications/notifications.module");
const users_module_1 = require("../users/users.module");
const analytics_module_1 = require("../analytics/analytics.module");
let EventsModule = class EventsModule {
};
exports.EventsModule = EventsModule;
exports.EventsModule = EventsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([event_entity_1.Event, event_request_entity_1.EventRequest, chat_entity_1.Chat, message_entity_1.Message, user_entity_1.User]),
            notifications_module_1.NotificationsModule,
            users_module_1.UsersModule,
            analytics_module_1.AnalyticsModule,
        ],
        controllers: [events_controller_1.EventsController],
        providers: [events_service_1.EventsService, events_scheduler_1.EventsScheduler],
        exports: [events_service_1.EventsService],
    })
], EventsModule);
//# sourceMappingURL=events.module.js.map