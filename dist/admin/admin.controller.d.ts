import { AdminService } from './admin.service';
import { LoginDto } from './dto/login.dto';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';
import { Chat } from '../entities/chat.entity';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    login(loginDto: LoginDto): Promise<{
        token: string;
    }>;
    getAllEvents(): Promise<Event[]>;
    deleteEvent(id: string): Promise<void>;
    getAllUsers(): Promise<User[]>;
    deleteUser(id: string): Promise<void>;
    togglePremium(id: string): Promise<User>;
    getAllChats(): Promise<Chat[]>;
    deleteChat(id: string): Promise<void>;
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
