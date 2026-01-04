import { EventsService } from './events.service';
import { Event } from '../entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    create(eventData: CreateEventDto): Promise<Event>;
    findAll(city?: string): Promise<Event[]>;
    findByAuthor(authorId: string): Promise<Event[]>;
    findByParticipant(userId: string): Promise<Event[]>;
    removeParticipant(body: {
        eventId: string;
        userId: string;
        authorId: string;
    }): Promise<Event>;
    delete(id: string, body: {
        authorId: string;
    }): Promise<{
        success: boolean;
    }>;
    getRequests(eventId: string): Promise<import("../entities/event-request.entity").EventRequest[]>;
    createRequest(eventId: string, body: {
        userId: string;
    }): Promise<import("../entities/event-request.entity").EventRequest>;
    findOne(id: string): Promise<Event | null>;
    approveRequest(requestId: string): Promise<Event>;
    rejectRequest(requestId: string): Promise<void>;
    leaveEvent(eventId: string, body: {
        userId: string;
    }): Promise<Event>;
}
