import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(userData: CreateUserDto): Promise<User>;
    findOne(id: string): Promise<User | null>;
    update(id: string, userData: Partial<User>): Promise<User | null>;
    findAll(): Promise<User[]>;
    updateFcmToken(id: string, body: {
        fcmToken: string;
    }): Promise<User | null>;
    blockUser(blockerId: string, body: {
        blockedUserId: string;
    }): Promise<import("../entities/blocked-user.entity").BlockedUser>;
    unblockUser(blockerId: string, body: {
        blockedUserId: string;
    }): Promise<{
        success: boolean;
    }>;
    getBlockedUsers(blockerId: string): Promise<User[]>;
    isBlocked(blockerId: string, blockedUserId: string): Promise<{
        blocked: boolean;
    }>;
}
