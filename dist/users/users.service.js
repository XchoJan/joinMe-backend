"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../entities/user.entity");
const blocked_user_entity_1 = require("../entities/blocked-user.entity");
const event_entity_1 = require("../entities/event.entity");
const chat_entity_1 = require("../entities/chat.entity");
const event_request_entity_1 = require("../entities/event-request.entity");
const message_entity_1 = require("../entities/message.entity");
const analytics_service_1 = require("../analytics/analytics.service");
const analytics_event_entity_1 = require("../entities/analytics-event.entity");
let UsersService = class UsersService {
    usersRepository;
    blockedUsersRepository;
    eventsRepository;
    chatsRepository;
    requestsRepository;
    messagesRepository;
    analyticsService;
    constructor(usersRepository, blockedUsersRepository, eventsRepository, chatsRepository, requestsRepository, messagesRepository, analyticsService) {
        this.usersRepository = usersRepository;
        this.blockedUsersRepository = blockedUsersRepository;
        this.eventsRepository = eventsRepository;
        this.chatsRepository = chatsRepository;
        this.requestsRepository = requestsRepository;
        this.messagesRepository = messagesRepository;
        this.analyticsService = analyticsService;
    }
    async create(userData) {
        if (userData.username) {
            const existingUser = await this.findByUsername(userData.username);
            if (existingUser) {
                throw new Error('Username already exists');
            }
        }
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }
        const user = this.usersRepository.create(userData);
        const savedUser = await this.usersRepository.save(user);
        await this.analyticsService.logEvent(analytics_event_entity_1.AnalyticsEventType.USER_CREATED, savedUser.id);
        return savedUser;
    }
    async findOne(id) {
        return await this.usersRepository.findOne({ where: { id } });
    }
    async update(id, userData) {
        if (userData.username) {
            const existingUser = await this.findByUsername(userData.username);
            if (existingUser && existingUser.id !== id) {
                throw new Error('Username already exists');
            }
        }
        if (userData.password) {
            if (!userData.password.startsWith('$2b$')) {
                userData.password = await bcrypt.hash(userData.password, 10);
            }
        }
        await this.usersRepository.update(id, userData);
        return await this.findOne(id);
    }
    async findAll() {
        return await this.usersRepository.find();
    }
    async blockUser(blockerId, blockedUserId) {
        const existing = await this.blockedUsersRepository.findOne({
            where: { blockerId, blockedUserId },
        });
        if (existing) {
            return existing;
        }
        const blockedUser = this.blockedUsersRepository.create({
            blockerId,
            blockedUserId,
        });
        await this.blockedUsersRepository.save(blockedUser);
        const authorEvents = await this.eventsRepository.find({
            where: { authorId: blockerId, status: 'active' },
        });
        for (const event of authorEvents) {
            if (event.participants.includes(blockedUserId)) {
                event.participants = event.participants.filter(id => id !== blockedUserId);
                if (event.currentParticipants && event.currentParticipants > 1) {
                    event.currentParticipants = event.currentParticipants - 1;
                }
                else {
                    event.currentParticipants = 1;
                }
                await this.eventsRepository.save(event);
                const chat = await this.chatsRepository.findOne({
                    where: { eventId: event.id },
                });
                if (chat && chat.participants.includes(blockedUserId)) {
                    chat.participants = chat.participants.filter(id => id !== blockedUserId);
                    await this.chatsRepository.save(chat);
                }
                await this.requestsRepository.update({ eventId: event.id, userId: blockedUserId, status: 'approved' }, { status: 'rejected' });
            }
        }
        return blockedUser;
    }
    async unblockUser(blockerId, blockedUserId) {
        await this.blockedUsersRepository.delete({
            blockerId,
            blockedUserId,
        });
    }
    async getBlockedUsers(blockerId) {
        const blockedUsers = await this.blockedUsersRepository.find({
            where: { blockerId },
        });
        const blockedUserIds = blockedUsers.map(bu => bu.blockedUserId);
        if (blockedUserIds.length === 0) {
            return [];
        }
        return await this.usersRepository.find({
            where: blockedUserIds.map(id => ({ id })),
        });
    }
    async isBlocked(blockerId, blockedUserId) {
        const blocked = await this.blockedUsersRepository.findOne({
            where: { blockerId, blockedUserId },
        });
        return !!blocked;
    }
    async findByUsername(username) {
        return await this.usersRepository.findOne({ where: { username } });
    }
    async login(username, password) {
        const user = await this.findByUsername(username);
        if (!user || !user.password) {
            throw new common_1.UnauthorizedException('Invalid username or password');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid username or password');
        }
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async delete(id) {
        const user = await this.findOne(id);
        if (!user) {
            throw new Error('User not found');
        }
        try {
            console.log(`Starting deletion of user ${id}`);
            console.log('Deleting user event requests...');
            await this.requestsRepository.delete({ userId: id });
            console.log('Finding user events...');
            const userEvents = await this.eventsRepository.find({ where: { authorId: id } });
            const eventIds = userEvents.map(e => e.id);
            console.log(`Found ${eventIds.length} events to delete`);
            if (eventIds.length > 0) {
                console.log('Deleting requests for user events...');
                await this.requestsRepository
                    .createQueryBuilder()
                    .delete()
                    .where('eventId IN (:...eventIds)', { eventIds })
                    .execute();
                console.log('Finding chats for user events...');
                const eventChats = await this.chatsRepository
                    .createQueryBuilder('chat')
                    .where('chat.eventId IN (:...eventIds)', { eventIds })
                    .getMany();
                const eventChatIds = eventChats.map(c => c.id);
                if (eventChatIds.length > 0) {
                    console.log(`Deleting ${eventChatIds.length} messages from event chats...`);
                    await this.messagesRepository
                        .createQueryBuilder()
                        .delete()
                        .where('chatId IN (:...chatIds)', { chatIds: eventChatIds })
                        .execute();
                    console.log('Deleting event chats...');
                    await this.chatsRepository
                        .createQueryBuilder()
                        .delete()
                        .where('id IN (:...chatIds)', { chatIds: eventChatIds })
                        .execute();
                }
                console.log('Deleting user events...');
                await this.eventsRepository.delete({ authorId: id });
            }
            console.log('Finding user chats...');
            const allChats = await this.chatsRepository.find();
            const userChats = allChats.filter(chat => {
                if (!chat.participants || !Array.isArray(chat.participants)) {
                    return false;
                }
                return chat.participants.includes(id) && !eventIds.includes(chat.eventId);
            });
            const userChatIds = userChats.map(c => c.id);
            console.log(`Found ${userChatIds.length} user chats to delete`);
            if (userChatIds.length > 0) {
                console.log('Deleting messages from user chats...');
                await this.messagesRepository
                    .createQueryBuilder()
                    .delete()
                    .where('chatId IN (:...chatIds)', { chatIds: userChatIds })
                    .execute();
                console.log('Deleting user chats...');
                await this.chatsRepository
                    .createQueryBuilder()
                    .delete()
                    .where('id IN (:...chatIds)', { chatIds: userChatIds })
                    .execute();
            }
            console.log('Deleting user blocks...');
            await this.blockedUsersRepository
                .createQueryBuilder()
                .delete()
                .where('blockerId = :id OR blockedUserId = :id', { id })
                .execute();
            console.log('Deleting user...');
            await this.usersRepository.delete(id);
            console.log(`User ${id} deleted successfully`);
        }
        catch (error) {
            console.error('Error deleting user:', error);
            console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
            throw error;
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(blocked_user_entity_1.BlockedUser)),
    __param(2, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(3, (0, typeorm_1.InjectRepository)(chat_entity_1.Chat)),
    __param(4, (0, typeorm_1.InjectRepository)(event_request_entity_1.EventRequest)),
    __param(5, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        analytics_service_1.AnalyticsService])
], UsersService);
//# sourceMappingURL=users.service.js.map