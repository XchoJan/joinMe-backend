import { User } from './user.entity';
import { EventRequest } from './event-request.entity';
import { Chat } from './chat.entity';
export type EventFormat = 'coffee' | 'walk' | 'lunch' | 'dinner' | 'activity' | 'other';
export type PaymentType = 'dutch' | 'my_treat' | 'your_treat' | 'free';
export type EventStatus = 'active' | 'completed' | 'cancelled';
export declare class Event {
    id: string;
    title: string;
    description: string;
    city: string;
    location: string;
    date: string;
    time: string;
    format: EventFormat;
    paymentType: PaymentType;
    participantLimit: number;
    currentParticipants: number;
    authorId: string;
    author: User;
    authorGender?: 'male' | 'female';
    status: EventStatus;
    participants: string[];
    createdAt: Date;
    requests: EventRequest[];
    chats: Chat[];
}
