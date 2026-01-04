import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';
export declare class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private chatsService;
    server: Server;
    constructor(chatsService: ChatsService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinChat(client: Socket, data: {
        chatId: string;
    }): Promise<{
        status: string;
        chatId: string;
    }>;
    handleLeaveChat(client: Socket, data: {
        chatId: string;
    }): Promise<{
        status: string;
        chatId: string;
    }>;
    handleSendMessage(client: Socket, data: {
        chatId: string;
        userId: string;
        text: string;
    }): Promise<{
        status: string;
        message: import("../entities/message.entity").Message;
        error?: undefined;
    } | {
        status: string;
        error: any;
        message?: undefined;
    }>;
    broadcastMessage(chatId: string, message: any): void;
    broadcastMessageDeleted(chatId: string, messageId: string): void;
    broadcastAllMessagesDeleted(chatId: string): void;
}
