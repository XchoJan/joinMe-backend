import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { EventRequest } from '../entities/event-request.entity';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { AnalyticsEventType } from '../entities/analytics-event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(EventRequest)
    private requestsRepository: Repository<EventRequest>,
    @InjectRepository(Chat)
    private chatsRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private notificationsService: NotificationsService,
    private usersService: UsersService,
    private analyticsService: AnalyticsService,
  ) {}

  async create(eventData: Partial<Event>): Promise<Event> {
    // Получаем пол автора из профиля пользователя
    let authorGender: 'male' | 'female' | undefined;
    if (eventData.authorId) {
      const author = await this.usersRepository.findOne({
        where: { id: eventData.authorId },
      });
      authorGender = author?.gender;
    }

    // Устанавливаем currentParticipants (по умолчанию 1)
    const currentParticipants = eventData.currentParticipants || 1;
    
    // Убеждаемся, что currentParticipants не больше лимита
    const validCurrentParticipants = Math.min(
      currentParticipants,
      eventData.participantLimit || 1
    );

    const event = this.eventsRepository.create({
      ...eventData,
      authorGender: eventData.authorGender || authorGender,
      currentParticipants: validCurrentParticipants,
      participants: eventData.authorId ? [eventData.authorId] : [],
    } as Event);
    const savedEvent = await this.eventsRepository.save(event);
    
    // Логируем создание события
    await this.analyticsService.logEvent(
      AnalyticsEventType.EVENT_CREATED,
      savedEvent.authorId,
      savedEvent.id,
    );
    
    return savedEvent;
  }

  async findAll(city?: string): Promise<Event[]> {
    const query = this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.author', 'author')
      .where('event.status = :status', { status: 'active' });

    if (city && city !== 'all') {
      query.andWhere('event.city = :city', { city });
    }

    return await query
      .orderBy('event.date', 'ASC')
      .addOrderBy('event.time', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<Event | null> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['author', 'requests', 'requests.user'],
    });
    return event;
  }

  async findByAuthor(authorId: string): Promise<Event[]> {
    return await this.eventsRepository.find({
      where: { authorId, status: 'active' },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByParticipant(userId: string): Promise<Event[]> {
    return await this.eventsRepository.find({
      where: { status: 'active' },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    }).then(events => 
      events.filter(event => 
        event.participants?.includes(userId) && event.authorId !== userId
      )
    );
  }

  async update(id: string, eventData: Partial<Event>): Promise<Event | null> {
    await this.eventsRepository.update(id, eventData);
    return await this.findOne(id);
  }

  async createRequest(eventId: string, userId: string): Promise<EventRequest> {
    // Проверяем, не заблокирован ли пользователь автором события
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

    // Логируем создание отклика на событие
    await this.analyticsService.logEvent(
      AnalyticsEventType.EVENT_REQUEST_CREATED,
      userId,
      eventId,
    );

    // Отправляем push-уведомление автору события
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
          const sent = await this.notificationsService.sendNotification(
            author.fcmToken,
            'Новая заявка на событие',
            `${requester.name} отправил(а) заявку на событие "${event.title}"`,
            {
              type: 'event_request',
              eventId: eventId,
              requestId: savedRequest.id,
              userId: userId,
            },
          );
          console.log(`[EventsService] Push notification sent: ${sent}`);
        } else {
          if (!author?.fcmToken) {
            console.warn(`[EventsService] Author ${event.authorId} has no FCM token. Push notification not sent.`);
          }
          if (!requester) {
            console.warn(`[EventsService] Requester ${userId} not found. Push notification not sent.`);
          }
        }
      } else {
        console.warn(`[EventsService] Event ${eventId} or authorId not found. Push notification not sent.`);
      }
    } catch (error) {
      console.error('[EventsService] Error sending push notification:', error);
      // Не прерываем выполнение, если push не отправился
    }

    return savedRequest;
  }

  async getRequests(eventId: string): Promise<EventRequest[]> {
    return await this.requestsRepository.find({
      where: { eventId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async approveRequest(requestId: string): Promise<Event> {
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
      // Увеличиваем currentParticipants на 1 при принятии заявки
      event.currentParticipants = (event.currentParticipants || 0) + 1;
      await this.eventsRepository.save(event);
    }

    // Create or update chat
    let chat = await this.chatsRepository.findOne({
      where: { eventId: request.eventId },
    });

    if (!chat) {
      chat = this.chatsRepository.create({
        eventId: request.eventId,
        participants: [event.authorId, request.userId],
      });
    } else if (!chat.participants.includes(request.userId)) {
      chat.participants = [...chat.participants, request.userId];
    }

    await this.chatsRepository.save(chat);

    const updatedEvent = await this.findOne(request.eventId);
    if (!updatedEvent) {
      throw new Error('Event not found');
    }
    return updatedEvent;
  }

  async rejectRequest(requestId: string): Promise<void> {
    await this.requestsRepository.update(requestId, { status: 'rejected' });
  }

  async delete(id: string, authorId: string): Promise<boolean> {
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

      // Находим все чаты для этого события
      const chats = await this.chatsRepository.find({
        where: { eventId: id },
      });

      // Удаляем все сообщения из всех чатов этого события
      for (const chat of chats) {
        try {
          await this.messagesRepository.delete({ chatId: chat.id });
        } catch (error) {
          console.error(`Error deleting messages for chat ${chat.id}:`, error);
          // Продолжаем даже если сообщения не удалились
        }
      }

      // Удаляем все чаты
      try {
        await this.chatsRepository.delete({ eventId: id });
      } catch (error) {
        console.error('Error deleting chats:', error);
        // Продолжаем даже если чаты не удалились
      }

      // Удаляем все запросы
      try {
        await this.requestsRepository.delete({ eventId: id });
      } catch (error) {
        console.error('Error deleting requests:', error);
        // Продолжаем даже если запросы не удалились
      }

      // Удаляем само событие
      await this.eventsRepository.remove(event);
      return true;
    } catch (error: any) {
      console.error('Error in delete method:', error);
      throw error;
    }
  }

  async removeParticipant(eventId: string, userId: string, authorId: string): Promise<Event> {
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

    // Нельзя удалить автора из участников
    if (userId === authorId) {
      throw new Error('Cannot remove the author from participants');
    }

    // Удаляем участника из списка
    event.participants = event.participants.filter(id => id !== userId);
    // Уменьшаем currentParticipants на 1 при удалении участника
    if (event.currentParticipants && event.currentParticipants > 1) {
      event.currentParticipants = event.currentParticipants - 1;
    } else {
      event.currentParticipants = 1; // Минимум 1 (автор)
    }
    await this.eventsRepository.save(event);

    // Удаляем участника из чата
    const chat = await this.chatsRepository.findOne({
      where: { eventId },
    });

    if (chat && chat.participants.includes(userId)) {
      chat.participants = chat.participants.filter(id => id !== userId);
      await this.chatsRepository.save(chat);
    }

    // Отклоняем все запросы этого пользователя на это событие
    await this.requestsRepository.update(
      { eventId, userId, status: 'approved' },
      { status: 'rejected' },
    );

    const updatedEvent = await this.findOne(eventId);
    if (!updatedEvent) {
      throw new Error('Event not found after removing participant');
    }
    return updatedEvent;
  }

  async leaveEvent(eventId: string, userId: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Нельзя покинуть событие, если ты автор
    if (event.authorId === userId) {
      throw new Error('Author cannot leave their own event');
    }

    if (!event.participants.includes(userId)) {
      throw new Error('User is not a participant of this event');
    }

    // Удаляем участника из списка
    event.participants = event.participants.filter(id => id !== userId);
    // Уменьшаем currentParticipants на 1 при выходе участника
    if (event.currentParticipants && event.currentParticipants > 1) {
      event.currentParticipants = event.currentParticipants - 1;
    } else {
      event.currentParticipants = 1; // Минимум 1 (автор)
    }
    await this.eventsRepository.save(event);

    // Удаляем участника из чата
    const chat = await this.chatsRepository.findOne({
      where: { eventId },
    });

    if (chat && chat.participants.includes(userId)) {
      chat.participants = chat.participants.filter(id => id !== userId);
      await this.chatsRepository.save(chat);
    }

    // Отклоняем все запросы этого пользователя на это событие
    await this.requestsRepository.update(
      { eventId, userId, status: 'approved' },
      { status: 'rejected' },
    );

    const updatedEvent = await this.findOne(eventId);
    if (!updatedEvent) {
      throw new Error('Event not found after leaving');
    }
    return updatedEvent;
  }
}

