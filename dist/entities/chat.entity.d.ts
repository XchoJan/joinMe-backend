import { Event } from './event.entity';
import { Message } from './message.entity';
export declare class Chat {
    id: string;
    eventId: string;
    event: Event;
    participants: string[];
    messages: Message[];
    createdAt: Date;
}
