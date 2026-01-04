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
exports.ChatsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chat_entity_1 = require("../entities/chat.entity");
const message_entity_1 = require("../entities/message.entity");
const user_entity_1 = require("../entities/user.entity");
const event_entity_1 = require("../entities/event.entity");
const notifications_service_1 = require("../notifications/notifications.service");
let ChatsService = class ChatsService {
    chatsRepository;
    messagesRepository;
    usersRepository;
    eventsRepository;
    notificationsService;
    constructor(chatsRepository, messagesRepository, usersRepository, eventsRepository, notificationsService) {
        this.chatsRepository = chatsRepository;
        this.messagesRepository = messagesRepository;
        this.usersRepository = usersRepository;
        this.eventsRepository = eventsRepository;
        this.notificationsService = notificationsService;
    }
    async findOne(id) {
        return await this.chatsRepository.findOne({
            where: { id },
            relations: ['messages', 'messages.user'],
            order: { messages: { timestamp: 'ASC' } },
        });
    }
    async findByEvent(eventId) {
        return await this.chatsRepository.findOne({
            where: { eventId },
            relations: ['messages', 'messages.user'],
            order: { messages: { timestamp: 'ASC' } },
        });
    }
    async createMessage(chatId, userId, text) {
        const message = this.messagesRepository.create({
            chatId,
            userId,
            text,
        });
        const savedMessage = await this.messagesRepository.save(message);
        const messageWithUser = await this.messagesRepository.findOne({
            where: { id: savedMessage.id },
            relations: ['user'],
        });
        try {
            const chat = await this.chatsRepository.findOne({
                where: { id: chatId },
                relations: ['event'],
            });
            if (chat && chat.eventId) {
                const event = await this.eventsRepository.findOne({
                    where: { id: chat.eventId },
                });
                if (event) {
                    const participants = chat.participants.filter(id => id !== userId);
                    const sender = await this.usersRepository.findOne({
                        where: { id: userId },
                    });
                    for (const participantId of participants) {
                        const participant = await this.usersRepository.findOne({
                            where: { id: participantId },
                        });
                        if (participant?.fcmToken) {
                            await this.notificationsService.sendNotification(participant.fcmToken, event.title, text, {
                                type: 'new_message',
                                chatId: chatId,
                                eventId: event.id,
                                messageId: savedMessage.id,
                                senderId: userId,
                                senderName: sender?.name || 'Пользователь',
                            });
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error('Error sending push notifications for new message:', error);
        }
        return messageWithUser || savedMessage;
    }
    async getMessages(chatId) {
        return await this.messagesRepository.find({
            where: { chatId },
            relations: ['user'],
            order: { timestamp: 'ASC' },
        });
    }
    async deleteMessage(messageId, userId) {
        try {
            const message = await this.messagesRepository.findOne({
                where: { id: messageId },
                relations: ['chat', 'chat.event'],
            });
            if (!message) {
                throw new Error('Message not found');
            }
            const event = await this.eventsRepository.findOne({
                where: { id: message.chat.eventId },
            });
            if (!event) {
                throw new Error('Event not found');
            }
            if (event.authorId !== userId) {
                throw new Error('Only event author can delete messages');
            }
            await this.messagesRepository.remove(message);
            return true;
        }
        catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    }
    async deleteAllMessages(chatId, userId) {
        try {
            const chat = await this.chatsRepository.findOne({
                where: { id: chatId },
                relations: ['event'],
            });
            if (!chat) {
                throw new Error('Chat not found');
            }
            const event = await this.eventsRepository.findOne({
                where: { id: chat.eventId },
            });
            if (!event) {
                throw new Error('Event not found');
            }
            if (event.authorId !== userId) {
                throw new Error('Only event author can delete messages');
            }
            await this.messagesRepository.delete({ chatId });
            return true;
        }
        catch (error) {
            console.error('Error deleting all messages:', error);
            throw error;
        }
    }
};
exports.ChatsService = ChatsService;
exports.ChatsService = ChatsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chat_entity_1.Chat)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], ChatsService);
//# sourceMappingURL=chats.service.js.map