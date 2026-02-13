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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const event_entity_1 = require("../entities/event.entity");
const chat_entity_1 = require("../entities/chat.entity");
const message_entity_1 = require("../entities/message.entity");
const event_request_entity_1 = require("../entities/event-request.entity");
const analytics_service_1 = require("../analytics/analytics.service");
let AdminService = class AdminService {
    usersRepository;
    eventsRepository;
    chatsRepository;
    messagesRepository;
    requestsRepository;
    analyticsService;
    constructor(usersRepository, eventsRepository, chatsRepository, messagesRepository, requestsRepository, analyticsService) {
        this.usersRepository = usersRepository;
        this.eventsRepository = eventsRepository;
        this.chatsRepository = chatsRepository;
        this.messagesRepository = messagesRepository;
        this.requestsRepository = requestsRepository;
        this.analyticsService = analyticsService;
    }
    async login(username, password) {
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        if (username !== adminUsername || password !== adminPassword) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const token = process.env.ADMIN_TOKEN || 'admin-secret-token-change-in-production';
        return { token };
    }
    async getAllEvents() {
        const events = await this.eventsRepository.find({
            relations: ['author'],
            order: { createdAt: 'DESC' },
        });
        const eventsWithParticipants = await Promise.all(events.map(async (event) => {
            const participantIds = event.participants || [];
            const participants = participantIds.length > 0
                ? await this.usersRepository.find({ where: { id: (0, typeorm_2.In)(participantIds) } })
                : [];
            return {
                ...event,
                participants: participants || [],
            };
        }));
        return eventsWithParticipants;
    }
    async deleteEvent(eventId) {
        const chats = await this.chatsRepository.find({
            where: { eventId },
        });
        for (const chat of chats) {
            await this.messagesRepository.delete({ chatId: chat.id });
            await this.chatsRepository.delete(chat.id);
        }
        await this.requestsRepository.delete({ eventId });
        await this.eventsRepository.delete(eventId);
    }
    async getAllUsers() {
        return await this.usersRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async deleteUser(userId) {
        const userEvents = await this.eventsRepository.find({
            where: { authorId: userId },
        });
        for (const event of userEvents) {
            await this.deleteEvent(event.id);
        }
        await this.requestsRepository.delete({ userId });
        await this.messagesRepository.delete({ userId });
        await this.usersRepository.delete(userId);
    }
    async togglePremium(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        user.premium = !user.premium;
        return await this.usersRepository.save(user);
    }
    async getAllChats() {
        const chats = await this.chatsRepository.find({
            relations: ['event', 'messages', 'messages.user'],
            order: { createdAt: 'DESC' },
        });
        return chats.map(chat => ({
            ...chat,
            messages: chat.messages?.map((msg) => ({
                ...msg,
                createdAt: msg.timestamp,
            })) || [],
        }));
    }
    async deleteChat(chatId) {
        await this.messagesRepository.delete({ chatId });
        await this.chatsRepository.delete(chatId);
    }
    async getStatistics() {
        const totalUsers = await this.usersRepository.count();
        const totalEvents = await this.eventsRepository.count();
        const totalChats = await this.chatsRepository.count();
        const totalMessages = await this.messagesRepository.count();
        const activeEvents = await this.eventsRepository.count({
            where: { status: 'active' },
        });
        const pendingRequests = await this.requestsRepository.count({
            where: { status: 'pending' },
        });
        const events = await this.eventsRepository.find({
            select: ['city'],
        });
        const eventsByCity = events.reduce((acc, event) => {
            const city = event.city || 'Не указан';
            acc[city] = (acc[city] || 0) + 1;
            return acc;
        }, {});
        const eventsByCityArray = Object.entries(eventsByCity).map(([city, count]) => ({
            city,
            count,
        }));
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentUsers = await this.usersRepository
            .createQueryBuilder('user')
            .where('user.createdAt >= :date', { date: sevenDaysAgo })
            .select('DATE(user.createdAt)', 'date')
            .addSelect('COUNT(*)', 'count')
            .groupBy('DATE(user.createdAt)')
            .orderBy('date', 'ASC')
            .getRawMany();
        const recentUsersFormatted = recentUsers.map((item) => ({
            date: item.date,
            count: parseInt(item.count, 10),
        }));
        const analyticsStats = await this.analyticsService.getStatistics();
        return {
            totalUsers,
            totalEvents,
            totalChats,
            totalMessages,
            activeEvents,
            pendingRequests,
            eventsByCity: eventsByCityArray,
            recentUsers: recentUsersFormatted,
            analytics: analyticsStats,
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(2, (0, typeorm_1.InjectRepository)(chat_entity_1.Chat)),
    __param(3, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(4, (0, typeorm_1.InjectRepository)(event_request_entity_1.EventRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        analytics_service_1.AnalyticsService])
], AdminService);
//# sourceMappingURL=admin.service.js.map