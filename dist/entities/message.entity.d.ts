import { Chat } from './chat.entity';
import { User } from './user.entity';
export declare class Message {
    id: string;
    chatId: string;
    chat: Chat;
    userId: string;
    user: User;
    text: string;
    timestamp: Date;
}
