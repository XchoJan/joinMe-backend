import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { Event } from '../entities/event.entity';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { EventRequest } from '../entities/event-request.entity';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(Chat)
    private chatsRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(EventRequest)
    private requestsRepository: Repository<EventRequest>,
    private analyticsService: AnalyticsService,
  ) {}

  async login(username: string, password: string): Promise<{ token: string }> {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username !== adminUsername || password !== adminPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Возвращаем токен (в продакшене лучше использовать JWT)
    const token = process.env.ADMIN_TOKEN || 'admin-secret-token-change-in-production';
    return { token };
  }

  async getAllEvents(): Promise<any[]> {
    const events = await this.eventsRepository.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });

    // Загружаем участников для каждого события
    const eventsWithParticipants = await Promise.all(
      events.map(async (event) => {
        const participantIds = event.participants || [];
        const participants = participantIds.length > 0
          ? await this.usersRepository.find({ where: { id: In(participantIds) } })
          : [];
        
        return {
          ...event,
          participants: participants || [],
        };
      })
    );

    return eventsWithParticipants;
  }

  async deleteEvent(eventId: string): Promise<void> {
    // Удаляем связанные чаты и сообщения
    const chats = await this.chatsRepository.find({
      where: { eventId },
    });

    for (const chat of chats) {
      await this.messagesRepository.delete({ chatId: chat.id });
      await this.chatsRepository.delete(chat.id);
    }

    // Удаляем заявки
    await this.requestsRepository.delete({ eventId });

    // Удаляем событие
    await this.eventsRepository.delete(eventId);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async deleteUser(userId: string): Promise<void> {
    // Удаляем события пользователя
    const userEvents = await this.eventsRepository.find({
      where: { authorId: userId },
    });

    for (const event of userEvents) {
      await this.deleteEvent(event.id);
    }

    // Удаляем заявки пользователя
    await this.requestsRepository.delete({ userId });

    // Удаляем сообщения пользователя
    await this.messagesRepository.delete({ userId });

    // Удаляем пользователя
    await this.usersRepository.delete(userId);
  }

  async togglePremium(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    user.premium = !user.premium;
    return await this.usersRepository.save(user);
  }

  async getAllChats(): Promise<any[]> {
    const chats = await this.chatsRepository.find({
      relations: ['event', 'messages', 'messages.user'],
      order: { createdAt: 'DESC' },
    });
    
    // Преобразуем timestamp в createdAt для фронтенда
    return chats.map(chat => ({
      ...chat,
      messages: chat.messages?.map((msg: any) => ({
        ...msg,
        createdAt: msg.timestamp,
      })) || [],
    }));
  }

  async deleteChat(chatId: string): Promise<void> {
    // Удаляем все сообщения чата
    await this.messagesRepository.delete({ chatId });
    // Удаляем чат
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

    // События по городам
    const events = await this.eventsRepository.find({
      select: ['city'],
    });
    const eventsByCity = events.reduce((acc, event) => {
      const city = event.city || 'Не указан';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsByCityArray = Object.entries(eventsByCity).map(([city, count]) => ({
      city,
      count,
    }));

    // Новые пользователи за последние 7 дней
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

    // Получаем статистику из Analytics
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
}

