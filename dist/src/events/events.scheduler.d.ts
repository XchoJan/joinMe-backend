import { OnModuleInit } from '@nestjs/common';
import { EventsService } from './events.service';
export declare class EventsScheduler implements OnModuleInit {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    onModuleInit(): Promise<void>;
    handleExpiredEvents(): Promise<void>;
}
