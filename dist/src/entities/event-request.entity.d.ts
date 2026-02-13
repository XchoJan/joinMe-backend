import { Event } from './event.entity';
import { User } from './user.entity';
export type RequestStatus = 'pending' | 'approved' | 'rejected';
export declare class EventRequest {
    id: string;
    eventId: string;
    event: Event;
    userId: string;
    user: User;
    status: RequestStatus;
    createdAt: Date;
}
