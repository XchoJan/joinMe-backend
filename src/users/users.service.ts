import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { BlockedUser } from '../entities/blocked-user.entity';
import { Event } from '../entities/event.entity';
import { Chat } from '../entities/chat.entity';
import { EventRequest } from '../entities/event-request.entity';

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
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return await this.usersRepository.save(user);
  }

  async findOne(id: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
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
}

