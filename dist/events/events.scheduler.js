"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const events_service_1 = require("./events.service");
let EventsScheduler = class EventsScheduler {
    eventsService;
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    async onModuleInit() {
        try {
            const deletedCount = await this.eventsService.deleteExpiredEvents();
            if (deletedCount > 0) {
                console.log(`[EventsScheduler] On startup: Deleted ${deletedCount} expired event(s)`);
            }
        }
        catch (error) {
            console.error('[EventsScheduler] Error deleting expired events on startup:', error);
        }
    }
    async handleExpiredEvents() {
        try {
            const deletedCount = await this.eventsService.deleteExpiredEvents();
            if (deletedCount > 0) {
                console.log(`[EventsScheduler] Hourly cleanup: Deleted ${deletedCount} expired event(s)`);
            }
        }
        catch (error) {
            console.error('[EventsScheduler] Error deleting expired events:', error);
        }
    }
};
exports.EventsScheduler = EventsScheduler;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsScheduler.prototype, "handleExpiredEvents", null);
exports.EventsScheduler = EventsScheduler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsScheduler);
//# sourceMappingURL=events.scheduler.js.map