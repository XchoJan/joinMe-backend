import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsGateway } from './chats.gateway';
import { Message } from '../entities/message.entity';

@Controller('chats')
export class ChatsController {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly chatsGateway: ChatsGateway,
  ) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.chatsService.findOne(id);
  }

  @Get('event/:eventId')
  async findByEvent(@Param('eventId') eventId: string) {
    return await this.chatsService.findByEvent(eventId);
  }

  @Get(':id/messages')
  async getMessages(@Param('id') chatId: string): Promise<Message[]> {
    return await this.chatsService.getMessages(chatId);
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  async createMessage(
    @Param('id') chatId: string,
    @Body() body: { userId: string; text: string },
  ): Promise<Message> {
    const message = await this.chatsService.createMessage(
      chatId,
      body.userId,
      body.text,
    );
    
    // Отправляем сообщение через WebSocket
    this.chatsGateway.broadcastMessage(chatId, message);
    
    return message;
  }

  @Delete(':chatId/messages/:messageId')
  @HttpCode(HttpStatus.OK)
  async deleteMessage(
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
    @Body() body: { userId: string },
  ): Promise<{ success: boolean }> {
    await this.chatsService.deleteMessage(messageId, body.userId);
    
    // Уведомляем всех участников чата об удалении сообщения через WebSocket
    this.chatsGateway.broadcastMessageDeleted(chatId, messageId);
    
    return { success: true };
  }

  @Delete(':chatId/messages')
  @HttpCode(HttpStatus.OK)
  async deleteAllMessages(
    @Param('chatId') chatId: string,
    @Body() body: { userId: string },
  ): Promise<{ success: boolean }> {
    await this.chatsService.deleteAllMessages(chatId, body.userId);
    
    // Уведомляем всех участников чата об удалении всех сообщений через WebSocket
    this.chatsGateway.broadcastAllMessagesDeleted(chatId);
    
    return { success: true };
  }
}

