import { ChatsService } from './chats.service';
import { ChatsGateway } from './chats.gateway';
import { Message } from '../entities/message.entity';
export declare class ChatsController {
    private readonly chatsService;
    private readonly chatsGateway;
    constructor(chatsService: ChatsService, chatsGateway: ChatsGateway);
    findOne(id: string): Promise<import("../entities/chat.entity").Chat | null>;
    findByEvent(eventId: string): Promise<import("../entities/chat.entity").Chat | null>;
    getMessages(chatId: string): Promise<Message[]>;
    createMessage(chatId: string, body: {
        userId: string;
        text: string;
    }): Promise<Message>;
    deleteMessage(chatId: string, messageId: string, body: {
        userId: string;
    }): Promise<{
        success: boolean;
    }>;
    deleteAllMessages(chatId: string, body: {
        userId: string;
    }): Promise<{
        success: boolean;
    }>;
}
