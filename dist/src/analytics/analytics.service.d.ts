import { Repository } from 'typeorm';
import { AnalyticsEvent, AnalyticsEventType } from '../entities/analytics-event.entity';
export declare class AnalyticsService {
    private analyticsRepository;
    constructor(analyticsRepository: Repository<AnalyticsEvent>);
    logEvent(type: AnalyticsEventType, userId?: string, eventId?: string, metadata?: any): Promise<void>;
    getUserCreatedCount(startDate?: Date, endDate?: Date): Promise<number>;
    getEventCreatedCount(startDate?: Date, endDate?: Date): Promise<number>;
    getEventRequestCount(startDate?: Date, endDate?: Date): Promise<number>;
    getStatistics(startDate?: Date, endDate?: Date): Promise<{
        total: {
            userCreated: number;
            eventCreated: number;
            eventRequests: number;
        };
        daily: {
            date: string;
            userCreated: number;
            eventCreated: number;
            eventRequests: number;
        }[];
    }>;
}
