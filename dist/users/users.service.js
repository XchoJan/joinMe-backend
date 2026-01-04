"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const user_entity_1 = require("../entities/user.entity");
const blocked_user_entity_1 = require("../entities/blocked-user.entity");
const event_entity_1 = require("../entities/event.entity");
const chat_entity_1 = require("../entities/chat.entity");
const event_request_entity_1 = require("../entities/event-request.entity");
let UsersService = class UsersService {
    usersRepository;
    blockedUsersRepository;
    eventsRepository;
    chatsRepository;
    requestsRepository;
    constructor(usersRepository, blockedUsersRepository, eventsRepository, chatsRepository, requestsRepository) {
        this.usersRepository = usersRepository;
        this.blockedUsersRepository = blockedUsersRepository;
        this.eventsRepository = eventsRepository;
        this.chatsRepository = chatsRepository;
        this.requestsRepository = requestsRepository;
    }
    async create(userData) {
        const user = this.usersRepository.create(userData);
        return await this.usersRepository.save(user);
    }
    async findOne(id) {
        return await this.usersRepository.findOne({ where: { id } });
    }
    async update(id, userData) {
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(blocked_user_entity_1.BlockedUser)),
    __param(2, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(3, (0, typeorm_1.InjectRepository)(chat_entity_1.Chat)),
    __param(4, (0, typeorm_1.InjectRepository)(event_request_entity_1.EventRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map