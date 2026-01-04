import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { BlockedUser } from '../entities/blocked-user.entity';
import { Event } from '../entities/event.entity';
import { Chat } from '../entities/chat.entity';
import { EventRequest } from '../entities/event-request.entity';
export declare class UsersService {
    private usersRepository;
    private blockedUsersRepository;
    private eventsRepository;
    private chatsRepository;
    private requestsRepository;
    constructor(usersRepository: Repository<User>, blockedUsersRepository: Repository<BlockedUser>, eventsRepository: Repository<Event>, chatsRepository: Repository<Chat>, requestsRepository: Repository<EventRequest>);
    create(userData: Partial<User>): Promise<User>;
    findOne(id: string): Promise<User | null>;
    update(id: string, userData: Partial<User>): Promise<User | null>;
    findAll(): Promise<User[]>;
    blockUser(blockerId: string, blockedUserId: string): Promise<BlockedUser>;
    unblockUser(blockerId: string, blockedUserId: string): Promise<void>;
    getBlockedUsers(blockerId: string): Promise<User[]>;
    isBlocked(blockerId: string, blockedUserId: string): Promise<boolean>;
}
