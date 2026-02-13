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
exports.ChatsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const chats_service_1 = require("./chats.service");
let ChatsGateway = class ChatsGateway {
    chatsService;
    server;
    constructor(chatsService) {
        this.chatsService = chatsService;
    }
    afterInit(server) {
        console.log('✅ Socket.io server initialized');
    }
    handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`❌ Client disconnected: ${client.id}`);
    }
    async handleJoinChat(client, data) {
        client.join(`chat_${data.chatId}`);
        return { status: 'joined', chatId: data.chatId };
    }
    async handleLeaveChat(client, data) {
        client.leave(`chat_${data.chatId}`);
        return { status: 'left', chatId: data.chatId };
    }
    async handleSendMessage(client, data) {
        try {
            const message = await this.chatsService.createMessage(data.chatId, data.userId, data.text);
            this.server.to(`chat_${data.chatId}`).emit('new_message', {
                chatId: data.chatId,
                message,
            });
            return { status: 'sent', message };
        }
        catch (error) {
            return { status: 'error', error: error.message };
        }
    }
    broadcastMessage(chatId, message) {
        this.server.to(`chat_${chatId}`).emit('new_message', {
            chatId,
            message,
        });
    }
    broadcastMessageDeleted(chatId, messageId) {
        this.server.to(`chat_${chatId}`).emit('message_deleted', {
            chatId,
            messageId,
        });
    }
    broadcastAllMessagesDeleted(chatId) {
        this.server.to(`chat_${chatId}`).emit('all_messages_deleted', {
            chatId,
        });
    }
};
exports.ChatsGateway = ChatsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_chat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatsGateway.prototype, "handleJoinChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_chat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatsGateway.prototype, "handleLeaveChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatsGateway.prototype, "handleSendMessage", null);
exports.ChatsGateway = ChatsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        path: '/socket.io',
        namespace: '/',
        cors: {
            origin: '*',
            credentials: true,
            methods: ['GET', 'POST'],
        },
        transports: ['websocket', 'polling'],
        allowEIO3: true,
    }),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [chats_service_1.ChatsService])
], ChatsGateway);
//# sourceMappingURL=chats.gateway.js.map