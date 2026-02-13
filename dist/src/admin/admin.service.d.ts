import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Event } from '../entities/event.entity';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { EventRequest } from '../entities/event-request.entity';
import { AnalyticsService } from '../analytics/analytics.service';
export declare class AdminService {
    private usersRepository;
    private eventsRepository;
    private chatsRepository;
    private messagesRepository;
    private requestsRepository;
    private analyticsService;
    constructor(usersRepository: Repository<User>, eventsRepository: Repository<Event>, chatsRepository: Repository<Chat>, messagesRepository: Repository<Message>, requestsRepository: Repository<EventRequest>, analyticsService: AnalyticsService);
    login(username: string, password: string): Promise<{
        token: string;
    }>;
    getAllEvents(): Promise<any[]>;
    deleteEvent(eventId: string): Promise<void>;
    getAllUsers(): Promise<User[]>;
    deleteUser(userId: string): Promise<void>;
    togglePremium(userId: string): Promise<User>;
    getAllChats(): Promise<any[]>;
    deleteChat(chatId: string): Promise<void>;
    getStatistics(): Promise<{
        totalUsers: number;
        totalEvents: number;
        totalChats: number;
        totalMessages: number;
        activeEvents: number;
        pendingRequests: number;
        eventsByCity: {
            city: string;
            count: number;
        }[];
        recentUsers: {
            date: any;
            count: number;
        }[];
        analytics: {
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
        };
    }>;
}
