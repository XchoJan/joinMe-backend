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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const analytics_event_entity_1 = require("../entities/analytics-event.entity");
let AnalyticsService = class AnalyticsService {
    analyticsRepository;
    constructor(analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }
    async logEvent(type, userId, eventId, metadata) {
        try {
            const analyticsEvent = this.analyticsRepository.create({
                type,
                userId: userId || undefined,
                eventId: eventId || undefined,
                metadata: metadata ? JSON.stringify(metadata) : undefined,
            });
            await this.analyticsRepository.save(analyticsEvent);
        }
        catch (error) {
            console.error('Error logging analytics event:', error);
        }
    }
    async getUserCreatedCount(startDate, endDate) {
        const query = this.analyticsRepository
            .createQueryBuilder('event')
            .where('event.type = :type', { type: analytics_event_entity_1.AnalyticsEventType.USER_CREATED });
        if (startDate) {
            query.andWhere('event.createdAt >= :startDate', { startDate });
        }
        if (endDate) {
            query.andWhere('event.createdAt <= :endDate', { endDate });
        }
        return await query.getCount();
    }
    async getEventCreatedCount(startDate, endDate) {
        const query = this.analyticsRepository
            .createQueryBuilder('event')
            .where('event.type = :type', { type: analytics_event_entity_1.AnalyticsEventType.EVENT_CREATED });
        if (startDate) {
            query.andWhere('event.createdAt >= :startDate', { startDate });
        }
        if (endDate) {
            query.andWhere('event.createdAt <= :endDate', { endDate });
        }
        return await query.getCount();
    }
    async getEventRequestCount(startDate, endDate) {
        const query = this.analyticsRepository
            .createQueryBuilder('event')
            .where('event.type = :type', { type: analytics_event_entity_1.AnalyticsEventType.EVENT_REQUEST_CREATED });
        if (startDate) {
            query.andWhere('event.createdAt >= :startDate', { startDate });
        }
        if (endDate) {
            query.andWhere('event.createdAt <= :endDate', { endDate });
        }
        return await query.getCount();
    }
    async getStatistics(startDate, endDate) {
        const [userCreated, eventCreated, eventRequests] = await Promise.all([
            this.getUserCreatedCount(startDate, endDate),
            this.getEventCreatedCount(startDate, endDate),
            this.getEventRequestCount(startDate, endDate),
        ]);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dailyStats = await this.analyticsRepository
            .createQueryBuilder('event')
            .select("strftime('%Y-%m-%d', event.createdAt)", 'date')
            .addSelect('event.type', 'type')
            .addSelect('COUNT(*)', 'count')
            .where('event.createdAt >= :startDate', { startDate: thirtyDaysAgo })
            .groupBy("strftime('%Y-%m-%d', event.createdAt)")
            .addGroupBy('event.type')
            .orderBy('date', 'ASC')
            .getRawMany();
        const dailyStatsMap = {};
        dailyStats.forEach((stat) => {
            const date = stat.date;
            const type = stat.type;
            const count = parseInt(stat.count, 10);
            if (!dailyStatsMap[date]) {
                dailyStatsMap[date] = {};
            }
            dailyStatsMap[date][type] = count;
        });
        const dailyStatsArray = Object.entries(dailyStatsMap).map(([date, types]) => ({
            date,
            userCreated: types[analytics_event_entity_1.AnalyticsEventType.USER_CREATED] || 0,
            eventCreated: types[analytics_event_entity_1.AnalyticsEventType.EVENT_CREATED] || 0,
            eventRequests: types[analytics_event_entity_1.AnalyticsEventType.EVENT_REQUEST_CREATED] || 0,
        }));
        return {
            total: {
                userCreated,
                eventCreated,
                eventRequests,
            },
            daily: dailyStatsArray,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(analytics_event_entity_1.AnalyticsEvent)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map