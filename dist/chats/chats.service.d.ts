import { Repository } from 'typeorm';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { Event } from '../entities/event.entity';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ChatsService {
    private chatsRepository;
    private messagesRepository;
    private usersRepository;
    private eventsRepository;
    private notificationsService;
    constructor(chatsRepository: Repository<Chat>, messagesRepository: Repository<Message>, usersRepository: Repository<User>, eventsRepository: Repository<Event>, notificationsService: NotificationsService);
    findOne(id: string): Promise<Chat | null>;
    findByEvent(eventId: string): Promise<Chat | null>;
    createMessage(chatId: string, userId: string, text: string): Promise<Message>;
    getMessages(chatId: string): Promise<Message[]>;
    deleteMessage(messageId: string, userId: string): Promise<boolean>;
    deleteAllMessages(chatId: string, userId: string): Promise<boolean>;
}
