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
exports.ChatsController = void 0;
const common_1 = require("@nestjs/common");
const chats_service_1 = require("./chats.service");
const chats_gateway_1 = require("./chats.gateway");
let ChatsController = class ChatsController {
    chatsService;
    chatsGateway;
    constructor(chatsService, chatsGateway) {
        this.chatsService = chatsService;
        this.chatsGateway = chatsGateway;
    }
    async findOne(id) {
        return await this.chatsService.findOne(id);
    }
    async findByEvent(eventId) {
        return await this.chatsService.findByEvent(eventId);
    }
    async getMessages(chatId) {
        return await this.chatsService.getMessages(chatId);
    }
    async createMessage(chatId, body) {
        const message = await this.chatsService.createMessage(chatId, body.userId, body.text);
        this.chatsGateway.broadcastMessage(chatId, message);
        return message;
    }
    async deleteMessage(chatId, messageId, body) {
        await this.chatsService.deleteMessage(messageId, body.userId);
        this.chatsGateway.broadcastMessageDeleted(chatId, messageId);
        return { success: true };
    }
    async deleteAllMessages(chatId, body) {
        await this.chatsService.deleteAllMessages(chatId, body.userId);
        this.chatsGateway.broadcastAllMessagesDeleted(chatId);
        return { success: true };
    }
};
exports.ChatsController = ChatsController;
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('event/:eventId'),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatsController.prototype, "findByEvent", null);
__decorate([
    (0, common_1.Get)(':id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatsController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)(':id/messages'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatsController.prototype, "createMessage", null);
__decorate([
    (0, common_1.Delete)(':chatId/messages/:messageId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('chatId')),
    __param(1, (0, common_1.Param)('messageId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ChatsController.prototype, "deleteMessage", null);
__decorate([
    (0, common_1.Delete)(':chatId/messages'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('chatId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatsController.prototype, "deleteAllMessages", null);
exports.ChatsController = ChatsController = __decorate([
    (0, common_1.Controller)('chats'),
    __metadata("design:paramtypes", [chats_service_1.ChatsService,
        chats_gateway_1.ChatsGateway])
], ChatsController);
//# sourceMappingURL=chats.controller.js.map