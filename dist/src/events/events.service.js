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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_entity_1 = require("../entities/event.entity");
const event_request_entity_1 = require("../entities/event-request.entity");
const chat_entity_1 = require("../entities/chat.entity");
const message_entity_1 = require("../entities/message.entity");
const user_entity_1 = require("../entities/user.entity");
const notifications_service_1 = require("../notifications/notifications.service");
const users_service_1 = require("../users/users.service");
const analytics_service_1 = require("../analytics/analytics.service");
const analytics_event_entity_1 = require("../entities/analytics-event.entity");
let EventsService = class EventsService {
    eventsRepository;
    requestsRepository;
    chatsRepository;
    messagesRepository;
    usersRepository;
    notificationsService;
    usersService;
    analyticsService;
    constructor(eventsRepository, requestsRepository, chatsRepository, messagesRepository, usersRepository, notificationsService, usersService, analyticsService) {
        this.eventsRepository = eventsRepository;
        this.requestsRepository = requestsRepository;
        this.chatsRepository = chatsRepository;
        this.messagesRepository = messagesRepository;
        this.usersRepository = usersRepository;
        this.notificationsService = notificationsService;
        this.usersService = usersService;
        this.analyticsService = analyticsService;
    }
    async create(eventData) {
        let authorGender;
        if (eventData.authorId) {
            const author = await this.usersRepository.findOne({
                where: { id: eventData.authorId },
            });
            authorGender = author?.gender;
        }
        const currentParticipants = eventData.currentParticipants || 1;
        const validCurrentParticipants = Math.min(currentParticipants, eventData.participantLimit || 1);
        const event = this.eventsRepository.create({
            ...eventData,
            authorGender: eventData.authorGender || authorGender,
            currentParticipants: validCurrentParticipants,
            participants: eventData.authorId ? [eventData.authorId] : [],
        });
        const savedEvent = await this.eventsRepository.save(event);
        await this.analyticsService.logEvent(analytics_event_entity_1.AnalyticsEventType.EVENT_CREATED, savedEvent.authorId, savedEvent.id);
        return savedEvent;
    }
    async findAll(city) {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);
        const query = this.eventsRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.author', 'author')
            .where('event.status = :status', { status: 'active' })
            .andWhere('(event.date > :today OR (event.date = :today AND event.time >= :currentTime))', { today, currentTime });
        if (city && city !== 'all') {
            query.andWhere('event.city = :city', { city });
        }
        return await query
            .orderBy('event.date', 'ASC')
            .addOrderBy('event.time', 'ASC')
            .getMany();
    }
    async findOne(id) {
        const event = await this.eventsRepository.findOne({
            where: { id },
            relations: ['author', 'requests', 'requests.user'],
        });
        return event;
    }
    async findByAuthor(authorId) {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);
        return await this.eventsRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.author', 'author')
            .where('event.authorId = :authorId', { authorId })
            .andWhere('event.status = :status', { status: 'active' })
            .andWhere('(event.date > :today OR (event.date = :today AND event.time >= :currentTime))', { today, currentTime })
            .orderBy('event.createdAt', 'DESC')
            .getMany();
    }
    async findByParticipant(userId) {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);
        return await this.eventsRepository
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.author', 'author')
            .where('event.status = :status', { status: 'active' })
            .andWhere('(event.date > :today OR (event.date = :today AND event.time >= :currentTime))', { today, currentTime })
            .orderBy('event.createdAt', 'DESC')
            .getMany()
            .then(events => events.filter(event => event.participants?.includes(userId) && event.authorId !== userId));
    }
    async update(id, eventData) {
        await this.eventsRepository.update(id, eventData);
        return await this.findOne(id);
    }
    async createRequest(eventId, userId) {
        const event = await this.findOne(eventId);
        if (!event) {
            throw new Error('Event not found');
        }
        const isBlocked = await this.usersService.isBlocked(event.authorId, userId);
        if (isBlocked) {
            throw new Error('You are blocked by the event author');
        }
        const existingRequest = await this.requestsRepository.findOne({
            where: { eventId, userId, status: 'pending' },
        });
        if (existingRequest) {
            return existingRequest;
        }
        const request = this.requestsRepository.create({
            eventId,
            userId,
            status: 'pending',
        });
        const savedRequest = await this.requestsRepository.save(request);
        await this.analyticsService.logEvent(analytics_event_entity_1.AnalyticsEventType.EVENT_REQUEST_CREATED, userId, eventId);
        try {
            if (event && event.authorId) {
                const author = await this.usersRepository.findOne({
                    where: { id: event.authorId },
                });
                const requester = await this.usersRepository.findOne({
                    where: { id: userId },
                });
                console.log(`[EventsService] Creating request for event ${eventId} by user ${userId}`);
                console.log(`[EventsService] Event author: ${event.authorId}, Author FCM token: ${author?.fcmToken ? 'present' : 'missing'}`);
                console.log(`[EventsService] Requester: ${requester?.name || 'unknown'}`);
                if (author?.fcmToken && requester) {
                    console.log(`[EventsService] Sending push notification to author ${event.authorId}`);
                    const sent = await this.notificationsService.sendNotification(author.fcmToken, 'Новая заявка на событие', `${requester.name} отправил(а) заявку на событие "${event.title}"`, {
                        type: 'event_request',
                        eventId: eventId,
                        requestId: savedRequest.id,
                        userId: userId,
                    });
                    console.log(`[EventsService] Push notification sent: ${sent}`);
                }
                else {
                    if (!author?.fcmToken) {
                        console.warn(`[EventsService] Author ${event.authorId} has no FCM token. Push notification not sent.`);
                    }
                    if (!requester) {
                        console.warn(`[EventsService] Requester ${userId} not found. Push notification not sent.`);
                    }
                }
            }
            else {
                console.warn(`[EventsService] Event ${eventId} or authorId not found. Push notification not sent.`);
            }
        }
        catch (error) {
            console.error('[EventsService] Error sending push notification:', error);
        }
        return savedRequest;
    }
    async getRequests(eventId) {
        return await this.requestsRepository.find({
            where: { eventId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }
    async approveRequest(requestId) {
        const request = await this.requestsRepository.findOne({
            where: { id: requestId },
            relations: ['event'],
        });
        if (!request) {
            throw new Error('Request not found');
        }
        request.status = 'approved';
        await this.requestsRepository.save(request);
        const event = await this.findOne(request.eventId);
        if (!event) {
            throw new Error('Event not found');
        }
        if (!event.participants.includes(request.userId)) {
            event.participants = [...event.participants, request.userId];
            event.currentParticipants = (event.currentParticipants || 0) + 1;
            await this.eventsRepository.save(event);
        }
        let chat = await this.chatsRepository.findOne({
            where: { eventId: request.eventId },
        });
        if (!chat) {
            chat = this.chatsRepository.create({
                eventId: request.eventId,
                participants: [event.authorId, request.userId],
            });
        }
        else if (!chat.participants.includes(request.userId)) {
            chat.participants = [...chat.participants, request.userId];
        }
        await this.chatsRepository.save(chat);
        const updatedEvent = await this.findOne(request.eventId);
        if (!updatedEvent) {
            throw new Error('Event not found');
        }
        return updatedEvent;
    }
    async rejectRequest(requestId) {
        await this.requestsRepository.update(requestId, { status: 'rejected' });
    }
    async delete(id, authorId) {
        try {
            const event = await this.eventsRepository.findOne({
                where: { id },
            });
            if (!event) {
                throw new Error('Event not found');
            }
            if (event.authorId !== authorId) {
                throw new Error('You are not the author of this event');
            }
            const chats = await this.chatsRepository.find({
                where: { eventId: id },
            });
            for (const chat of chats) {
                try {
                    await this.messagesRepository.delete({ chatId: chat.id });
                }
                catch (error) {
                    console.error(`Error deleting messages for chat ${chat.id}:`, error);
                }
            }
            try {
                await this.chatsRepository.delete({ eventId: id });
            }
            catch (error) {
                console.error('Error deleting chats:', error);
            }
            try {
                await this.requestsRepository.delete({ eventId: id });
            }
            catch (error) {
                console.error('Error deleting requests:', error);
            }
            await this.eventsRepository.remove(event);
            return true;
        }
        catch (error) {
            console.error('Error in delete method:', error);
            throw error;
        }
    }
    async removeParticipant(eventId, userId, authorId) {
        const event = await this.eventsRepository.findOne({
            where: { id: eventId },
        });
        if (!event) {
            throw new Error('Event not found');
        }
        if (event.authorId !== authorId) {
            throw new Error('You are not the author of this event');
        }
        if (!event.participants.includes(userId)) {
            throw new Error('User is not a participant of this event');
        }
        if (userId === authorId) {
            throw new Error('Cannot remove the author from participants');
        }
        event.participants = event.participants.filter(id => id !== userId);
        if (event.currentParticipants && event.currentParticipants > 1) {
            event.currentParticipants = event.currentParticipants - 1;
        }
        else {
            event.currentParticipants = 1;
        }
        await this.eventsRepository.save(event);
        const chat = await this.chatsRepository.findOne({
            where: { eventId },
        });
        if (chat && chat.participants.includes(userId)) {
            chat.participants = chat.participants.filter(id => id !== userId);
            await this.chatsRepository.save(chat);
        }
        await this.requestsRepository.update({ eventId, userId, status: 'approved' }, { status: 'rejected' });
        const updatedEvent = await this.findOne(eventId);
        if (!updatedEvent) {
            throw new Error('Event not found after removing participant');
        }
        return updatedEvent;
    }
    async leaveEvent(eventId, userId) {
        const event = await this.eventsRepository.findOne({
            where: { id: eventId },
        });
        if (!event) {
            throw new Error('Event not found');
        }
        if (event.authorId === userId) {
            throw new Error('Author cannot leave their own event');
        }
        if (!event.participants.includes(userId)) {
            throw new Error('User is not a participant of this event');
        }
        event.participants = event.participants.filter(id => id !== userId);
        if (event.currentParticipants && event.currentParticipants > 1) {
            event.currentParticipants = event.currentParticipants - 1;
        }
        else {
            event.currentParticipants = 1;
        }
        await this.eventsRepository.save(event);
        const chat = await this.chatsRepository.findOne({
            where: { eventId },
        });
        if (chat && chat.participants.includes(userId)) {
            chat.participants = chat.participants.filter(id => id !== userId);
            await this.chatsRepository.save(chat);
        }
        await this.requestsRepository.update({ eventId, userId, status: 'approved' }, { status: 'rejected' });
        const updatedEvent = await this.findOne(eventId);
        if (!updatedEvent) {
            throw new Error('Event not found after leaving');
        }
        return updatedEvent;
    }
    async deleteExpiredEvents() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);
        const expiredEvents = await this.eventsRepository
            .createQueryBuilder('event')
            .where('event.status = :status', { status: 'active' })
            .andWhere('(event.date < :today OR (event.date = :today AND event.time < :currentTime))', { today, currentTime })
            .getMany();
        if (expiredEvents.length === 0) {
            return 0;
        }
        let deletedCount = 0;
        for (const event of expiredEvents) {
            try {
                const chats = await this.chatsRepository.find({
                    where: { eventId: event.id },
                });
                for (const chat of chats) {
                    try {
                        await this.messagesRepository.delete({ chatId: chat.id });
                    }
                    catch (error) {
                        console.error(`Error deleting messages for chat ${chat.id}:`, error);
                    }
                }
                try {
                    await this.chatsRepository.delete({ eventId: event.id });
                }
                catch (error) {
                    console.error('Error deleting chats:', error);
                }
                try {
                    await this.requestsRepository.delete({ eventId: event.id });
                }
                catch (error) {
                    console.error('Error deleting requests:', error);
                }
                await this.eventsRepository.remove(event);
                deletedCount++;
            }
            catch (error) {
                console.error(`Error deleting expired event ${event.id}:`, error);
            }
        }
        return deletedCount;
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(1, (0, typeorm_1.InjectRepository)(event_request_entity_1.EventRequest)),
    __param(2, (0, typeorm_1.InjectRepository)(chat_entity_1.Chat)),
    __param(3, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService,
        users_service_1.UsersService,
        analytics_service_1.AnalyticsService])
], EventsService);
//# sourceMappingURL=events.service.js.map