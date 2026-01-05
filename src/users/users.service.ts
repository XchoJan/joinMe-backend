import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { BlockedUser } from '../entities/blocked-user.entity';
import { Event } from '../entities/event.entity';
import { Chat } from '../entities/chat.entity';
import { EventRequest } from '../entities/event-request.entity';
import { Message } from '../entities/message.entity';
import { AnalyticsService } from '../analytics/analytics.service';
import { AnalyticsEventType } from '../entities/analytics-event.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(BlockedUser)
    private blockedUsersRepository: Repository<BlockedUser>,
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(Chat)
    private chatsRepository: Repository<Chat>,
    @InjectRepository(EventRequest)
    private requestsRepository: Repository<EventRequest>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private analyticsService: AnalyticsService,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    // Проверяем уникальность username, если он предоставлен
    if (userData.username) {
      const existingUser = await this.findByUsername(userData.username);
      if (existingUser) {
        throw new Error('Username already exists');
      }
    }
    // Хешируем пароль, если он предоставлен
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    const user = this.usersRepository.create(userData);
    const savedUser = await this.usersRepository.save(user);
    
    // Логируем создание пользователя
    await this.analyticsService.logEvent(
      AnalyticsEventType.USER_CREATED,
      savedUser.id,
    );
    
    return savedUser;
  }

  async findOne(id: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    // Проверяем уникальность username, если он предоставлен и изменился
    if (userData.username) {
      const existingUser = await this.findByUsername(userData.username);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Username already exists');
      }
    }
    // Хешируем пароль, если он предоставлен и изменился
    if (userData.password) {
      // Проверяем, не захеширован ли уже пароль (bcrypt hash начинается с $2b$)
      if (!userData.password.startsWith('$2b$')) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }
    }
    await this.usersRepository.update(id, userData);
    return await this.findOne(id);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async blockUser(blockerId: string, blockedUserId: string): Promise<BlockedUser> {
    // Проверяем, не заблокирован ли уже
    const existing = await this.blockedUsersRepository.findOne({
      where: { blockerId, blockedUserId },
    });

    if (existing) {
      return existing;
    }

    // Блокируем пользователя
    const blockedUser = this.blockedUsersRepository.create({
      blockerId,
      blockedUserId,
    });
    await this.blockedUsersRepository.save(blockedUser);

    // Находим все события автора, где заблокированный пользователь является участником
    const authorEvents = await this.eventsRepository.find({
      where: { authorId: blockerId, status: 'active' },
    });

    // Исключаем заблокированного пользователя из всех событий автора
    for (const event of authorEvents) {
      if (event.participants.includes(blockedUserId)) {
        // Удаляем участника из списка
        event.participants = event.participants.filter(id => id !== blockedUserId);
        // Уменьшаем currentParticipants на 1
        if (event.currentParticipants && event.currentParticipants > 1) {
          event.currentParticipants = event.currentParticipants - 1;
        } else {
          event.currentParticipants = 1; // Минимум 1 (автор)
        }
        await this.eventsRepository.save(event);

        // Удаляем участника из чата
        const chat = await this.chatsRepository.findOne({
          where: { eventId: event.id },
        });

        if (chat && chat.participants.includes(blockedUserId)) {
          chat.participants = chat.participants.filter(id => id !== blockedUserId);
          await this.chatsRepository.save(chat);
        }

        // Отклоняем все запросы этого пользователя на это событие
        await this.requestsRepository.update(
          { eventId: event.id, userId: blockedUserId, status: 'approved' },
          { status: 'rejected' },
        );
      }
    }

    return blockedUser;
  }

  async unblockUser(blockerId: string, blockedUserId: string): Promise<void> {
    await this.blockedUsersRepository.delete({
      blockerId,
      blockedUserId,
    });
  }

  async getBlockedUsers(blockerId: string): Promise<User[]> {
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

  async isBlocked(blockerId: string, blockedUserId: string): Promise<boolean> {
    const blocked = await this.blockedUsersRepository.findOne({
      where: { blockerId, blockedUserId },
    });
    return !!blocked;
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { username } });
  }

  async login(username: string, password: string): Promise<User> {
    const user = await this.findByUsername(username);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Возвращаем пользователя без пароля
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async delete(id: string): Promise<void> {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }

    try {
      console.log(`Starting deletion of user ${id}`);
      
      // Удаляем заявки пользователя (где он подавал заявку) - сначала, чтобы избежать проблем с внешними ключами
      console.log('Deleting user event requests...');
      await this.requestsRepository.delete({ userId: id });

      // Удаляем события пользователя (и связанные заявки на эти события)
      console.log('Finding user events...');
      const userEvents = await this.eventsRepository.find({ where: { authorId: id } });
      const eventIds = userEvents.map(e => e.id);
      console.log(`Found ${eventIds.length} events to delete`);
      
      if (eventIds.length > 0) {
        // Удаляем заявки на события пользователя
        console.log('Deleting requests for user events...');
        await this.requestsRepository
          .createQueryBuilder()
          .delete()
          .where('eventId IN (:...eventIds)', { eventIds })
          .execute();
        
        // Удаляем чаты событий пользователя (и связанные сообщения)
        console.log('Finding chats for user events...');
        const eventChats = await this.chatsRepository
          .createQueryBuilder('chat')
          .where('chat.eventId IN (:...eventIds)', { eventIds })
          .getMany();
        const eventChatIds = eventChats.map(c => c.id);
        if (eventChatIds.length > 0) {
          console.log(`Deleting ${eventChatIds.length} messages from event chats...`);
          await this.messagesRepository
            .createQueryBuilder()
            .delete()
            .where('chatId IN (:...chatIds)', { chatIds: eventChatIds })
            .execute();
          console.log('Deleting event chats...');
          await this.chatsRepository
            .createQueryBuilder()
            .delete()
            .where('id IN (:...chatIds)', { chatIds: eventChatIds })
            .execute();
        }
        
        // Удаляем сами события
        console.log('Deleting user events...');
        await this.eventsRepository.delete({ authorId: id });
      }

      // Удаляем чаты пользователя (где он участник, но не автор события)
      console.log('Finding user chats...');
      const allChats = await this.chatsRepository.find();
      const userChats = allChats.filter(chat => {
        if (!chat.participants || !Array.isArray(chat.participants)) {
          return false;
        }
        return chat.participants.includes(id) && !eventIds.includes(chat.eventId);
      });
      const userChatIds = userChats.map(c => c.id);
      console.log(`Found ${userChatIds.length} user chats to delete`);
      
      if (userChatIds.length > 0) {
        // Удаляем сообщения из чатов пользователя
        console.log('Deleting messages from user chats...');
        await this.messagesRepository
          .createQueryBuilder()
          .delete()
          .where('chatId IN (:...chatIds)', { chatIds: userChatIds })
          .execute();
        // Удаляем сами чаты
        console.log('Deleting user chats...');
        await this.chatsRepository
          .createQueryBuilder()
          .delete()
          .where('id IN (:...chatIds)', { chatIds: userChatIds })
          .execute();
      }

      // Удаляем блокировки пользователя (где он блокирующий или заблокированный)
      console.log('Deleting user blocks...');
      await this.blockedUsersRepository
        .createQueryBuilder()
        .delete()
        .where('blockerId = :id OR blockedUserId = :id', { id })
        .execute();

      // Удаляем самого пользователя
      console.log('Deleting user...');
      await this.usersRepository.delete(id);
      console.log(`User ${id} deleted successfully`);
    } catch (error) {
      console.error('Error deleting user:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }
}

