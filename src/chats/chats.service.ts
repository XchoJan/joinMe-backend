import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { Event } from '../entities/event.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private chatsRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    private notificationsService: NotificationsService,
  ) {}

  async findOne(id: string): Promise<Chat | null> {
    return await this.chatsRepository.findOne({
      where: { id },
      relations: ['messages', 'messages.user'],
      order: { messages: { timestamp: 'ASC' } },
    });
  }

  async findByEvent(eventId: string): Promise<Chat | null> {
    return await this.chatsRepository.findOne({
      where: { eventId },
      relations: ['messages', 'messages.user'],
      order: { messages: { timestamp: 'ASC' } },
    });
  }

  async createMessage(
    chatId: string,
    userId: string,
    text: string,
  ): Promise<Message> {
    const message = this.messagesRepository.create({
      chatId,
      userId,
      text,
    });
    const savedMessage = await this.messagesRepository.save(message);
    
    // Загружаем связанного пользователя для ответа
    const messageWithUser = await this.messagesRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['user'],
    });
    
    // Отправляем push-уведомления участникам чата
    try {
      const chat = await this.chatsRepository.findOne({
        where: { id: chatId },
        relations: ['event'],
      });

      if (chat && chat.eventId) {
        const event = await this.eventsRepository.findOne({
          where: { id: chat.eventId },
        });

        if (event) {
          // Получаем всех участников чата кроме отправителя
          const participants = chat.participants.filter(id => id !== userId);
          
          // Получаем информацию об отправителе
          const sender = await this.usersRepository.findOne({
            where: { id: userId },
          });

          // Отправляем пуш каждому участнику
          for (const participantId of participants) {
            const participant = await this.usersRepository.findOne({
              where: { id: participantId },
            });

            if (participant?.fcmToken) {
              await this.notificationsService.sendNotification(
                participant.fcmToken,
                event.title, // Название события в заголовке
                text, // Текст сообщения в описании
                {
                  type: 'new_message',
                  chatId: chatId,
                  eventId: event.id,
                  messageId: savedMessage.id,
                  senderId: userId,
                  senderName: sender?.name || 'Пользователь',
                },
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending push notifications for new message:', error);
      // Не прерываем выполнение, если push не отправился
    }
    
    return messageWithUser || savedMessage;
  }

  async getMessages(chatId: string): Promise<Message[]> {
    return await this.messagesRepository.find({
      where: { chatId },
      relations: ['user'],
      order: { timestamp: 'ASC' },
    });
  }

  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    try {
      // Находим сообщение
      const message = await this.messagesRepository.findOne({
        where: { id: messageId },
        relations: ['chat', 'chat.event'],
      });

      if (!message) {
        throw new Error('Message not found');
      }

      // Проверяем, что пользователь является автором события
      const event = await this.eventsRepository.findOne({
        where: { id: message.chat.eventId },
      });

      if (!event) {
        throw new Error('Event not found');
      }

      if (event.authorId !== userId) {
        throw new Error('Only event author can delete messages');
      }

      // Удаляем сообщение
      await this.messagesRepository.remove(message);
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  async deleteAllMessages(chatId: string, userId: string): Promise<boolean> {
    try {
      // Находим чат
      const chat = await this.chatsRepository.findOne({
        where: { id: chatId },
        relations: ['event'],
      });

      if (!chat) {
        throw new Error('Chat not found');
      }

      // Проверяем, что пользователь является автором события
      const event = await this.eventsRepository.findOne({
        where: { id: chat.eventId },
      });

      if (!event) {
        throw new Error('Event not found');
      }

      if (event.authorId !== userId) {
        throw new Error('Only event author can delete messages');
      }

      // Удаляем все сообщения в чате
      await this.messagesRepository.delete({ chatId });
      return true;
    } catch (error) {
      console.error('Error deleting all messages:', error);
      throw error;
    }
  }
}

